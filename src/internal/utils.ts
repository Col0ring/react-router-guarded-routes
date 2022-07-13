/**
 * assert
 */
export function invariant(cond: any, message: string): asserts cond {
  if (!cond) {
    throw new Error(message)
  }
}

export function noop() {}

export function isPromise<T = any>(value: any): value is Promise<T> {
  return value instanceof Promise
}

export function isNumber(value: any): value is number {
  return typeof value === 'number'
}

export function isString(value: any): value is string {
  return typeof value === 'string'
}
