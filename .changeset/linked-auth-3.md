---
'@linked.cm/profile': minor
---

Depend on `@_linked/auth@^3.1.0` (was `^1.2.4`), so an app on `@_linked/react` 2 no longer installs `@_linked/react` 1 through auth 1.x.

Minor rather than patch: an app that installs this release runs auth 3, which changes what it stores and how browsers hold their tokens. This is a breaking change for consumers, and minor is the breaking-change bump for a 0.x package.

**Before deploying, the app must be ready for auth 3.** See auth's changelog for 2.0.0 and 3.0.0. Auth 2.0 moved every auth class and property from `http://lincd.org/ont/auth/` to `https://linked.cm/ont/auth/`. Until `migrateAuthNamespace(store)` from `@_linked/auth/utils/migrateNamespace` has run on each dataset that holds auth shapes, credentials written by auth 1.x are invisible and users cannot sign in. This package's own data (the `profile-pics` terms and the pictures) is unchanged and needs no migration.

Changes in this package for auth 3:

- `ProfilePictureUploader` sends its upload through auth's `withAuthRetry`. Auth 3 keeps a 15-minute access token in memory and holds the session in httpOnly cookies. With a plain `fetch`, an upload made after the token expired (for example, in a tab that had been asleep) could get a 401, and nothing refreshed the token or retried. The upload now refreshes an expired token first and retries once after a 401, as `Server.call` does. Right after a server-rendered load it has no token in memory, and the cookie authenticates the upload.
- `ProfileBackendProvider` always keeps the unsubscribe function that `onAccountWillBeRemoved` returns. Auth 3 now awaits the listener before it deletes the account, so if `cleanupProfileGraph` fails, the account is not removed.
