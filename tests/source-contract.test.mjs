import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const ontology = await readFile(
  new URL('../src/ontologies/profile-pics.ts', import.meta.url),
  'utf8'
);
const packageSource = await readFile(
  new URL('../src/package.ts', import.meta.url),
  'utf8'
);
const provider = await readFile(
  new URL('../src/shapes/ProfilePictureProvider.ts', import.meta.url),
  'utf8'
);
const uploader = await readFile(
  new URL('../src/components/ProfilePictureUploader.tsx', import.meta.url),
  'utf8'
);
const types = await readFile(
  new URL('../src/types.ts', import.meta.url),
  'utf8'
);

test('preserves the production profile-pics RDF identity', () => {
  assert.match(ontology, /http:\/\/lincd\.org\/ont\/profile-pics\//);
});

test('uses the new package identity for Shape registration', () => {
  assert.match(packageSource, /linkedPackage\('@linked\.cm\/profile'\)/);
});

test('does not retain the accidental scaffold ontology', async () => {
  assert.doesNotMatch(ontology, /http:\/\/lincd\.org\/ont\/profile\//);
});

test('allows exactly six profile picture slots', () => {
  const slots = [...types.matchAll(/'profilePicture\d*'/g)].map((match) => match[0]);
  assert.deepEqual(slots.slice(0, 6), [
    "'profilePicture'",
    "'profilePicture2'",
    "'profilePicture3'",
    "'profilePicture4'",
    "'profilePicture5'",
    "'profilePicture6'",
  ]);
  assert.doesNotMatch(types, /'accountOf'/);
});

test('keeps platform acquisition outside the profile package', () => {
  assert.doesNotMatch(uploader, /@capacitor|Camera\.getPhoto|FileTransfer/);
  assert.match(uploader, /selectImage/);
});

test('uses authenticated owned uploads and never fetches arbitrary image URLs', () => {
  assert.match(provider, /Authentication required/);
  assert.match(provider, /upload\.accountId !== account\.id/);
  assert.match(provider, /isProfilePictureSlot/);
  assert.doesNotMatch(provider, /node-fetch|fetch\(imageUrl/);
});

test('exports the React component factory from the package registration module', () => {
  assert.match(packageSource, /createLinkedComponentFn\(registerPackageExport/);
  assert.match(packageSource, /linkedComponent,/);
  assert.match(uploader, /from '\.\.\/package\.js'/);
});

test('sweeps expired uploads and unsubscribes account removal', () => {
  assert.match(provider, /purgeExpiredUploads/);
  assert.match(provider, /unsubscribeAccountRemoval\?\.\(\)/);
});
