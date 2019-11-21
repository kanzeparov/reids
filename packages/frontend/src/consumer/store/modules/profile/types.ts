import { WebEventName } from '@onder/interfaces'
import { IRoomMeta } from '@/consumer/store/types'

export interface IProfileData {
  account: string | null
  shortAccount: string
  avatar: string
  isSeller: boolean
  timezone: number

  balanceEth: number
  balanceChannel: number
  energyBalance: number
}

export interface IProfileMeta {
  balanceRoomName: IRoomMeta['roomName']
  balanceRoomType: IRoomMeta['roomType']
  balanceRoomRequest: IRoomMeta['roomRequest']

  configEventName: WebEventName
}

export interface IProfileState {
  data: IProfileData
  meta: IProfileMeta
}
