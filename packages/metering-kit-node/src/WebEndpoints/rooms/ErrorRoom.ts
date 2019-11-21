import * as io from 'socket.io'
import ARoom from './ARoom'
import { IMeterConfiguration,
         WebRoomName,
         IError,
         webproto,
         IWebError,
         IErrorRoomResponse,
         IErrorRoomRequest,
         protoEncode} from '@onder/interfaces'
import WebServer from '../WebServer'
import { ErrorSerializer } from '@onder/common'
import ProblemController from '../../ProblemController'
import NodeDatabase from '../../nodeDatabase/nodeDatabase'

class WebErrorSerde {
  static serialize (value: IWebError) {
    return webproto.WebError.create({
      error: ErrorSerializer.serializeError(value.error),
      from: value.from ? value.from.valueOf() : 0,
      to: value.to ? value.to.valueOf() : 0
    })
  }
}

class ErrorRoomResponseSerde {
  static serialize (value: IErrorRoomResponse) {
    return webproto.ErrorRoomResponse.create({
      type: webproto.RoomType.Error,
      add: value.add.map(value => WebErrorSerde.serialize(value)),
      remove: value.remove.map(value => WebErrorSerde.serialize(value)),
      update: value.update.map(value => WebErrorSerde.serialize(value))
    })
  }
}

interface IValidateResult {
  added: Array<IWebError>
  updated: Array<IWebError>
  removed: Array<IWebError>
}

export default class ErrorRoom extends ARoom {
  roomID: string
  roomType = webproto.RoomType.Error
  private readonly account: string
  private readonly db: NodeDatabase
  private readonly problemController: ProblemController
  private readonly workTimeout: number
  private lastGivenErrors: Array<IWebError> = []

  constructor (account: string, ioapp: io.Server, db: NodeDatabase, workTimeout: number, problemController: ProblemController) {
    super(ioapp)
    this.account = account
    this.db = db
    this.workTimeout = workTimeout
    this.problemController = problemController
    this.roomID = WebRoomName.Errors + '_' + this.account
    this.init()
    this.problemController.on(ProblemController.Event.PROBLEM_REPORT, async payload => {
      await this.onProblemReport(payload.configuration, payload.error)
    })
    this.problemController.on(ProblemController.Event.PROBLEM_RESOLVE, async payload => {
      await this.onProblemResolve(payload.configuration, payload.error)
    })
  }

  join (socket: io.Socket, request: IErrorRoomRequest): Promise<void> {
    this.realjoin(socket)
    const response: IErrorRoomResponse = {
      add: this.lastGivenErrors,
      remove: [],
      update: []
    }
    socket.emit(this.roomID, protoEncode(ErrorRoomResponseSerde.serialize(response)))
    return Promise.resolve()
  }

  async onProblemReport (meterConfiguration: IMeterConfiguration, error: IError): Promise<void> {
    await this.whenConnected(async () => {
      let newError: IWebError = { error: Object.assign({}, error) }
      if ('account' in error) {
        newError = { error: Object.assign({}, error), from: error.date, to: error.date }
      }
      this.lastGivenErrors.push(newError)
      const res = this.validateErrors(true)
      if (res.removed.indexOf(newError) === -1) {
        res.added.push(newError)
      }
      this.lastGivenErrors.sort((a,b) => {
        if (a.from && b.from) {
          return a.from.valueOf() - b.from.valueOf()
        }
        return 0
      })
      return this.sendUpdate(res.added, res.updated, res.removed)
    })
  }

  async onProblemResolve (meterConfiguration: IMeterConfiguration, error: IError): Promise<void> {
    await this.whenConnected(async () => {
      if (!('account' in error)) {
        const index = this.lastGivenErrors.findIndex(err => {
          return err.error.type === error.type
        })
        if (index !== -1) { // remove from cache a common error
          const rmError = this.lastGivenErrors[index]
          this.lastGivenErrors.splice(index, 1)
          return this.sendUpdate([]/*add*/, []/*update*/, [ rmError ]/*remove*/)
        }
        return
      }
      // Check that the current error is associated with the current error
      if (meterConfiguration.account !== this.account) {
        return
      }
      const index = this.lastGivenErrors.findIndex(err => {
        if (!err.to || !err.from) {
          return false
        }
        return err.error.type === error.type &&
          error.date.valueOf() >= err.from.valueOf() &&
          error.date.valueOf() <= err.to.valueOf()
      })
      if (index !== -1) { // remove error from cache
        let updateError = this.lastGivenErrors[index]
        let newError: IWebError | undefined = undefined
        if (updateError.to!.valueOf() === error.date.valueOf()) { // if it's last error - change a end date
          updateError.to!.subtract(this.workTimeout, 'ms')
        } else if (updateError.from!.valueOf() === error.date.valueOf()) { // if it's start error - change a start date
          updateError.from!.add(this.workTimeout, 'ms')
        } else { // split error - as example we have errors ABC time and this error is B, we need two error A and C
          const previosEnd = updateError.to!
          updateError.to! = error.date.clone() // Sets a A error time
          newError = { error: error, from: error.date.clone().add(this.workTimeout, 'ms'), to: previosEnd } // Create new C error
        }
        return this.sendUpdate(newError ? [newError] : []/*add*/,[ updateError ]/*update*/, []/*remove*/)
      }
    })
  }

