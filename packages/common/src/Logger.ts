import MachinomyLogger from '@machinomy/logger'

export default class Logger extends MachinomyLogger {
  constructor (namespace: string, logDNAKey?: string, logDNAOptions?: any) {
    let onderNamespace = `onder:${namespace}`
    super(onderNamespace, logDNAKey, logDNAOptions)
  }
}
