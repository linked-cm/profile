# @linked.cm/profile

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
