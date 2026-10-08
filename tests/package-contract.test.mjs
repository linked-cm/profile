import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const packageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8')
);

test('uses the approved community package identity', () => {
  assert.equal(packageJson.name, '@linked.cm/profile');
  assert.equal(
    packageJson.repository.url,
    'git+https://github.com/linked-cm/profile.git'
  );
});

test('exports only the approved public entry points', () => {
  assert.deepEqual(Object.keys(packageJson.exports).sort(), [
    '.',
    './backend',
    './components/Avatar',
    './components/ProfilePictureUploader',
    './ontologies/profile-pics',
    './shapes/Person',
    './shapes/ProfilePicture',
    './shapes/UserAccount',
  ]);
});

test('keeps server utilities out of the public export map', () => {
  assert.equal(packageJson.exports['./utils/*'], undefined);
  assert.deepEqual(packageJson.linked.serverOnly, [
    './backend',
    './shapes/ProfilePictureProvider',
    './utils/*',
  ]);
});
