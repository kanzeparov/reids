import * as deepmerge from 'deepmerge'

const mergePair: Function = (deepmerge as any).default

export function deepMerge (...args: Array<object>): object {
  const [ head, ...tail ] = args
  const noTail = tail.length === 0

  return noTail ? head : mergePair(head, deepMerge(...tail))
}
