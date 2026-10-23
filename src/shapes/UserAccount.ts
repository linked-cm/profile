import {literalProperty} from '@_linked/core/shapes/SHACL';
import {UserAccount as SiocUserAccount} from '@_linked/sioc/shapes/UserAccount';
import {Boolean as BooleanShape} from '@_linked/xsd/shapes/Boolean';
import {xsd} from '@_linked/xsd/ontologies/xsd';
import {profile} from '../ontologies/profile.js';
import {linkedShape} from '../package.js';

@linkedShape
export class UserAccount extends SiocUserAccount {
  static targetClass = profile.UserAccount;

  @literalProperty({path: profile.enabledLocationServices, datatype: BooleanShape.targetClass})
  get enabledLocationServices(): boolean { return false; }

  @literalProperty({path: profile.enabledNotifications, datatype: BooleanShape.targetClass})
  get enabledNotifications(): boolean { return false; }

  /** Transitional PeaceGame device identity retained for data compatibility. */
  @literalProperty({path: profile.deviceId, datatype: xsd.string, maxCount: 1})
  get deviceId(): string { return ''; }
}
