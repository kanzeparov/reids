/* istanbul ignore next */
export class UnreachableError extends Error {
  constructor (c: never) {
    super(`Unexpected object ${c}`)
  }
}
