import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

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
const graph = await readFile(
  new URL('../src/utils/profilePictureGraph.ts', import.meta.url),
  'utf8'
);
const imageUrl = await readFile(
  new URL('../src/components/profileImageUrl.ts', import.meta.url),
  'utf8'
);
const imageUrlModule = await import(
  `data:text/javascript,${encodeURIComponent(ts.transpileModule(imageUrl, {
    compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022},
  }).outputText)}`
);
const {profileImageUrl} = imageUrlModule;

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

test('shows a successful crop immediately and refreshes its linked query', () => {
  assert.match(uploader, /setDisplayUrl\(result\.croppedUrl\)/);
  assert.match(uploader, /props\._refresh\?\.\(\)/);
});

test('links a new picture by id and verifies the person relation', () => {
  assert.match(graph, /picture: value\[property\]/);
  assert.match(graph, /\[property\]: \{id: pictureId\}/);
  assert.match(graph, /getNodeId\(updated\?\.picture\) !== pictureId/);
});

test('resolves current and compatibility image query results without using node ids', () => {
  assert.equal(profileImageUrl('https://cdn.test/direct.jpg'), 'https://cdn.test/direct.jpg');
  assert.equal(profileImageUrl({contentUrl: 'https://cdn.test/current.jpg'}), 'https://cdn.test/current.jpg');
  assert.equal(profileImageUrl({profilePictureCropped: 'https://cdn.test/cropped.jpg'}), 'https://cdn.test/cropped.jpg');
  assert.equal(profileImageUrl({cropped: {profilePictureCropped: 'https://cdn.test/nested.jpg'}}), 'https://cdn.test/nested.jpg');
  assert.equal(profileImageUrl({id: 'https://cdn.test/not-an-image.jpg'}), undefined);
  assert.match(uploader, /picture\.cropped\.select/);
  assert.match(uploader, /picture\.image\.select/);
  assert.match(uploader, /profileImageUrl\(current\?\.cropped\)/);
});

test('uses authenticated owned uploads and never fetches arbitrary image URLs', () => {
  assert.match(provider, /Authentication required/);
  assert.match(provider, /upload\.accountId !== account\.id/);
  assert.match(provider, /isProfilePictureSlot/);
  assert.match(provider, /@callable\('user'\)\s+async cropProfilePicture/);
  assert.doesNotMatch(provider, /node-fetch|fetch\(imageUrl/);
});

test('exports the React component factory from the package registration module', () => {
  assert.match(packageSource, /createLinkedComponentFn\(registerPackageExport/);
  assert.match(packageSource, /linkedComponent,/);
  assert.match(uploader, /from '\.\.\/package\.js'/);
});

test('sweeps expired uploads and unsubscribes account removal', () => {
  assert.match(provider, /class ProfileBackendProvider extends BackendProvider/);
  assert.match(provider, /purgeExpiredUploads/);
  assert.match(provider, /unsubscribeAccountRemoval\?\.\(\)/);
});

test('sends the upload through auth 3 refresh-and-retry, not a bare fetch', () => {
  assert.match(uploader, /import \{withAuthRetry\} from '@_linked\/auth\/utils\/authClient'/);
  assert.match(uploader, /const uploadFetch = withAuthRetry\(/);
  assert.match(uploader, /await uploadFetch\(\s*`\$\{root\}\/api\/profile-picture\/upload/);
  assert.doesNotMatch(uploader, /await fetch\(/);
});

test('keeps the account-removal unsubscribe auth 3 returns', () => {
  assert.match(provider, /this\.unsubscribeAccountRemoval = onAccountWillBeRemoved</);
});
