import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import formidable from 'formidable';
import {BackendProvider} from '@_linked/server-utils/utils/BackendProvider';
import {callable} from '@_linked/server-utils/utils/callable';
import {ShapeProvider} from '@_linked/server-utils/utils/ShapeProvider';
import {uploadSingleFileFromBuffer} from '@_linked/server-utils/utils/Upload';
import {ProfilePicture} from './ProfilePicture.js';
import {
  isProfilePictureSlot,
  type ProfilePictureCropInput,
  type ProfilePictureCropResult,
  type ProfilePictureSlot,
  type ProfilePictureUploadResult,
} from '../types.js';
import {cropProfileImage, normalizeProfileImage} from '../utils/processProfileImage.js';
import {replaceProfilePictureImages} from '../utils/profilePictureGraph.js';
import {onAccountWillBeRemoved} from '@_linked/auth/utils/events';
import {cleanupProfileGraph} from '../utils/cleanupProfileGraph.js';
import type {UserAccountData} from '@_linked/auth/types/auth';

type PendingUpload = {
  accountId: string;
  property: ProfilePictureSlot;
  buffer: Buffer;
  fileName: string;
  originalUrl: string;
  width: number;
  height: number;
  expiresAt: number;
};

/**
 * Process-local pending originals. Enough for the initial single-process
 * deployment; another instance cannot see these buffers, so this is not
 * horizontally scalable. Expired entries are removed on a one-minute timer
 * and again at the start of every upload and crop. A successful crop removes
 * its own entry immediately.
 */
const pendingUploads = new Map<string, PendingUpload>();
const UPLOAD_TTL_MS = 15 * 60 * 1000;
const EXPIRY_SWEEP_MS = 60 * 1000;

function purgeExpiredUploads(now = Date.now()) {
  for (const [id, pending] of pendingUploads) {
    if (pending.expiresAt <= now) pendingUploads.delete(id);
  }
}

