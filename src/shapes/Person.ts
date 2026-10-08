import {literalProperty, objectProperty} from '@_linked/core/shapes/SHACL';
import {schema} from '@_linked/schema/ontologies/schema';
import {Person as SchemaPerson} from '@_linked/schema/shapes/Person';
import {profilePics} from '../ontologies/profile-pics.js';
import {profilePlus} from '../ontologies/profile-plus.js';
import {linkedShape} from '../package.js';
import {ProfilePicture} from './ProfilePicture.js';

@linkedShape
export class Person extends SchemaPerson {
  static targetClass = schema.Person;

  @objectProperty({
    path: profilePics.hasProfilePicture,
    shape: ProfilePicture,
    maxCount: 1,
    required: false,
  })
  get profilePicture(): ProfilePicture {
    return undefined as unknown as ProfilePicture;
  }

  @objectProperty({path: profilePics.hasProfilePicture2, shape: ProfilePicture, maxCount: 1, required: false})
  get profilePicture2(): ProfilePicture { return undefined as unknown as ProfilePicture; }

  @objectProperty({path: profilePics.hasProfilePicture3, shape: ProfilePicture, maxCount: 1, required: false})
  get profilePicture3(): ProfilePicture { return undefined as unknown as ProfilePicture; }

  @objectProperty({path: profilePics.hasProfilePicture4, shape: ProfilePicture, maxCount: 1, required: false})
  get profilePicture4(): ProfilePicture { return undefined as unknown as ProfilePicture; }

  @objectProperty({path: profilePics.hasProfilePicture5, shape: ProfilePicture, maxCount: 1, required: false})
  get profilePicture5(): ProfilePicture { return undefined as unknown as ProfilePicture; }

  @objectProperty({path: profilePics.hasProfilePicture6, shape: ProfilePicture, maxCount: 1, required: false})
  get profilePicture6(): ProfilePicture { return undefined as unknown as ProfilePicture; }

  @literalProperty({
    path: profilePics.profileSetupCompleted,
    datatype: 'http://www.w3.org/2001/XMLSchema#boolean' as never,
    maxCount: 1,
  })
  get profileSetupCompleted(): boolean {
    return false;
  }

  // Keep the legacy IRI so existing profile preferences remain readable while
  // ownership moves from profile-plus into this package.
  @literalProperty({
    path: profilePlus.languagePreference,
    required: false,
    maxCount: 1,
  })
  get languagePreference(): string {
    return '';
  }
}
