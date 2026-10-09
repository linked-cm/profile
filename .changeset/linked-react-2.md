---
'@linked.cm/profile': minor
---

Depend on `@_linked/react@^2.0.0` (was `^1.4.2`), and on the first releases of its linked dependencies that use it: `@_linked/primitives@^1.8.0` (was `^1.0.9`), `@_linked/schema@^1.5.0` (was `^1.1.2`) and `@_linked/sioc@^1.4.0` (was `1.x`). `@_linked/core` moves to `^2.27.0`, the core peer range `@_linked/react` 2 requires.

The only thing used from `@_linked/react` is `createLinkedComponentFn`, which 2.0 did not change.

`@_linked/auth` stays at `^1.2.4`. Auth 1.x still depends on `@_linked/react@^1`, so one copy of react 1 remains, nested under auth, until this package moves to auth 3 — a separate change, since auth 2 and 3 changed stored data and the token transport.

Minor: this is a 0.x package and the change is a dependency move that consumers do not have to act on.
