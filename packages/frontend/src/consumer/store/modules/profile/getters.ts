import { GetterTree } from 'vuex'

import { RootState } from '@/consumer/store/types'
import { IProfileState } from './types'

export const getters: GetterTree<IProfileState, RootState> = {
  account ({ data }: IProfileState): string {
    return data.account!
  },

  balance ({ data }: IProfileState): number {
    return data.balanceEth + data.balanceChannel
  },

  isLoaded ({ data }: IProfileState): boolean {
    return data.account !== null
  },
}
