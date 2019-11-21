import * as _ from 'lodash'
import { BigNumber } from 'bignumber.js'
import VirtualMeter from '../VirtualMeter'
import { TransactionResult, AnyTransactionEvent } from 'truffle-contract'
import { PaymentChannel } from 'machinomy'
import Logger from '../Logger'
import {Neighbour} from '../typeOrmDatabase/models/Neighbour'

const log = new Logger('meters-presentation')

export interface Balance {
  ticker: string
  offchain: string
  tokenContract: string
  onchain: string
}

export interface BalanceState {
  balance: Array<Balance>
  channels: any[]
  account: string
}

export interface ShortEvent {
  event: string
  args: Array<any>
}

export interface PaymentChannelPresentation {
  settlingUntil: number
  receiver: string
  sender: string
  tokenContract: string
  spent: BigNumber
  settlementPeriod: number
  state: number
  value: BigNumber
  channelId: string
}

export interface CloseResult {
  txID: string
  events: Array<ShortEvent>
  channel?: PaymentChannelPresentation
}

export interface NeighbourState {
  id: number
  name: string
  performance: number
  cost: number
  output: boolean
  blocked_money: BigNumber
  state: boolean
  active: boolean
}

export interface LoadState {
  id: number
  name: string
  performance: number
  active: boolean
}

export interface UserDataState {
  generator: {
    name: string
    performance: number
    propertyType: string
    propertyValue: number
  }
  net: {
    performance: number
    cost: number
  }
  neighbours: Array<NeighbourState>
  load: Array<LoadState>
  profile: {
    name: string
    money: number
  }
}

export interface RadioDataState {
  label: string
  inputTypes: Array<number>
}

export interface SettingsDataState {
  mains: Array<string>
  currentGeneratorName: string
  radios: Array<RadioDataState>
  managedLoad: {
    status: boolean
    items: Array<{
      id: string
      name: string
      priority: number
    }>
  }
  p2p: {
    status: boolean
    current: string
  }
  balance: {
    status: boolean
  }
}

export function isClosingEvent (e: AnyTransactionEvent) {
  switch (e.event) {
    case 'DidClaim':
      return true
    case 'DidStartSettling':
      return true
    case 'DidSettle':
      return true
    default:
      return false
  }
}

export function shortEvent (e: AnyTransactionEvent): ShortEvent {
  return {
    event: e.event,
    args: e.args
  }
}

export class MetersPresentation {
  vm: VirtualMeter

  constructor (vm: VirtualMeter) {
    this.vm = vm
  }

  async findChannel (events: Array<AnyTransactionEvent>): Promise<PaymentChannel | undefined> {
    const foundEvent = events.find(isClosingEvent)
    log.debug('Found event with channelId', foundEvent, events)
    if (foundEvent) {
      const channelId = foundEvent.args.channelId
      const channels = await this.vm.machinomyFacade.notSettledTokenChannels()
      const foundChannel = channels.find(c => c.channelId === channelId)
      log.debug('Found channel for event', foundChannel)
      return foundChannel
    } else {
      return undefined
    }
  }

  async doCloseChannelByNeighbourId (neighbourId: number) {
    const machinomyFacade = this.vm.machinomyFacade
    const cell = await this.vm.database.service.getCell()
    const myUpstreamAccount = cell.upstreamAddress
    const neighbour = await this.vm.database.service.neighbourRepository.findOneOrFail({
      where: {
        neighbourId: neighbourId
      }
    })
    const neighbourUpstreamAccount = neighbour.upstreamAddress

    const channel1 = await machinomyFacade.getOpenChannelByRecieverAndSender(neighbourUpstreamAccount, myUpstreamAccount)
    const channel2 = await machinomyFacade.getOpenChannelByRecieverAndSender(myUpstreamAccount, neighbourUpstreamAccount)
    const result1 = channel1 && await machinomyFacade.doCloseChannel(channel1.channelId)
    const result2 = channel2 && await machinomyFacade.doCloseChannel(channel2.channelId)
    return {
      result1,
      result2
    }
  }

  async closeResult (txResult: TransactionResult): Promise<CloseResult> {
    const events = txResult.logs
    const foundChannel = await this.findChannel(events)
    if (foundChannel) {
      const presented = await this.channelPresentation(foundChannel)
      return {
        txID: txResult.tx,
        events: events.map(shortEvent),
        channel: presented
      }
    } else {
      return {
        txID: txResult.tx,
        events: events.map(shortEvent)
      }
    }
  }

