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

test('preserves the production profile-pics RDF identity', () => {
  assert.match(ontology, /http:\/\/lincd\.org\/ont\/profile-pics\//);
});

test('uses the new package identity for Shape registration', () => {
  assert.match(packageSource, /linkedPackage\('@linked\.cm\/profile'\)/);
});

test('does not retain the accidental scaffold ontology', async () => {
  assert.doesNotMatch(ontology, /http:\/\/lincd\.org\/ont\/profile\//);
});
