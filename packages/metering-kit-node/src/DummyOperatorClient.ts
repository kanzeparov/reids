import { ITrade } from '@onder/interfaces'
import Logger from './Logger'
import { IOperatorClient, Stats } from './IOperatorClient'

const log = new Logger('dummy-operator-client')

export class DummyOperatorClient implements IOperatorClient {
  sendStats (stats: Stats): void {
    log.info('Dummy operator client sends stats to Operator, really not')
  }

  sendTrade (trade: ITrade): void {
    log.info('Dummy operator client sends trade to Operator, really not')
  }
}
