import { default as CommonLogger } from '../Logger'

export default class Logger extends CommonLogger {
  constructor (namespace: string, logDNAKey?: string, logDNAOptions?: any) {
    let onderNamespace = `onder:${namespace}`
    super(onderNamespace, logDNAKey, logDNAOptions)
  }
}
