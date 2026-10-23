// Runs against the built lib (`npm test` builds first). The profile ontology is one namespace,
// https://linked.cm/ont/profile/, shipped as Turtle; the package's shapes agree with it under the
// shape check `linked build` runs.
import assert from 'node:assert/strict';
import test from 'node:test';

import {Prefix} from '@_linked/core/utils/Prefix';
import {definedTermsFromTurtle} from '@_linked/core/ontology/hierarchy';
import {checkShapeHierarchy} from '@_linked/core/shapes/checkShapeHierarchy';
import {registerInstalledOntologies} from '@_linked/core/ontology/registerInstalled';
import {getAllNodeShapes, getTargetClassId} from '@_linked/core/utils/ShapeClass';
import {existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as profile from '../lib/esm/ontologies/profile.js';
import * as pics from '../lib/esm/ontologies/profile-pics.js';
import * as plus from '../lib/esm/ontologies/profile-plus.js';
import '../lib/esm/shapes/index.js';
import {packageName} from '../lib/esm/package.js';

const NAMESPACE = 'https://linked.cm/ont/profile/';
const DEPENDENCIES = ['@_linked/core', '@_linked/schema', '@_linked/sioc', '@_linked/xsd'];

/** The package root of an installed dependency, found from one of its modules. */
const packageDir = (name, entry) => {
  let dir = dirname(fileURLToPath(import.meta.resolve(`${name}/${entry}`)));
  while (!existsSync(join(dir, 'package.json'))) dir = dirname(dir);
  return dir;
};

// As `linked build`'s check does: register the dependencies' ontology data, then this package's.
await registerInstalledOntologies([
  packageDir('@_linked/schema', 'shapes/Person'),
  packageDir('@_linked/sioc', 'shapes/UserAccount'),
  packageDir('@_linked/xsd', 'shapes/Boolean'),
  fileURLToPath(new URL('..', import.meta.url)),
]);
const termIris = Object.values(profile.profile).map((term) => term.id);

test('mints every term under https://linked.cm/ont/profile/', () => {
  assert.equal(profile._self.id, NAMESPACE);
  assert.ok(termIris.every((iri) => iri.startsWith(NAMESPACE)));
  assert.equal(profile.hasProfilePicture.id, `${NAMESPACE}hasProfilePicture`);
  assert.equal(profile.UserAccount.id, `${NAMESPACE}UserAccount`);
  assert.equal(Prefix.getFullURI('profile'), NAMESPACE);
});

test('keeps the old namespaces and export names as deprecated aliases', () => {
  assert.equal(profile.legacyProfilePicsNs('image').id, 'http://lincd.org/ont/profile-pics/image');
  assert.equal(profile.legacyProfilePlusNs('deviceId').id, 'http://lincd.org/ont/profile-plus/deviceId');
  assert.equal(pics.profilePics.hasProfilePicture, profile.hasProfilePicture);
  assert.equal(plus.profilePlus.languagePreference, profile.languagePreference);
});

test('defines every exported term and every class a shape of this package targets', async () => {
  const defined = await definedTermsFromTurtle(await profile.loadData());
  const targets = [...getAllNodeShapes().values()]
    .map((shape) => getTargetClassId(shape))
    .filter((iri) => iri?.startsWith(NAMESPACE));
  assert.deepEqual([...termIris, ...targets].filter((iri) => !defined.has(iri)), []);
});

test('passes the shape check', async () => {
  const findings = await checkShapeHierarchy({
    dependencies: {[packageName]: DEPENDENCIES},
  });
  assert.deepEqual(
    findings
      .filter((f) => f.shape?.includes('/shape/profile/'))
      .map((f) => `${f.severity} ${f.kind}: ${f.message}`),
    []
  );
});
