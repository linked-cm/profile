---
'@linked.cm/profile': major
---

One ontology at `https://linked.cm/ont/profile/`, shipped as Turtle, with generated accessor modules.

- **New namespace.** `http://lincd.org/ont/profile-pics/` and `http://lincd.org/ont/profile-plus/`
  merge into `https://linked.cm/ont/profile/` (prefix `profile`); every term keeps its local name.
  Stored profiles, pictures and account settings are invisible to this release until the app
  rewrites both namespaces (predicates and `rdf:type` objects) to the new one. The
  `profile-pics` and `profile-plus` prefixes are no longer registered.
- **Generated accessor modules.** `src/data/profile.ttl` is the only source of terms;
  `linked generate-ontology` writes `ontologies/profile` (one named export per term),
  `ontologies/profile.data` (`ns`, `dataFiles`, `loadData`, `_ontologyResource`) and
  `ontologies/profile.register`. Import the terms as a namespace:
  `import * as profile from '@linked.cm/profile/ontologies/profile'`, and `ns`/`loadData` from
  `@linked.cm/profile/ontologies/profile.data`.
- **Removed:** the aggregated `profile`, `profilePics` and `profilePlus` objects, `_self` (now
  `_ontologyResource` in `ontologies/profile.data`), `legacyProfilePicsNs`,
  `legacyProfilePlusNs`, and the modules `ontologies/profile-pics` and `ontologies/profile-plus`
  (with their export subpath `./ontologies/profile-pics`). The JSON-LD data files are gone.
- `profile:UserAccount` is declared `rdfs:subClassOf sioc:UserAccount`. `Person` declares
  `sharedTargetClass: true`: it is a profile of `schema:Person`.
- The build ships `lib/esm/data/profile.ttl`, `shapes.ttl` and `components.ttl` (`Avatar`,
  `ProfilePictureUploader`, listed in the new `src/components/index.ts`).
- Requires `@_linked/core` ^2.46.0, `@_linked/schema` ^1.9.2, `@_linked/sioc` ^1.6.2,
  `@_linked/xsd` ^1.4.4, `@_linked/react` ^2.1.0, `@_linked/server-utils` ^1.17.0,
  `@_linked/auth` ^3.21.0, `@_linked/primitives` ^1.10.0 and `sharp` ^0.35.5; built with
  `@_linked/cli` ^1.61.0.
