/* shortenAccount('0xde78f671ab67c86ecd7') -> '0xde78f…6ecd7' */
export const shortenAccount = (
  account: string,
  placeholder: string = '…',
  fromStart: number = 7,
  fromEnd: number = 5,
): string => {
  if (account.length <= fromStart + fromEnd) {
    return account
  }

  const headTail = [ account.slice(0, fromStart), account.slice(-fromEnd) ]
  return headTail.join(placeholder)
}

/* buildNumberWithDelimiter(127.984021) -> 127.98 */
export const numberWithDelimiter = (value: number | string, d: number = 2): string => {
  return Number(value).toFixed(d)
}