function firstFile(value: formidable.File | formidable.File[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * HTTP upload route and account-removal cleanup. LinkedServer runs boot
 * lifecycle hooks on generic providers, so the route is registered here,
 * before the generic `/api` fallback. Do not import this class from a client entry.
 *
 * Upload and crop both require `linkedAuth.userAccount`. The person id comes
 * from `accountOf`, never from the client, and the slot must be one of the
 * six fixed properties. Crop rejects a pending upload whose account or slot
 * is not the caller's.
 *
 * `uploadId` and the storage filename are `randomUUID()` values. The client
 * filename is not a storage path, so a caller cannot choose a storage name
 * or address another account's upload.
 *
 * Upload normalizes the bytes and stores that JPEG. It does not change the
 * picture graph. The crop UI loads `originalUrl`, whose dimensions are the
 * returned `width` and `height`, and sends a rectangle in that pixel space.
 * Graph links are written only after that crop succeeds. The previous
 * ImageObject nodes for the slot are deleted then. Their stored files are
 * not: the upload helper returns a public URL, not the store path
 * `LinkedFileStorage.deleteFile` requires. A cancelled crop leaves the
 * normalized file in storage.
 *
 * Normalized bytes stay in `pendingUploads` for 15 minutes. That map is
 * process-local, so another instance cannot crop an upload created here.
 *
 * `onAccountWillBeRemoved` returns an unsubscribe function, which `dispose`
 * calls. `cleanupProfileGraph` deletes linked RDF nodes without checking
 * whether another subject still references them.
 */
export class ProfileBackendProvider extends BackendProvider {
  private unsubscribeAccountRemoval?: () => void;
  private expiryTimer?: ReturnType<typeof setInterval>;

  setupBeforeControllers() {
    this.unsubscribeAccountRemoval?.();
    // Auth awaits this before deleting the account; a failure here stops the removal.
    this.unsubscribeAccountRemoval = onAccountWillBeRemoved<UserAccountData>(async (account) => {
      await cleanupProfileGraph(account);
    });
    if (this.expiryTimer) clearInterval(this.expiryTimer);
    const timer = setInterval(() => purgeExpiredUploads(), EXPIRY_SWEEP_MS);
    timer.unref?.();
    this.expiryTimer = timer;

    this.registerRoute('post', '/api/profile-picture/upload', async (req, res) => {
      purgeExpiredUploads();
      const account = req.linkedAuth?.userAccount;
      const personId = account?.accountOf?.id;
      const accountId = account?.id;
      if (!accountId || !personId) {
        res.status(401).json({error: 'Authentication required'});
        return;
      }

      const property = String(req.query.property || '');
      if (!isProfilePictureSlot(property)) {
        res.status(400).json({error: 'Invalid profile-picture slot'});
        return;
      }

      const [, files] = await formidable({maxFiles: 1, maxFileSize: 10 * 1024 * 1024}).parse(req);
      const file = firstFile(files.file ?? files.image);
      if (!file) {
        res.status(400).json({error: 'No image uploaded'});
        return;
      }

      const normalized = await normalizeProfileImage(await readFile(file.filepath));
      const fileName = `${randomUUID()}.jpg`;
      const originalUrl = await uploadSingleFileFromBuffer({
        buffer: normalized.buffer,
        fileName,
        allowedExtensions: ['jpg', 'jpeg'],
      });
      if (!originalUrl) throw new Error('Profile image upload failed');

      const uploadId = randomUUID();
      pendingUploads.set(uploadId, {
        accountId,
        property,
        buffer: normalized.buffer,
        fileName,
        originalUrl,
        width: normalized.width,
        height: normalized.height,
        expiresAt: Date.now() + UPLOAD_TTL_MS,
      });

      const result: ProfilePictureUploadResult = {
        uploadId,
        originalUrl,
        width: normalized.width,
        height: normalized.height,
      };
      res.json(result);
    });
  }

  dispose() {
    this.unsubscribeAccountRemoval?.();
    this.unsubscribeAccountRemoval = undefined;
    if (this.expiryTimer) clearInterval(this.expiryTimer);
    this.expiryTimer = undefined;
    this.disposeRoutes();
  }
}

/** Shape RPC provider for the crop step that follows an authenticated upload. */
export class ProfilePictureProvider extends ShapeProvider {
  public shape = ProfilePicture;

  @callable('user')
  async cropProfilePicture(input: ProfilePictureCropInput): Promise<ProfilePictureCropResult> {
    purgeExpiredUploads();
    const account = this.request?.linkedAuth?.userAccount;
    const personId = account?.accountOf?.id;
    if (!account?.id || !personId) throw new Error('Authentication required');
    if (!isProfilePictureSlot(input.property)) throw new Error('Invalid profile-picture slot');

    const upload = pendingUploads.get(input.uploadId);
    if (!upload || upload.expiresAt < Date.now()) {
      pendingUploads.delete(input.uploadId);
      throw new Error('Profile image upload expired or was not found');
    }
    if (upload.accountId !== account.id) {
      throw new Error('Profile image upload is not owned by this account');
    }
    if (upload.property !== input.property) {
      throw new Error('Invalid profile-picture slot');
    }

    const cropped = await cropProfileImage(upload.buffer, input.crop);
    const extension = path.extname(upload.fileName) || '.jpg';
    const croppedUrl = await uploadSingleFileFromBuffer({
      buffer: cropped,
      fileName: `${path.basename(upload.fileName, extension)}-cropped${extension}`,
      allowedExtensions: ['jpg', 'jpeg'],
    });
    if (!croppedUrl) throw new Error('Cropped profile image upload failed');

    await replaceProfilePictureImages(
      personId,
      input.property,
      upload.originalUrl,
      croppedUrl,
    );
    pendingUploads.delete(input.uploadId);
    return {croppedUrl};
  }
}
