import { IProblemOccurredEvent, IProblemResolvedEvent, ITradeEvent } from '../index'

export default interface IOperatorDatabaseRequests {

  addTrade (trade: ITradeEvent): Promise<void>

  addError (error: IProblemOccurredEvent): Promise<void>

  resolveError (error: IProblemResolvedEvent): Promise<void>
}
