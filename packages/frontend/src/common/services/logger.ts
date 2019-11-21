import MachinomyLogger from '@machinomy/logger'
import * as JsLogger from 'js-logger'

let Config = require('../../config.json')

export default class Logger {
  private readonly machinomyLog: MachinomyLogger

  constructor (serviceName: string) {
    const logLevel = (Config.debug ? JsLogger.DEBUG : JsLogger.ERROR)
    JsLogger.useDefaults()
    JsLogger.setLevel(logLevel)

    this.machinomyLog = new MachinomyLogger(serviceName)
  }
  public error (errorMessage: string) {
    JsLogger.error(errorMessage)
    this.machinomyLog.error(errorMessage)
  }
  public info (infoMessage: string) {
    JsLogger.info(infoMessage)
    this.machinomyLog.info(infoMessage)
  }
}
