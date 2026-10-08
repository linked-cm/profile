function directImageUrl(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return undefined;

  const result = value as Record<string, unknown>;
  for (const key of ['contentUrl', 'profilePictureCropped', 'profilePictureOriginal']) {
    const field = result[key];
    if (typeof field === 'string') return field;
  }
}

/**
 * Resolve the URL from the current nested query result and from the flattened
 * alias shape emitted by earlier builds. Only known fields are inspected, so
 * an ImageObject id can never be mistaken for its content URL.
 */
export function profileImageUrl(value: unknown): string | undefined {
  const direct = directImageUrl(value);
  if (direct || !value || typeof value !== 'object') return direct;

  const result = value as Record<string, unknown>;
  for (const key of ['cropped', 'original', 'image']) {
    const nested = directImageUrl(result[key]);
    if (nested) return nested;
  }
  return undefined;
}
