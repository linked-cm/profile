import {ShapeProvider} from '@_linked/server-utils/utils/ShapeProvider';
import type {
  ProfilePictureCropInput,
  ProfilePictureCropResult,
  ProfilePictureSlot,
  ProfilePictureUploadResult,
} from '../types.js';
import {ProfilePicture} from './ProfilePicture.js';

export class ProfilePictureProvider extends ShapeProvider {
  public shape = ProfilePicture;

  async uploadProfilePicture(
    _property: ProfilePictureSlot
  ): Promise<ProfilePictureUploadResult> {
    throw new Error('@linked.cm/profile upload is not implemented yet');
  }

  async cropProfilePicture(
    _input: ProfilePictureCropInput
  ): Promise<ProfilePictureCropResult> {
    throw new Error('@linked.cm/profile crop is not implemented yet');
  }
}
