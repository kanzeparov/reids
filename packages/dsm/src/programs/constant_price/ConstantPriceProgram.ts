import { BigNumber } from 'bignumber.js'
import Logger from '../../Logger'
import { IPricingProgram } from '../../IPricingProgram'

const log = new Logger('constant-price-plugin')

export interface Args {
  price: string
}

export class ConstantPriceProgram implements IPricingProgram {
  readonly price: BigNumber

  constructor (args: Args) {
    this.price = new BigNumber(args.price)
    log.info('Set price', this.price.toString())
  }

  async currentPrice (): Promise<BigNumber> {
    log.info('Current price is', this.price.toString())
    return this.price
  }
}
