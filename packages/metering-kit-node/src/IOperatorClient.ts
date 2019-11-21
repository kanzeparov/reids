import { ITrade } from '@onder/interfaces'

export interface Stats {
  sellerId: string
  buyerId: string
  time: number
  saleWh: number
  cost: string
}

export interface IOperatorClient {
  sendStats (stats: Stats): void
  sendTrade (trade: ITrade): void
}
