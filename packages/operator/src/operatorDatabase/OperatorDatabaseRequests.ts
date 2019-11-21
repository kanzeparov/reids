import {
  IOperatorDatabaseRequests,
  ITradeEvent,
  IProblemOccurredEvent,
  IProblemResolvedEvent
} from '@onder/interfaces'
import * as Sequelize from 'sequelize'

export default class OperatorDatabaseRequests implements IOperatorDatabaseRequests {
  private readonly models: Sequelize.Models

  constructor (models: Sequelize.Models) {
    this.models = models
  }

  public addTrade (trade: ITradeEvent): Promise<void> {
    return Promise.resolve(this.models.Trades.create({
      sender: trade.sender,
      receiver: trade.receiver,
      value: trade.value.toNumber(),
      price: trade.price.toNumber(),
      timestamp: trade.timestamp.utc().valueOf()
    }))
  }

  public addError (error: IProblemOccurredEvent): Promise<void> {
    return Promise.resolve(this.models.Errors.create({
      type: error.errorType,
      account: error.client.account,
      timestamp: error.timestamp.utc().valueOf()
    }))
  }

  public resolveError (error: IProblemResolvedEvent): Promise<void> {
    return Promise.resolve(this.models.Errors.destroy({
      where: {
        errorType: error.errorType,
        account: error.client.account,
        timestamp: error.timestamp.utc().valueOf()
      }
    }))
    .then(() => {
      return
    })
  }

}
