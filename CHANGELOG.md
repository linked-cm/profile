# @linked.cm/profile

## 0.3.0

### Minor Changes

- [#6](https://github.com/linked-cm/profile/pull/6) [`16a2e0b`](https://github.com/linked-cm/profile/commit/16a2e0b703c48624e382b16e23db5b97a14537c7) Thanks [@flyon](https://github.com/flyon)! - Depend on `@_linked/react@^2.0.0` (was `^1.4.2`), and on the first releases of its linked dependencies that use it: `@_linked/primitives@^1.8.0` (was `^1.0.9`), `@_linked/schema@^1.5.0` (was `^1.1.2`) and `@_linked/sioc@^1.4.0` (was `1.x`). `@_linked/core` moves to `^2.27.0`, the core peer range `@_linked/react` 2 requires.

  The only thing used from `@_linked/react` is `createLinkedComponentFn`, which 2.0 did not change.

  `@_linked/auth` stays at `^1.2.4`. Auth 1.x still depends on `@_linked/react@^1`, so one copy of react 1 remains, nested under auth, until this package moves to auth 3 — a separate change, since auth 2 and 3 changed stored data and the token transport.

  Minor: this is a 0.x package and the change is a dependency move that consumers do not have to act on.

## 0.2.0

### Minor Changes

- [#1](https://github.com/linked-cm/profile/pull/1) [`7197451`](https://github.com/linked-cm/profile/commit/7197451f58f7202af06c6475d5c4cfa8e1db8f1a) Thanks [@abdipramana](https://github.com/abdipramana)! - Implement profile pictures and a language preference on the existing profile-pics and profile-plus terms. Shape registration stays `@linked.cm/profile`.

  `Person.languagePreference` reads `http://lincd.org/ont/profile-plus/languagePreference`.

  `ProfilePicture.crop` sends a pixel rectangle for a pending upload. The uploader posts the original file first:

  ```tsx
  import { ProfilePictureUploader } from "@linked.cm/profile/components/ProfilePictureUploader";

  <ProfilePictureUploader
    of={person}
    property="profilePicture"
    selectImage={selectImage}
    onUpdate={(croppedUrl) => {}}
  />;
  ```

  `selectImage` is optional. Omit it and the uploader uses a browser file input. A host that already has a camera or gallery passes the function so this package does not import that platform.

  `POST /api/profile-picture/upload` returns `{ uploadId, originalUrl, width, height }`. The crop dialog uses `originalUrl`. The graph changes only after `ProfilePicture.crop` succeeds. Pending uploads stay in memory on that server process for 15 minutes.

  `Avatar` shows `overwriteSource`, then the cropped primary picture, then the original, then `fallback` or the first letter of `givenName`.

  ```tsx
  import { Avatar } from "@linked.cm/profile/components/Avatar";

  <Avatar of={person} size="small" />;
  ```

  Import `ProfileBackendProvider` and `ProfilePictureProvider` from `@linked.cm/profile/backend` on the server only.
