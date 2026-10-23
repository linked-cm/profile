import {createNameSpace} from '@_linked/core/utils/NameSpace';
import {loadOntologyFiles} from '@_linked/core/ontology/loadOntologyFiles';

/** The package's ontology data, relative to this module (Turtle, copied into `lib/` by the build). */
export const dataFiles = ['../data/profile.ttl'];

/** Reads the package's ontology data (server only). */
export const loadData = () => loadOntologyFiles(import.meta.url, dataFiles);

/**
 * The profile ontology. First-party ontologies live at `https://linked.cm/ont/{slug}/`, one per
 * package, the slug being the package's public slug (`profile`).
 *
 * Until 1.0 these terms were split over two namespaces, `http://lincd.org/ont/profile-pics/`
 * (pictures, `profileSetupCompleted`) and `http://lincd.org/ont/profile-plus/` (`UserAccount`,
 * its settings, `languagePreference`). Every term keeps its local name here. Data stored under
 * the old namespaces is invisible to this release until it is rewritten to this one.
 */
export const ns = createNameSpace('https://linked.cm/ont/profile/');

export const _self = ns('');

/** @deprecated the profile-pics namespace before 1.0; stored data is rewritten to {@link ns}. */
export const legacyProfilePicsNs = createNameSpace('http://lincd.org/ont/profile-pics/');

/** @deprecated the profile-plus namespace before 1.0; stored data is rewritten to {@link ns}. */
export const legacyProfilePlusNs = createNameSpace('http://lincd.org/ont/profile-plus/');

// Pictures (formerly profile-pics)
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

// Accounts and preferences (formerly profile-plus)
export const UserAccount = ns('UserAccount');
export const enabledLocationServices = ns('enabledLocationServices');
export const enabledNotifications = ns('enabledNotifications');
export const deviceId = ns('deviceId');
export const languagePreference = ns('languagePreference');

export const profile = {
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
  UserAccount,
  enabledLocationServices,
  enabledNotifications,
  deviceId,
  languagePreference,
};

/** @deprecated use {@link profile}; these are the former profile-pics terms, now in {@link ns}. */
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

/** @deprecated use {@link profile}; these are the former profile-plus terms, now in {@link ns}. */
export const profilePlus = {
  UserAccount,
  enabledLocationServices,
  enabledNotifications,
  deviceId,
  languagePreference,
};
