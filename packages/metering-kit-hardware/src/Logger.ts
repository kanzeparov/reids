import { Logger as CommonLogger } from '@onder/common'

export default class Logger extends CommonLogger {
  constructor (namespace: string, logDNAKey?: string, logDNAOptions?: any) {
    let fullNamespace = `metering-kit-hardware:${namespace}`
    super(fullNamespace, logDNAKey, logDNAOptions)
  }
}
