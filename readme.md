# @linked.cm/profile

Reusable profile Shapes, profile-picture UI, and the authenticated upload/crop backend.

Picture data stays on the existing `http://lincd.org/ont/profile-pics/` terms. `languagePreference` stays on `http://lincd.org/ont/profile-plus/languagePreference` so stored triples remain readable. Shape registration uses `@linked.cm/profile`.

## Public entry points

| Import | What it is |
|---|---|
| `@linked.cm/profile` | `Person`, `UserAccount`, `ProfilePicture`, and the slot/upload/crop types |
| `@linked.cm/profile/shapes/Person` | `Person`, including optional `languagePreference` |
| `@linked.cm/profile/shapes/ProfilePicture` | `ProfilePicture.crop`, a `Server.call` into the crop provider |
| `@linked.cm/profile/components/Avatar` | Primary picture for any Person |
| `@linked.cm/profile/components/ProfilePictureUploader` | Choose, crop, and save one of the six slots |
| `@linked.cm/profile/ontologies/profile-pics` | Legacy profile-pics terms |
| `@linked.cm/profile/backend` | `ProfileBackendProvider` and `ProfilePictureProvider` |

A Person has exactly six picture slots: `profilePicture` through `profilePicture6`. Callers cannot pass an arbitrary property name.

## Upload, then crop

The uploader posts the chosen file to `POST /api/profile-picture/upload`. The server normalizes it to a bounded JPEG and returns `uploadId`, `originalUrl`, `width`, and `height`. The crop dialog uses that normalized image. Confirming sends the pixel rectangle through `ProfilePicture.crop`. The graph is updated only after that crop succeeds.

`selectImage` is optional. When a host supplies it, the package never imports that host's camera or file picker. Without it, the uploader uses a browser file input.

Pending originals live in memory on the server process that accepted the upload, for 15 minutes. Another process cannot crop them.

## Avatar

`Avatar` reads the primary slot only. The image source is `overwriteSource`, then the cropped image, then the original, then `fallback` or the first letter of `givenName`. `profileImageUrl` accepts a direct URL or the current and older query shapes (`contentUrl`, `profilePictureCropped`, nested `cropped` / `original` / `image`). An ImageObject id is not treated as a URL.
