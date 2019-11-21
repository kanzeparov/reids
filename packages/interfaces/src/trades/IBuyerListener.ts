import ITrade from './ITrade'

export default interface IBuyerListener {
  onBuy (trade: ITrade): Promise<void>
}
