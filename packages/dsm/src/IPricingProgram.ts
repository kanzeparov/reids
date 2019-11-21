import { IPriceSource } from './IPriceSource'

export interface IPricingProgram extends IPriceSource {
  start? (): Promise<void>
  stop? (): Promise<void>
}
