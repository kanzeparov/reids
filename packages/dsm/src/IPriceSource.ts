import { BigNumber } from 'bignumber.js'

export interface IPriceSource {
  currentPrice (now?: Date): Promise<BigNumber>
}
