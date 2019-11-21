import { PricingProgramContainer } from './PricingProgramContainer'
import { ConstantPriceProgram } from './programs/constant_price'
import { PeakBalancingProgram } from './programs/peak_balancing'

export namespace PricingProgram {
  export const ALL = new PricingProgramContainer()
    .append(ConstantPriceProgram)
    .append(PeakBalancingProgram)

  export const build = ALL.build.bind(ALL)
}
