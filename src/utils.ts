/**
 * assert
 */
export function invariant(cond: any, message: string): asserts cond {
  if (!cond) {
    throw new Error(message)
  }
}