  async channelPresentation (channel: PaymentChannel): Promise<PaymentChannelPresentation> {
    const currentBlockNumber = await this.vm.machinomyFacade.latestBlockNumber()
    const settlingUntil = new BigNumber(channel.settlingUntil).toNumber()
    if (settlingUntil === 0) {
      return {
        ...channel,
        settlingUntil: settlingUntil
      }
    } else {
      const settlingUntilInSecondsRelative = (settlingUntil - currentBlockNumber) * 15
      const settlingUntilInSeconds = Math.trunc(Date.now() / 1000) + settlingUntilInSecondsRelative
      return {
        ...channel,
        settlingUntil: settlingUntilInSeconds
      }
    }
  }

  async balanceState (): Promise<BalanceState> {
    const account = this.vm.account
    const tokenContract = this.vm.machinomyFacade.tokenContract()
    const tokenName = await this.vm.machinomyFacade.tokenName()
    const onchainBalance = await this.vm.machinomyFacade.onchainBalance()
    const offchainBalance = await this.vm.machinomyFacade.offchainBalance()
    const onchainTokenBalance = await this.vm.machinomyFacade.onchainTokenBalance()
    const offchainTokenBalance = await this.vm.machinomyFacade.offchainTokenBalance()

    const channels = await this.vm.machinomyFacade.notSettledTokenChannels()
    const channelsSettlingUntilinSeconds = await Promise.all(channels.map(c => this.channelPresentation(c)))
    const sortedChannels = _.sortBy(channelsSettlingUntilinSeconds, c => c.channelId)

    return {
      account: account,
      balance: [
        {
          ticker: 'ETH',
          tokenContract: '',
          offchain: offchainBalance.toString(),
          onchain: onchainBalance.toString()
        },
        {
          ticker: tokenName,
          tokenContract: tokenContract,
          offchain: offchainTokenBalance.toString(),
          onchain: onchainTokenBalance.toString()
        }
      ],
      channels: sortedChannels
    }
  }

  async settingsDataState (): Promise<SettingsDataState> {
    const dbService = this.vm.database.service

    const cell = await dbService.getCell()
    const generators = await dbService.getGenerators()
    const load = cell.loadControls || []

    return {
      mains: [cell.cellName, cell.ipAddress || ''],
      currentGeneratorName: cell.generator.generatorType || '',
      radios: generators.map(value => {
        return {
          label: value.generatorType || '',
          inputTypes: [value.power || 0, value.propertyValue || 0]
        }
      }),
      managedLoad: {
        status: cell.loadControl,
        items: load.map(value => {
          return {
            id: value.controlId,
            name: value.roomName,
            priority: value.priority
          }
        })
      },
      p2p: {
        status: cell.pToPStatus,
        current: cell.strategy
      },
      balance: {
        status: cell.demandBalance
      }
    }
  }

  async updateDataState (body: SettingsDataState): Promise<SettingsDataState> {
    await this.vm.database.service.postSettingsData(body).catch((err) => {
      throw err
    })
    await this.updateMqttState()
    return this.settingsDataState()
  }

  async updateMqttState (): Promise<void> {
    const cell = await this.vm.database.service.getCell()
    const generator = cell.generator
    const loadControls = cell.loadControls
    let priority = '1,2,3'

    const reader = this.vm.reader

    // @ts-ignore
    reader.sendGenType(generator.generatorType)

    if (generator.generatorType === 'acc') {
      // @ts-ignore
      reader.sendGenParameter(generator.propertyValue, 2)
    } else {
      // @ts-ignore
      reader.sendGenParameter(generator.propertyValue, 0)
    }

    // @ts-ignore
    reader.sendAmigoUnloadStatus(cell.loadControl)

    // @ts-ignore
    reader.sendTradeSupport(cell.pToPStatus)

    let massStrategy = 'no'

    if (cell.pToPStatus) {
      massStrategy = cell.strategy === '0' ? 'opt_cost' : 'opt_storage'
    }

    // @ts-ignore
    reader.sendMasStratMode(massStrategy)

    if (loadControls && loadControls.length) {
      priority = loadControls.sort((a, b) =>
         a.controlId <= b.controlId ? 1 : 0
      ).map(item => item.priority).join(',')
    }

    // @ts-ignore
    reader.sendLoadPriority(priority)
  }

  async getChannelByContragentId (contragentId: string): Promise<PaymentChannel> {
    const machinomy = this.vm.machinomyFacade
    const accountId = this.vm.account
    // accountId - reciever, contragent - sender - take spent
    const channel = await machinomy.getOpenChannelByRecieverAndSender(accountId, contragentId)
    // contragent - reciever, account - sender - take amount - spent
    log.info(`Founded channel ${channel}`)
    return channel
  }

