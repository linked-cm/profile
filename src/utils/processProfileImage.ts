/**
 * Server-only profile image processing. Do not import from client entry points.
 */
export async function processProfileImage(): Promise<never> {
  throw new Error('@linked.cm/profile image processing is not implemented yet');
}
