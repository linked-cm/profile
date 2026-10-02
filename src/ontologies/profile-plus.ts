import {Prefix} from '@_linked/core/utils/Prefix';
import {createNameSpace} from '@_linked/core/utils/NameSpace';

export const ns = createNameSpace('http://lincd.org/ont/profile-plus/');
Prefix.add('profile-plus', 'http://lincd.org/ont/profile-plus/');

export const _self = ns('');
export const UserAccount = ns('UserAccount');
export const enabledLocationServices = ns('enabledLocationServices');
export const enabledNotifications = ns('enabledNotifications');
export const deviceId = ns('deviceId');

export const profilePlus = {
  UserAccount,
  enabledLocationServices,
  enabledNotifications,
  deviceId,
};

export const loadData = () =>
  import('../data/profile-plus.json', {with: {type: 'json'}}).then(
    (data) => data.default
  );
