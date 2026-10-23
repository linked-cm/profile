import {Shape} from '@_linked/core/shapes/Shape';
import {objectProperty} from '@_linked/core/shapes/SHACL';
import {ImageObject} from '@_linked/schema/shapes/ImageObject';
import {profile} from '../ontologies/profile.js';
import {linkedShape} from '../package.js';
import {Server} from '@_linked/server-utils/utils/Server';
import type {ProfilePictureCropInput, ProfilePictureCropResult} from '../types.js';

/**
 * Original and cropped images are separate `schema:ImageObject` nodes
 * (`profile:image` and `profile:crop`). Upload normalizes the file
 * and returns its URL, pixel size, and `uploadId`. The crop UI uses that
 * normalized image. {@link ProfilePicture.crop} then cuts the pending upload
 * and only then links the new image nodes.
 */
@linkedShape
export class ProfilePicture extends Shape {
  static targetClass = profile.ProfilePicture;

  @objectProperty({path: profile.image, shape: ImageObject, maxCount: 1})
  get image(): ImageObject {
    return undefined as unknown as ImageObject;
  }

  @objectProperty({path: profile.crop, shape: ImageObject, maxCount: 1})
  get cropped(): ImageObject {
    return undefined as unknown as ImageObject;
  }

  /**
   * Thin `Server.call` wrapper. The shape is isomorphic and must not read the
   * pending upload, check ownership, or write storage. That work is
   * `ProfilePictureProvider.cropProfilePicture`.
   */
  static crop(
    input: ProfilePictureCropInput
  ): Promise<ProfilePictureCropResult> {
    return Server.call(ProfilePicture, 'cropProfilePicture', input);
  }
}
