import { webproto } from '../'
import BigNumber from 'bignumber.js'

export interface IBalanceRoomRequest {

}

export interface IBalanceRoomResponse {
  balance_eth: BigNumber
  balance_channel: BigNumber
  owe: BigNumber
}

export class BalanceRoomRequestSerde {
  static serialize (value: IBalanceRoomRequest) {
    return webproto.BalanceRoomRequest.create({
      type: webproto.RoomType.Balance
    })
  }
  static deserialize (obj: any): IBalanceRoomRequest {
    return webproto.BalanceRoomRequest.fromObject(obj)
  }
}

export class BalanceRoomResponseSerde {
  static serialize (value: IBalanceRoomResponse) {
    return webproto.BalanceRoomResponse.create({
      type: webproto.RoomType.Balance,
      balanceEth: value.balance_eth.toString(),
      balanceChannel: value.balance_channel.toString(),
      owe: value.owe.toString()
    })
  }
  static deserialize (obj: any): IBalanceRoomResponse {
    const value = webproto.BalanceRoomResponse.fromObject(obj)
    return {
      balance_eth: new BigNumber(value.balanceEth),
      balance_channel: new BigNumber(value.balanceChannel),
      owe: new BigNumber(value.owe)
    }
  }
}
