export function noop() {}

export function createPromiseHandler() {
  let call: () => void = () => {}
  const promise = new Promise<void>((resolve) => {
    call = resolve
  })
  return {
    call,
    promise,
  }
}