  /**
   *
   * @param contragentUpstreamAddress - id of neighbour
   * find channel with recieverId = accountId and senderId = contragent is recieverChannel
   * find channel with recieverId = contragent id and senderId = accountId is senderChannel
   * result for offChain balance is calculated by formulae:
   * result = recieverChannel.spent + (senderChannel.value - senderChannel.spent)
   * return result
   */
  async getOffchainBalanceByContragentId (contragentUpstreamAddress: string): Promise<BigNumber> {
    const machinomy = this.vm.machinomyFacade
    const accountId = this.vm.account
    let result = new BigNumber(0)

    const recieverChannel = await machinomy.getOpenChannelByRecieverAndSender(accountId, contragentUpstreamAddress)
    const senderChannel = await machinomy.getOpenChannelByRecieverAndSender(contragentUpstreamAddress, accountId)

    if (recieverChannel) {
      result = result.plus(recieverChannel.spent)
    }

    if (senderChannel) {
      result = result.plus(senderChannel.value.minus(senderChannel.spent))
    }

    const division = new BigNumber(10).pow(18)
    return result.dividedToIntegerBy(division)
  }

  async getChannelsByContragentIds (contragentIds: Array<string>): Promise<Array<PaymentChannel>> {
    let channels: Array<PaymentChannel> = []
    for (const id of contragentIds) {
      let channel = await this.getChannelByContragentId(id)
      if (channel) {
        channels.push(channel)
      }
    }
    return channels
  }

  async getNeighbours (): Promise<Array<Neighbour>> {
    return this.vm.database.service.neighbourRepository.find({})
  }

  async userDataState (): Promise<UserDataState> {
    const dbService = this.vm.database.service

    const cell = await dbService.getCell()

    const preNeighbours = cell.neighbours || []
    const preLoad = cell.loadControls || []

    const cellGenerator = cell.generator || []

    const generator = {
      name: cellGenerator.generatorType,
      performance: cellGenerator.power,
      propertyType: cellGenerator.propertyType,
      propertyValue: cellGenerator.propertyValue
    }

    const net = {
      performance: cell.netPower,
      cost: cell.netCost
    }

    const neighbours = (await Promise.all(preNeighbours.map(async value => {
      const offchainBalance = await this.getOffchainBalanceByContragentId(value.upstreamAddress)

      return {
        id: +value.neighbourId,
        name: value.neighbourName,
        performance: value.power,
        cost: value.cost,
        output: value.direction || false,
        blocked_money: offchainBalance,
        state: !offchainBalance.equals(0),
        active: value.connectStatus
      }
    }))).sort((a, b) => a.id - b.id)

    const load = preLoad.map(value => {
      return {
        id: +value.controlId,
        name: value.roomName,
        performance: value.roomLoad,
        active: value.isWork || false
      }
    }).sort((a, b) => a.id - b.id)

    const profile = {
      name: cell.cellName,
      money: cell.onchainBalance,
      ethAddress: cell.upstreamAddress
    }

    return {
      generator,
      net,
      neighbours,
      load,
      profile
    }
  }

  async userFullDataState (): Promise<UserDataState> {
    const dbService = this.vm.database.service

    const cell = await dbService.getCell()

    const preNeighbours = cell.neighbours || []
    const preLoad = cell.loadControls || []

    const cellGenerator = cell.generator || []

    const generator = {
      name: cellGenerator.generatorType,
      performance: cellGenerator.fullPower,
      propertyType: cellGenerator.propertyType,
      propertyValue: cellGenerator.propertyValue // todo: should take not this field!
    }

    const net = {
      performance: cell.fullNetPower,
      cost: cell.fullNetCost
    }

    const neighbours = (await Promise.all(preNeighbours.map(async value => {
      const offchainBalance = await this.getOffchainBalanceByContragentId(value.upstreamAddress)

      return {
        id: +value.neighbourId,
        name: value.neighbourName,
        performance: value.fullPower,
        cost: value.fullCost,
        output: value.fullPower >= 0,
        blocked_money: offchainBalance,
        state: !offchainBalance.equals(0),
        active: value.connectStatus
      }
    }))).sort((a, b) => a.id - b.id)

    const load = preLoad.map(value => {
      return {
        id: +value.controlId,
        name: value.roomName,
        performance: value.fullRoomLoad,
        active: value.isWork || false
      }
    }).sort((a, b) => a.id - b.id)

    const profile = {
      name: cell.cellName,
      money: cell.onchainBalance,
      ethAddress: cell.upstreamAddress
    }

    return {
      generator,
      net,
      neighbours,
      load,
      profile
    }
  }
}
