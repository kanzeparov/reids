import { IMeterConfiguration } from '@onder/interfaces'

export interface State {
  onderUrls: IMeterConfiguration[]
  connectionStatus: boolean
  loaderActive: boolean
}
