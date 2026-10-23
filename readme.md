# @linked.cm/profile

Reusable profile Shapes, profile-picture UI, and the authenticated upload/crop backend.

Every term lives in one ontology, `https://linked.cm/ont/profile/` (prefix `profile`), declared in `src/data/profile.ttl`. Before 1.0 the picture terms and `profileSetupCompleted` were on `http://lincd.org/ont/profile-pics/` and `UserAccount`, its settings and `languagePreference` on `http://lincd.org/ont/profile-plus/`; each term kept its local name, so an app with stored profiles rewrites both prefixes to the new one before upgrading. The old namespaces stay exported as the deprecated `legacyProfilePicsNs` and `legacyProfilePlusNs`.

`Person` is a profile of `schema:Person` (`sharedTargetClass`): people stay `schema:Person` nodes. `UserAccount` is its own class, a subclass of `sioc:UserAccount`. Shape registration uses `@linked.cm/profile`.

## Public entry points

| Import | What it is |
|---|---|
| `@linked.cm/profile` | `Person`, `UserAccount`, `ProfilePicture`, and the slot/upload/crop types |
| `@linked.cm/profile/shapes/Person` | `Person`, including optional `languagePreference` |
| `@linked.cm/profile/shapes/ProfilePicture` | `ProfilePicture.crop`, a `Server.call` into the crop provider |
| `@linked.cm/profile/components/Avatar` | Primary picture for any Person |
| `@linked.cm/profile/components/ProfilePictureUploader` | Choose, crop, and save one of the six slots |
| `@linked.cm/profile/ontologies/profile` | The profile ontology: every term, `profile`, `ns` |
| `@linked.cm/profile/ontologies/profile-pics` | Deprecated: re-exports `ontologies/profile` |
| `@linked.cm/profile/backend` | `ProfileBackendProvider` and `ProfilePictureProvider` |

A Person has exactly six picture slots: `profilePicture` through `profilePicture6`. Callers cannot pass an arbitrary property name.

## Upload, then crop

The uploader posts the chosen file to `POST /api/profile-picture/upload`. The server normalizes it to a bounded JPEG and returns `uploadId`, `originalUrl`, `width`, and `height`. The crop dialog uses that normalized image. Confirming sends the pixel rectangle through `ProfilePicture.crop`. The graph is updated only after that crop succeeds.

`selectImage` is optional. When a host supplies it, the package never imports that host's camera or file picker. Without it, the uploader uses a browser file input.

`uploadFetch` is also optional. Use it only when a native host cannot serialize `FormData` through its patched `fetch`; the callback receives the same URL and request options as `fetch` and must return a standard `Response`. Browser callers should omit it and retain normal browser `fetch` behavior.

Pending originals live in memory on the server process that accepted the upload, for 15 minutes. Another process cannot crop them.

## Avatar

`Avatar` reads the primary slot only. The image source is `overwriteSource`, then the cropped image, then the original, then `fallback` or the first letter of `givenName`. `profileImageUrl` accepts a direct URL or the current and older query shapes (`contentUrl`, `profilePictureCropped`, nested `cropped` / `original` / `image`). An ImageObject id is not treated as a URL.
