import { IError, IMeterConfiguration, IOperatorClient } from '@onder/interfaces'
import Logger from './Logger'
import { AddressService, OperatorTransportFactory } from '@onder/common'
import NodeDatabase from './typeOrmDatabase/nodeDatabase'
import DatabaseFactory from './DatabaseFactory'
import { TypedEventEmitter } from '@elderapo/typed-event-emitter'

const log = new Logger('problem-controller')

class ProblemController extends TypedEventEmitter<ProblemController.Events> {
  private operatorPort = 5000
  private inited = false
  private readonly factory: OperatorTransportFactory
  private readonly allowSendStatistic: boolean
  private readonly addressService: AddressService
  private readonly meterConfiguration: Array<IMeterConfiguration>
  private clients: Map<string, IOperatorClient> = new Map()
  private errorCache: Map <string, Array <IError>> = new Map()
  private db: DatabaseFactory
  private readonly storeErrors: boolean

  constructor (storeErrors: boolean, db: DatabaseFactory, meterConfiguration: Array<IMeterConfiguration>, allowSendStatistic: boolean, addressService: AddressService, factory: OperatorTransportFactory) {
    super()
    this.storeErrors = storeErrors
    this.db = db
    this.meterConfiguration = meterConfiguration
    this.allowSendStatistic = allowSendStatistic
    this.addressService = addressService
    this.factory = factory
  }

  private async loadCache (db: NodeDatabase, configuration: IMeterConfiguration): Promise<void> {
    // let errors = await db.requests.getErrors()
    // this.errorCache.set(configuration.account, errors)
    // this.emit(ProblemController.Event.INIT, { configuration, errors })
    this.inited = true
  }

  private async inCache (db: NodeDatabase, configuration: IMeterConfiguration, error: IError): Promise<number> {
    if (!('account' in error)) {
      log.warn(error.type, 'not supported!')
      return -1
    }
    if (!this.errorCache.has(configuration.account)) {
      await this.loadCache(db, configuration)
    }
    return this.errorCache.get(configuration.account)!.findIndex((value: IError) => {
      if (!('account' in error)) {
        return false
      }
      return error.type === value.type &&
           error.date.utc().valueOf() === value.date.utc().valueOf() &&
           error.account === value.account
    })
  }

  private createOrGetClient (error: IError): Promise<IOperatorClient> {
    if (!('account' in error)) {
      log.warn(error.type, 'not supported!')
      return Promise.reject('Error type not supported!')
    }
    return this.getOperatorClient(error.account)
  }

  getErrors (account: string): Array<IError> {
    const result = this.errorCache.get(account)
    return result || []
  }

  async getOperatorClient (account: string): Promise<IOperatorClient> {
    if (!this.clients.has(account)) {
      const operatorTransport = this.factory.createOperatorTransport(this.operatorPort)
      const client = await operatorTransport.createClient(account, this.allowSendStatistic, this.addressService)
      this.clients.set(account, client)
      return client
    }
    const cl = this.clients.get(account)
    if (cl) {
      return cl
    }
    return Promise.reject("Situation not understude! map has client but it's undefined")
  }

  problemReport (error: IError): void {
    this.async_problemReport(error).then(() => {
      // Do Nothing
    }).catch((reason) => {
      log.warn('problemReport', error.type, reason)
    })
  }

  async async_problemReport (error: IError): Promise<void> {
    if (!('account' in error)) {
      log.warn(error.type, 'not supported!')
      return
    }
    await this.createOrGetClient(error).then((client) => {
      return client.sendProblemOccurred(error.type, error.date).catch((reason) => {
        log.warn("Can't send report to operator", reason)
        return
      })
    }).catch((reason) => {
      log.warn("Can't get client report for send to operator", reason)
      return
    })
    const meterConfiguration = this.meterConfiguration.find((meterConfig: IMeterConfiguration) => {
      return meterConfig.account === error.account
    })
    if (!meterConfiguration) {
      log.error('Configuration not found', error.account)
      return
    }
    const db = this.db.get(meterConfiguration.account)
    if (!db) {
      log.error('Configuration not found', error.account)
      return
    }
    try {
      const errorIndex = await this.inCache(db, meterConfiguration, error)
      if (errorIndex > -1) {
        return
      }
      this.errorCache.get(meterConfiguration.account)!.push(error)
      try {
        if (this.storeErrors) {
          // await db.requests.addError(error)
        }
        this.emit(ProblemController.Event.PROBLEM_REPORT, { configuration: meterConfiguration, error })
      } catch (reason) {
        log.error("Can't add new error: ", reason)
        const index = this.errorCache.get(meterConfiguration.account)!.findIndex((v) => {
          if (!('account' in v)) {
            return false
          }
          return v.type === error.type &&
            v.date === error.date &&
            v.account === error.account
        })
        if (index < 0) {
          return
        }
        this.errorCache.get(meterConfiguration.account)!.splice(index, 1)
      }
    } catch (e) {
      log.error('problemReport', error, e)
    }
  }

  resolveProblem (error: IError): void {
    this.async_resolveProblem(error).then(() => {
      // Do Nothing
    }).catch((reason) => {
      log.warn('problemReport', error.type, reason)
    })
  }

  async async_resolveProblem (error: IError): Promise<void> {
    if (!('account' in error)) {
      log.warn(error.type, 'not supported!')
      return
    }
    await this.createOrGetClient(error).then((client) => {
      return client.sendProblemResolved(error.type, error.date).catch((reason) => {
        log.warn("Can't send report to operator", reason)
        return
      })
    }).catch((reason) => {
      log.warn("Can't get client report for send resolve to operator", reason)
      return
    })
    const meterConfiguration = this.meterConfiguration.find(meterConfig => {
      return meterConfig.account === error.account
    })
    if (!meterConfiguration) {
      log.error('Configuration not found', error.account)
      return
    }
    const db = this.db.get(meterConfiguration.account)
    if (!db) {
      log.error('Configuration not found', error.account)
      return
    }
    try {
      const errorIndex = await this.inCache(db, meterConfiguration, error)
      if (errorIndex < 0) {
        return
      }
      /*return db.requests.deleteError(error).then(() => {
        if (errorIndex > 0) {
          this.errorCache.get(meterConfiguration.account)!.splice(errorIndex, 1)
        }
        this.emit(ProblemController.Event.PROBLEM_RESOLVE, { configuration: meterConfiguration, error })
      }).catch((reason) => {
        log.error("Can't add new error: ", reason)
        return
      })*/
    } catch (e) {
      log.error('problemReport', error, e)
    }
    return
  }
}

namespace ProblemController {
  export enum Event {
    INIT,
    PROBLEM_REPORT,
    PROBLEM_RESOLVE
  }

  export type Events = {
    [Event.INIT]: { configuration: IMeterConfiguration, errors: Array<IError> },
    [Event.PROBLEM_REPORT]: { configuration: IMeterConfiguration, error: IError },
    [Event.PROBLEM_RESOLVE]: { configuration: IMeterConfiguration, error: IError }
  }
}

export default ProblemController
