import { BigNumber } from 'bignumber.js'

export interface IDSMPlugin {
  name (): string
  init (pluginParams: Object): Promise<void>
  getPrice (): Promise<BigNumber>
  shutdown (): Promise<void>
}
