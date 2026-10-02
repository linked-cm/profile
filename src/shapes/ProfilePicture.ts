import {Shape} from '@_linked/core/shapes/Shape';
import {objectProperty} from '@_linked/core/shapes/SHACL';
import {ImageObject} from '@_linked/schema/shapes/ImageObject';
import {profilePics} from '../ontologies/profile-pics.js';
import {linkedShape} from '../package.js';

@linkedShape
export class ProfilePicture extends Shape {
  static targetClass = profilePics.ProfilePicture;

  @objectProperty({path: profilePics.image, shape: ImageObject, maxCount: 1})
  get image(): ImageObject {
    return undefined as unknown as ImageObject;
  }

  @objectProperty({path: profilePics.crop, shape: ImageObject, maxCount: 1})
  get cropped(): ImageObject {
    return undefined as unknown as ImageObject;
  }
}
