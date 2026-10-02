import {Prefix} from '@_linked/core/utils/Prefix';
import {createNameSpace} from '@_linked/core/utils/NameSpace';

export const ns = createNameSpace('http://lincd.org/ont/profile-pics/');
Prefix.add('profile-pics', 'http://lincd.org/ont/profile-pics/');

export const _self = ns('');
export const ProfilePicture = ns('ProfilePicture');
export const ProfilePictureSet = ns('ProfilePictureSet');
export const image = ns('image');
export const crop = ns('crop');
export const hasProfilePicture = ns('hasProfilePicture');
export const hasProfilePicture2 = ns('hasProfilePicture2');
export const hasProfilePicture3 = ns('hasProfilePicture3');
export const hasProfilePicture4 = ns('hasProfilePicture4');
export const hasProfilePicture5 = ns('hasProfilePicture5');
export const hasProfilePicture6 = ns('hasProfilePicture6');
export const hasProfilePictures = ns('hasProfilePictures');
export const profileSetupCompleted = ns('profileSetupCompleted');

export const profilePics = {
  ProfilePicture,
  ProfilePictureSet,
  image,
  crop,
  hasProfilePicture,
  hasProfilePicture2,
  hasProfilePicture3,
  hasProfilePicture4,
  hasProfilePicture5,
  hasProfilePicture6,
  hasProfilePictures,
  profileSetupCompleted,
};

export const loadData = () =>
  import('../data/profile-pics.json', {with: {type: 'json'}}).then(
    (data) => data.default
  );
