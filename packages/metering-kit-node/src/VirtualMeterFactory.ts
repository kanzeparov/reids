import VirtualMeter from './VirtualMeter'
import Ethereum from './Ethereum'
import DatabaseFactory from './DatabaseFactory'
import ProblemController from './ProblemController'
import MachinomyFacade from './MachinomyFacade'
import Seller from './Seller'
import { AddressService, IMeterReader } from '@onder/common'
import TradeChannel from './TradeChannel'
import Buyer from './Buyer'
import Checker from './Checker'
import PowerLogger from './PowerLogger'
import { OperatorClient } from './OperatorClient'
import { URL } from 'url'
import { DummyOperatorClient } from './DummyOperatorClient'
import { PriceProvider } from './PriceProvider'
import { BigNumber } from 'bignumber.js'

export default class VirtualMeterFactory {
  readonly quantum: number
  readonly ethereum: Ethereum
  readonly databases: DatabaseFactory
  readonly problemController: ProblemController
  readonly upstreamAccount: string
  readonly cellName?: string
  readonly addressService: AddressService
  readonly dsmUrl: URL
  readonly operatorUrl: URL | undefined
  readonly minimumChannelAmount: BigNumber | undefined
  readonly tradeHost: string
  readonly tradePort: number
  readonly tokenContract: string

  constructor (quantum: number, tradeHost: string, tradePort: number, ethereum: Ethereum, upstreamAccount: string, addressService: AddressService, databases: DatabaseFactory, problemController: ProblemController, minimumChannelAmount: BigNumber | undefined, dsmUrl: URL, tokenContract: string, operatorUrl?: URL, cellName?: string) {
    this.quantum = quantum
    this.ethereum = ethereum
    this.databases = databases
    this.problemController = problemController
    this.upstreamAccount = upstreamAccount
    this.addressService = addressService
    this.dsmUrl = dsmUrl
    this.operatorUrl = operatorUrl
    this.minimumChannelAmount = minimumChannelAmount
    this.tradeHost = tradeHost
    this.tradePort = tradePort
    this.tokenContract = tokenContract
    this.cellName = cellName
  }

  async build (account: string, reader: IMeterReader, ideaId?: string): Promise<VirtualMeter> {
    const tradeChannel = new TradeChannel(this.upstreamAccount, this.tradeHost, this.tradePort, this.problemController, this.addressService, this.quantum, account)
    const machinomyFacade = new MachinomyFacade(account, this.quantum, this.ethereum, this.databases.databaseUrl, this.minimumChannelAmount, this.problemController, tradeChannel, this.tokenContract)
    const database = await this.databases.build(account, machinomyFacade.machinomy)
    const priceProvider = new PriceProvider(this.dsmUrl)
    const seller = new Seller(this.problemController, tradeChannel, database, machinomyFacade, account, priceProvider)
    const buyer = new Buyer(machinomyFacade, database)
    // const checker = new Checker(this.quantum, account, this.problemController, database, machinomyFacade, seller)
    const powerLogger = new PowerLogger(database)
    const operatorClient = this.operatorUrl ? new OperatorClient(this.operatorUrl, account) : new DummyOperatorClient()
    const cellName = this.cellName

    let virtualMeter = {
      account: account,
      ideaId: ideaId,
      reader: reader,
      machinomyFacade: machinomyFacade,
      database: database,
      seller: seller,
      buyer: buyer,
      cellName: cellName,
      // checker: checker,
      powerLogger: powerLogger,
      operatorClient: operatorClient
    }

    return Object.freeze(virtualMeter)
  }
}
