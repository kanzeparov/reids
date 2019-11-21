import { MutationTree } from 'vuex'

import { webproto } from '@onder/interfaces'
import { IProfileState } from './types'
import { shortenAccount } from '@/consumer/store/helpers'

export const mutations: MutationTree<IProfileState> = {
  setBalance ({ data }: IProfileState, balanceResponse: webproto.BalanceRoomResponse) {
    data.balanceEth = Number(balanceResponse.balanceEth)
    data.balanceChannel = Number(balanceResponse.balanceChannel)
    // data.energyBalance = Number(balanceResponse.energy_balance)
  },
  setAccount ({ data }: IProfileState, account: string) {
    data.account = account
    data.shortAccount = shortenAccount(account)
  },
  setIsSeller ({ data }: IProfileState, isSeller: boolean) {
    data.isSeller = isSeller
  },
  setAvatar ({ data }: IProfileState, avatar: string) {
    data.avatar = avatar
  },
  setTimezone ({ data }: IProfileState, timezone: number) {
    data.timezone = timezone
  },
  setAccountType ({ data }: IProfileState, accountType: string) {
    data.isSeller = accountType === 'seller'
  },
}
