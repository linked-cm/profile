import {useCallback, useEffect, useRef, useState} from 'react';
import Cropper from 'react-easy-crop';
import {Button} from '@_linked/primitives/components/Button';
import {Dialog} from '@_linked/primitives/components/Dialog';
import {Spinner} from '@_linked/primitives/components/Spinner';
import {useAuth} from '@_linked/auth/hooks/useAuth';
import {withAuthRetry} from '@_linked/auth/utils/authClient';
import {linkedComponent} from '../package.js';
import {Person} from '../shapes/Person.js';
import {ProfilePicture} from '../shapes/ProfilePicture.js';
import type {
  ProfilePictureCropResult,
  ProfilePictureUploadResult,
  ProfilePictureUploaderProps,
  SelectedProfileImage,
} from '../types.js';
import {profileImageUrl} from './profileImageUrl.js';
import styles from './ProfilePictureUploader.module.css';

type CropArea = {x: number; y: number; width: number; height: number};

const uploadFetch = withAuthRetry((url, init) => fetch(url, init));

const pictureSelection = (profilePicture: any) =>
  profilePicture.select((picture: any) => ({
    cropped: picture.cropped.select((image: any) => ({
      contentUrl: image.contentUrl,
    })),
    image: picture.image.select((image: any) => ({
      contentUrl: image.contentUrl,
    })),
  }));

const query = Person.select((person) => ({
  profilePicture: pictureSelection(person.profilePicture),
  profilePicture2: pictureSelection(person.profilePicture2),
  profilePicture3: pictureSelection(person.profilePicture3),
  profilePicture4: pictureSelection(person.profilePicture4),
  profilePicture5: pictureSelection(person.profilePicture5),
  profilePicture6: pictureSelection(person.profilePicture6),
}));

export const ProfilePictureUploader = linkedComponent<
  typeof query,
  ProfilePictureUploaderProps
>(query, (props: any) => {
  const {
    property = 'profilePicture',
    selectImage,
    onUpdate,
    thumbnailWidth = 169,
    thumbnailHeight,
    aspectRatio = 3 / 2,
    confirmText = 'Save',
    className,
    uploadIcon,
    renderAction,
  } = props;
  const auth = useAuth<any>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<ProfilePictureUploadResult>();
  const [crop, setCrop] = useState({x: 0, y: 0});
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState<CropArea>();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const current = {
    profilePicture: props.profilePicture,
    profilePicture2: props.profilePicture2,
    profilePicture3: props.profilePicture3,
    profilePicture4: props.profilePicture4,
    profilePicture5: props.profilePicture5,
    profilePicture6: props.profilePicture6,
  }[property];
  const currentUrl = profileImageUrl(current?.cropped) || profileImageUrl(current?.image);
  const [displayUrl, setDisplayUrl] = useState<string | undefined>(currentUrl);

  // Keep the optimistic preview aligned when the linked query or selected slot changes.
  useEffect(() => setDisplayUrl(currentUrl), [currentUrl, property]);

  // Normalize on the server before the crop dialog opens. The cropper then uses `originalUrl`.
  const uploadNormalized = async (image: SelectedProfileImage) => {
    setBusy(true);
    setError(undefined);
    setUpload(undefined);
    setCrop({x: 0, y: 0});
    setZoom(1);
    setCropArea(undefined);
    try {
      const token = await auth.getAccessToken?.();
      const data = new FormData();
      data.append('file', image.file, image.file.name);
      const root = String(process.env.SITE_ROOT || '').replace(/\/$/, '');
      // Auth 3 keeps the access token in memory and refreshes it every few minutes. After a
      // server-rendered load there is none yet, and the httpOnly cookie authenticates the upload.
      // withAuthRetry refreshes an expired token first and retries once after a 401, like Server.call.
      const response = await uploadFetch(
        `${root}/api/profile-picture/upload?property=${encodeURIComponent(property)}`,
        {method: 'POST', headers: token ? {Authorization: `Bearer ${token}`} : {}, body: data}
      );
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || 'Image upload failed');
      const uploaded = (await response.json()) as ProfilePictureUploadResult;
      setUpload(uploaded);
      setOpen(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Image upload failed');
    } finally {
      setBusy(false);
    }
  };

  // `selectImage` is the native/host acquisition hook. Without it, the hidden file input is the browser path.
  // Either way, the cropper waits for the normalized upload and displays that URL.
  // A host preview of the original file is ignored so crop pixels stay in the server image's space.
  const chooseImage = async () => {
    if (selectImage) {
      const image = await selectImage();
      if (image) await uploadNormalized(image);
    } else {
      inputRef.current?.click();
    }
  };

  // The rectangle is in the normalized image. The server crops its stored copy of that same JPEG.
  const confirmCrop = async () => {
    if (!upload || !cropArea) return;
    setBusy(true);
    setError(undefined);
    try {
      const result: ProfilePictureCropResult = await ProfilePicture.crop({
        uploadId: upload.uploadId,
        property,
        crop: cropArea,
      });
      setOpen(false);
      setDisplayUrl(result.croppedUrl);
      onUpdate?.(result.croppedUrl);
      props._refresh?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Image upload failed');
    } finally {
      setBusy(false);
    }
  };

  const onCropComplete = useCallback((_percent: CropArea, pixels: CropArea) => setCropArea(pixels), []);

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <input
        ref={inputRef}
        className={styles.hiddenInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadNormalized({file});
          event.target.value = '';
        }}
      />
      <button
        type="button"
        className={styles.trigger}
        style={{width: thumbnailWidth, height: thumbnailHeight, aspectRatio}}
        onClick={chooseImage}
        disabled={busy}
        aria-label={props['aria-label'] || 'Choose profile picture'}
      >
        {busy && !open ? <Spinner /> : renderAction || (displayUrl ? <img src={displayUrl} alt="Profile" /> : uploadIcon || <span>+</span>)}
      </button>
      {error && !open && <p className={styles.error} role="alert">{error}</p>}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Content className={styles.dialog} hideCloseIcon>
          <Dialog.Header>
            <Dialog.Title>Crop profile picture</Dialog.Title>
          </Dialog.Header>
          <div className={styles.cropArea}>
            {upload?.originalUrl && (
              <Cropper
                image={upload.originalUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <Dialog.Footer>
            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            <Button type="button" onClick={confirmCrop} disabled={busy || !cropArea}>
              {busy ? <Spinner /> : confirmText}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
});
