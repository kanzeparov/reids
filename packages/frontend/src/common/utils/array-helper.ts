type obj = {
  [key: string]: any
}

type arr = Array<any>

/*[1, 2].reduce(sum, 0) -> 3 */
export const sum = (m: number, v: number): number => m + Number(v)

/* [{a: 1}, {a: 2}].reduce(sumBy('a'), 0) -> 3 */
export const sumBy = (k: string) => (m: number, v: obj): number => m + Number(v[k])

/* fitArrayToSizeLimit([1, 2, 3], 2) -> [2, 3] */
export const fitArrayToSizeLimit = (limit: number, initialArr: arr, keepEnd: boolean = true): arr => {
  const arrLimit: number = limit
  const arrSize: number = initialArr.length
  const isOversized: boolean = arrSize > arrLimit

  if (!isOversized) {
    return initialArr
  }

  if (keepEnd) {
    return initialArr.slice(arrSize - arrLimit)
  } else {
    return initialArr.slice(0, arrLimit)
  }
}
