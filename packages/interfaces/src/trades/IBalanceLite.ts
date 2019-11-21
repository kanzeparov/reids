import BigNumber from 'bignumber.js'

export default interface IBalanceLite {
  balance: BigNumber
  on_channel: BigNumber
  owe: BigNumber
}
