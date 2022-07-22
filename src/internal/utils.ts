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

export function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined'
}

export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function'
}
