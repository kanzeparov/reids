import MachinomyFacade from './MachinomyFacade'
import NodeDatabase from './typeOrmDatabase/nodeDatabase'
import Seller from './Seller'
import Buyer from './Buyer'
import Checker from './Checker'
import PowerLogger from './PowerLogger'
import { IMeterReader } from '@onder/common'
import { IOperatorClient } from './IOperatorClient'

export default interface VirtualMeter {
  readonly account: string
  readonly ideaId?: string
  readonly reader: IMeterReader
  readonly machinomyFacade: MachinomyFacade
  readonly database: NodeDatabase
  readonly seller: Seller
  readonly buyer: Buyer
  readonly cellName?: string
  // readonly checker: Checker
  readonly powerLogger: PowerLogger
  readonly operatorClient: IOperatorClient
}
