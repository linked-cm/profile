/**
 * Server-only profile graph cleanup. Do not import from client entry points.
 */
export async function cleanupProfileGraph(): Promise<never> {
  throw new Error('@linked.cm/profile graph cleanup is not implemented yet');
}
