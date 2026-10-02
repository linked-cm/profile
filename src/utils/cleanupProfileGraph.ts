/**
 * Server-only RDF cleanup for account removal. Do not import from client entry points.
 *
 * Image nodes are deleted before the ProfilePicture that points at them, then
 * the address and location nodes. Those are separate graph nodes, so removing
 * the account does not remove them. This does not delete the Person. It also
 * does not delete stored binaries: `ImageObject.delete` removes the graph
 * node only, and nothing here calls file storage. It does not check whether
 * another subject still references an image, address, or place before deleting it.
 */
import type {UserAccountData} from '@_linked/auth/types/auth';
import {ImageObject} from '@_linked/schema/shapes/ImageObject';
import {Place} from '@_linked/schema/shapes/Place';
import {PostalAddress} from '@_linked/schema/shapes/PostalAddress';
import {Person} from '../shapes/Person.js';
import {ProfilePicture} from '../shapes/ProfilePicture.js';
import {UserAccount} from '../shapes/UserAccount.js';
import {PROFILE_PICTURE_SLOTS} from '../types.js';

function nodeId(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as {id?: unknown}).id;
    return typeof id === 'string' ? id : undefined;
  }
}

async function resolvePersonId(account: UserAccountData) {
  if (account.accountOf?.id) return account.accountOf.id;
  if (!account.id) return undefined;
  const stored = await UserAccount.select((value) => ({accountOf: value.accountOf})).for(account.id);
  return nodeId(stored?.accountOf);
}

export async function cleanupProfileGraph(account: UserAccountData | undefined) {
  if (!account) return;
  const personId = await resolvePersonId(account);
  if (!personId) return;

  const person = await Person.select((value) => ({
    profilePicture: value.profilePicture,
    profilePicture2: value.profilePicture2,
    profilePicture3: value.profilePicture3,
    profilePicture4: value.profilePicture4,
    profilePicture5: value.profilePicture5,
    profilePicture6: value.profilePicture6,
    address: value.address,
    homeLocation: value.homeLocation,
    birthPlace: value.birthPlace,
  })).for(personId) as any;
  if (!person) return;

  for (const slot of PROFILE_PICTURE_SLOTS) {
    const picture = person[slot];
    const pictureId = nodeId(picture);
    if (!pictureId) continue;
    const loaded = await ProfilePicture.select((value) => ({image: value.image, cropped: value.cropped})).for(pictureId) as any;
    const imageId = nodeId(loaded?.image);
    const cropId = nodeId(loaded?.cropped);
    if (imageId) await ImageObject.delete(imageId);
    if (cropId) await ImageObject.delete(cropId);
    await ProfilePicture.delete(pictureId);
  }

  const addressId = nodeId(person.address);
  if (addressId) await PostalAddress.delete(addressId);
  const locations = Array.isArray(person.homeLocation) ? person.homeLocation : [person.homeLocation];
  for (const location of locations) {
    const id = nodeId(location);
    if (id) await Place.delete(id);
  }
  const birthPlaceId = nodeId(person.birthPlace);
  if (birthPlaceId) await Place.delete(birthPlaceId);
}
