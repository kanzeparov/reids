import { MutationTree } from 'vuex'
import { ITransactionState, ITransaction } from './types'

export const mutations: MutationTree<ITransactionState> = {
  setTransactions ({ data }: ITransactionState, transactions: Array<ITransaction>) {
    data.transactions = transactions
  },
}
