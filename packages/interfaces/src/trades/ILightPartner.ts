import { BigNumber } from 'bignumber.js'
import * as moment from 'moment'
import { webproto } from '../proto'

export interface ILightPartner {
  account: string
  owes: BigNumber
  buysPower: BigNumber
  buysTotalPrice: BigNumber
  sellsPower: BigNumber
  sellsTotalPrice: BigNumber
  lastUpdate: moment.Moment
}

export class LightPartnerSerde {
  static serialize (value: ILightPartner) {
    return webproto.LightPartner.create({
      account: value.account,
      owes: value.owes.toString(),
      buysPower: value.buysPower.toString(),
      buysTotalPrice: value.buysTotalPrice.toString(),
      sellsPower: value.sellsPower.toString(),
      sellsTotalPrice: value.sellsTotalPrice.toString(),
      lastUpdate: value.lastUpdate.valueOf()
    })
  }
  static deserialize (obj: any): Readonly<ILightPartner> {
    const value = webproto.LightPartner.fromObject(obj)
    return {
      account: value.account,
      owes: new BigNumber(value.owes),
      buysPower: new BigNumber(value.buysPower),
      buysTotalPrice: new BigNumber(value.buysTotalPrice),
      sellsPower: new BigNumber(value.sellsPower),
      sellsTotalPrice: new BigNumber(value.sellsTotalPrice),
      lastUpdate: moment(value.lastUpdate)
    }
  }
}
