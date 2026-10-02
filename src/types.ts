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

export interface SelectedProfileImage {
  file: File;
  previewUrl?: string;
}

export type ImageSelector = () => Promise<SelectedProfileImage | undefined>;

export interface ProfilePictureUploaderProps {
  property: ProfilePictureSlot;
  selectImage?: ImageSelector;
  onUpdate?: (croppedUrl: string) => void;
}

export interface ProfilePictureUploadResult {
  uploadId: string;
  originalUrl: string;
}

export interface ProfilePictureCropInput {
  uploadId: string;
  property: ProfilePictureSlot;
  crop: {x: number; y: number; width: number; height: number};
}

export interface ProfilePictureCropResult {
  croppedUrl: string;
}
