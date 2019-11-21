import { IRoomMeta } from '@/consumer/store/types'

export interface ITransactionData {
  /* Used in transactions table */
  transactionsLimit: number
  transactions: Array<ITransaction>
}

export interface ITransactionState {
  data: ITransactionData
  meta: IRoomMeta
}

export interface ITransaction {
  account: string
  shortAccount: string
  avatar: string
  power: string
  price: string
  der: string
  datetime: string
}