  async sendUpdate (addErrors: IWebError[], updateErrors: IWebError[], deleteErrors: IWebError[]): Promise<void> {
    const response: IErrorRoomResponse = {
      add: addErrors,
      remove: deleteErrors,
      update: updateErrors
    }
    this.ioapp.of(WebServer.NAMESPACE).in(this.roomID).emit(this.roomID, protoEncode(ErrorRoomResponseSerde.serialize(response)))
  }

  private init (): void {
    const errors = this.problemController.getErrors(this.account)
    this.lastGivenErrors = errors.map(error => {
      let newError: IWebError = { error: Object.assign({}, error) }
      if ('account' in error) {
        newError = { error: Object.assign({}, error), from: error.date, to: error.date }
      }
      return newError
    }).sort((a,b) => {
      if (a.from && b.from) {
        return a.from.valueOf() - b.from.valueOf()
      }
      return 0
    })
    this.validateErrors()
  }

  private validateErrors (returnResult = false): IValidateResult {
    let result: IValidateResult = {
      added: [],
      removed: [],
      updated: []
    }
    let haveChanges = false
    this.lastGivenErrors.forEach((firstError, firstIndex) => {
      let indexFinded = this.lastGivenErrors.findIndex((secondError, secondIndex) => {
        if (firstIndex >= secondIndex) {
          return false
        }
        if (firstError.error.type !== secondError.error.type) {
          return false
        }
        if (firstError.from && secondError.from && firstError.to && secondError.to) {
          const fromFirst = firstError.from.valueOf()
          const toFirst = firstError.to.clone().add(this.workTimeout, 'ms').valueOf()
          const fromSecond = secondError.from.valueOf()
          const toSecond = secondError.to.clone().add(this.workTimeout, 'ms').valueOf()
          if (fromFirst >= fromSecond && fromFirst <= toSecond) {
            return true
          }
          if (toFirst >= fromSecond && toFirst <= toSecond) {
            return true
          }
          return false
        } else {
          return firstError.error.type === secondError.error.type
        }
      })
      if (indexFinded === -1) {
        return
      }
      if (this.lastGivenErrors[indexFinded].from && this.lastGivenErrors[indexFinded].to &&
        this.lastGivenErrors[firstIndex].from && this.lastGivenErrors[firstIndex].to) {
        if (this.lastGivenErrors[indexFinded].from!.valueOf() < this.lastGivenErrors[firstIndex].from!.valueOf()) {
          const tmpIndex = indexFinded
          indexFinded = firstIndex
          firstIndex = tmpIndex
        }

        if (this.lastGivenErrors[indexFinded].to!.valueOf() > this.lastGivenErrors[firstIndex].to!.valueOf()) {
          this.lastGivenErrors[firstIndex].to = this.lastGivenErrors[indexFinded].to
          if (returnResult && result.updated.indexOf(this.lastGivenErrors[firstIndex]) === -1) {
            result.updated.push(this.lastGivenErrors[firstIndex])
          }
        }
      }
      if (returnResult && result.removed.indexOf(this.lastGivenErrors[indexFinded]) === -1) {
        result.removed.push(this.lastGivenErrors[indexFinded])
      }
      this.lastGivenErrors.splice(indexFinded, 1)
      haveChanges = true
    })
    if (haveChanges) {
      const newRes = this.validateErrors(returnResult)
      if (returnResult) {
        result.updated = result.updated.concat(newRes.updated)
        result.removed = result.removed.concat(newRes.removed)
      }
    }
    return result
  }
}
