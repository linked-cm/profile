/**
 * Server-only profile-picture graph operations. Do not import from client entry points.
 *
 * An existing picture node is reused so a new upload does not orphan it or
 * break the person's current predicate. A missing slot is created with
 * `ProfilePicture.create` and attached with `Person.update().for(personId)`.
 * Do not construct a live `ProfilePicture` and pass that across the update.
 */
import {ImageObject} from '@_linked/schema/shapes/ImageObject';
import {ProfilePicture} from '../shapes/ProfilePicture.js';
import {Person} from '../shapes/Person.js';
import type {ProfilePictureSlot} from '../types.js';

function getNodeId(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as {id?: unknown}).id;
    return typeof id === 'string' ? id : undefined;
  }
}

export async function ensureProfilePictureSlot(
  personId: string,
  property: ProfilePictureSlot,
  currentValue?: unknown
): Promise<string> {
  const existingId = getNodeId(currentValue);
  if (existingId) return existingId;

  const picture = await ProfilePicture.create({});
  const pictureId = getNodeId(picture);
  if (!pictureId) throw new Error('ProfilePicture.create returned no id');

  await Person.update({[property]: picture} as never).for(personId);
  return pictureId;
}

/**
 * Links the new original and cropped images, then deletes the ImageObject
 * nodes this slot previously referenced. The previous ids are read before
 * the update so the new nodes are not deleted. `ImageObject.delete` removes
 * the RDF node only. `uploadSingleFileFromBuffer` returns a public URL, and
 * `LinkedFileStorage.deleteFile` needs a store path, so the stored files are
 * left in place.
 *
 * This does not search for other subjects that still point at the old nodes.
 */
export async function replaceProfilePictureImages(
  personId: string,
  property: ProfilePictureSlot,
  currentValue: unknown,
  originalUrl: string,
  croppedUrl: string,
) {
  const pictureId = await ensureProfilePictureSlot(personId, property, currentValue);
  const existing = await ProfilePicture.select((value) => ({
    image: value.image,
    cropped: value.cropped,
  })).for(pictureId) as {image?: unknown; cropped?: unknown} | undefined;
  const previousImageId = getNodeId(existing?.image);
  const previousCropId = getNodeId(existing?.cropped);

  const image = await ImageObject.create({contentUrl: originalUrl});
  const cropped = await ImageObject.create({contentUrl: croppedUrl});
  await ProfilePicture.update({image, cropped}).for(pictureId);

  if (previousImageId) await ImageObject.delete(previousImageId);
  if (previousCropId && previousCropId !== previousImageId) await ImageObject.delete(previousCropId);
}
