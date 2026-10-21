---
'@linked.cm/profile': minor
---

`ProfilePictureUploader` now accepts an optional `uploadFetch` prop for hosts
whose browser-compatible `fetch` cannot serialize a `FormData` image upload.
Pass a fetch-compatible function that returns a `Response`; browser consumers
can omit the prop and continue using normal `fetch`.

```tsx
<ProfilePictureUploader
  of={person}
  uploadFetch={nativeUploadFetch}
/>
```
