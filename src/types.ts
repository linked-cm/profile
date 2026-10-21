import type React from 'react';

/**
 * The six picture slots already stored on Person. Each name is the shape
 * property for an existing `profile-pics:hasProfilePicture[N]` predicate.
 * Keeping the fixed list is what lets current triples stay readable; a
 * collection or a caller-supplied property name would not.
 */
export const PROFILE_PICTURE_SLOTS = [
  'profilePicture',
  'profilePicture2',
  'profilePicture3',
  'profilePicture4',
  'profilePicture5',
  'profilePicture6',
] as const;

export type ProfilePictureSlot = (typeof PROFILE_PICTURE_SLOTS)[number];

export function isProfilePictureSlot(value: string): value is ProfilePictureSlot {
  return (PROFILE_PICTURE_SLOTS as readonly string[]).includes(value);
}

/** Bytes to upload. `previewUrl` is set when the host already has a display URL. */
export interface SelectedProfileImage {
  /**
   * Image bytes from this page. On iPhone, a `File` created with `new File()`
   * is not a `Blob`, and `FormData.append` rejects it.
   */
  file: Blob;
  /** Multipart name. Needed when `file` has no `File.name`. */
  filename?: string;
  previewUrl?: string;
}

/**
 * Injection point for image acquisition. The uploader uses a browser file
 * input when this is omitted. A native host (Capacitor camera or gallery)
 * supplies the function so this package never depends on that platform.
 */
export type ImageSelector = () => Promise<SelectedProfileImage | undefined>;

export interface ProfilePictureUploaderProps {
  /** Defaults to the primary `profilePicture` slot. */
  property?: ProfilePictureSlot;
  selectImage?: ImageSelector;
  /**
   * Optional host transport for platforms that cannot send a FormData upload
   * with their browser-compatible fetch implementation.
   */
  uploadFetch?: typeof fetch;
  onUpdate?: (croppedUrl: string) => void;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  aspectRatio?: number;
  confirmText?: string;
  className?: string;
  uploadIcon?: React.ReactNode;
  renderAction?: React.ReactNode;
}

/**
 * First step of upload-then-crop. The server has already normalized the
 * image. `originalUrl` is that JPEG, and `width`/`height` are its pixel
 * size. The crop UI must use this image, not the file the user picked.
 * `uploadId` is an opaque server id, not a storage path or the client filename.
 */
export interface ProfilePictureUploadResult {
  uploadId: string;
  originalUrl: string;
  width: number;
  height: number;
}

/**
 * Second step. `crop` is a pixel rectangle in the normalized image from
 * {@link ProfilePictureUploadResult}. The client does not send cropped bytes.
 */
export interface ProfilePictureCropInput {
  uploadId: string;
  property: ProfilePictureSlot;
  crop: {x: number; y: number; width: number; height: number};
}

/** Public URL of the cropped image written by the server. */
export interface ProfilePictureCropResult {
  croppedUrl: string;
}
