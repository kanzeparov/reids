import { IMeterConfiguration } from '../configuration/meter'
import { IMeterValue } from './'

export default interface IMeter {
  configuration: IMeterConfiguration
  currentValue (): Promise<IMeterValue>
}
