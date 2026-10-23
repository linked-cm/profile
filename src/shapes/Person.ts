import {literalProperty, objectProperty} from '@_linked/core/shapes/SHACL';
import {schema} from '@_linked/schema/ontologies/schema';
import {Person as SchemaPerson} from '@_linked/schema/shapes/Person';
import {profile} from '../ontologies/profile.js';
import {linkedShape} from '../package.js';
import {ProfilePicture} from './ProfilePicture.js';

@linkedShape({
  // A profile of schema:Person: people stay schema:Person nodes, not a class of this package.
  sharedTargetClass: true,
})
export class Person extends SchemaPerson {
  static targetClass = schema.Person;

  @objectProperty({
    path: profile.hasProfilePicture,
    shape: ProfilePicture,
    maxCount: 1,
    required: false,
  })
  get profilePicture(): ProfilePicture {
    return undefined as unknown as ProfilePicture;
  }

  @objectProperty({path: profile.hasProfilePicture2, shape: ProfilePicture, maxCount: 1, required: false})
  get profilePicture2(): ProfilePicture { return undefined as unknown as ProfilePicture; }

  @objectProperty({path: profile.hasProfilePicture3, shape: ProfilePicture, maxCount: 1, required: false})
  get profilePicture3(): ProfilePicture { return undefined as unknown as ProfilePicture; }

  @objectProperty({path: profile.hasProfilePicture4, shape: ProfilePicture, maxCount: 1, required: false})
  get profilePicture4(): ProfilePicture { return undefined as unknown as ProfilePicture; }

  @objectProperty({path: profile.hasProfilePicture5, shape: ProfilePicture, maxCount: 1, required: false})
  get profilePicture5(): ProfilePicture { return undefined as unknown as ProfilePicture; }

  @objectProperty({path: profile.hasProfilePicture6, shape: ProfilePicture, maxCount: 1, required: false})
  get profilePicture6(): ProfilePicture { return undefined as unknown as ProfilePicture; }

  @literalProperty({
    path: profile.profileSetupCompleted,
    datatype: 'http://www.w3.org/2001/XMLSchema#boolean' as never,
    maxCount: 1,
  })
  get profileSetupCompleted(): boolean {
    return false;
  }

  @literalProperty({
    path: profile.languagePreference,
    required: false,
    maxCount: 1,
  })
  get languagePreference(): string {
    return '';
  }
}
