---
'@linked.cm/profile': major
---

One ontology at `https://linked.cm/ont/profile/`, shipped as Turtle.

- `http://lincd.org/ont/profile-pics/` and `http://lincd.org/ont/profile-plus/` merge into
  `https://linked.cm/ont/profile/` (prefix `profile`); every term keeps its local name. Stored
  profiles, pictures and account settings are invisible to this release until the app rewrites
  both prefixes. The old namespaces stay exported as the deprecated `legacyProfilePicsNs` and
  `legacyProfilePlusNs`.
- `ontologies/profile` is the module (grouping object `profile`). `ontologies/profile-pics`,
  `ontologies/profile-plus`, `profilePics` and `profilePlus` remain as deprecated aliases of it.
  The `profile-pics` and `profile-plus` prefixes are no longer registered.
- `src/data/profile.ttl` replaces the two empty JSON-LD files and registers through
  `ontologies/profile.register`: `profile:UserAccount` is declared `rdfs:subClassOf
  sioc:UserAccount`, as its shape extends sioc's `UserAccount`.
- `Person` declares `sharedTargetClass: true`: it is a profile of `schema:Person`, which
  `linked build`'s shape check otherwise reports as a borrowed target class.
- Requires `@_linked/core` ^2.37.2, `@_linked/schema` ^1.6.0, `@_linked/sioc` ^1.5.0,
  `@_linked/xsd` ^1.3.1 and `sharp` ^0.35.5.
