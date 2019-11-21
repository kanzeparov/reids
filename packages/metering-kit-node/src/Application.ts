import { IMeterReader } from '@onder/common'
import WebServer from './WebEndpoints/WebServer'
import Seller from './Seller'
import { BigNumber } from 'bignumber.js'
import Buyer from './Buyer'
import Logger from './Logger'
import VirtualMeter from './VirtualMeter'
import VirtualMeterContainer from './VirtualMeterContainer'
import moment = require('moment')
import { PaymentChannel } from 'machinomy'
import BalanceHelper from './BalanceHelper'

BigNumber.config({ EXPONENTIAL_AT: [-100, 100], ROUNDING_MODE: 1 })

const log = new Logger('application')
const AGENT_NAME = 'Agent'

async function startMeter (vm: VirtualMeter, quantum: number, defaultPrice: BigNumber, isSeller: boolean, web: WebServer): Promise<void> {
  log.info(`Starting meter for ${vm.account} with agent ID ${vm.ideaId!}`)
  const machinomy = vm.machinomyFacade
  const db = vm.database
  const numberId = vm.ideaId ? vm.ideaId.slice(-1) : '1'
  // const checker = vm.checker
  const buyer = vm.buyer
  const seller = vm.seller
  const reader = vm.reader
  const balanceHelper = new BalanceHelper(vm)
  const onChainTaskTimeout = 20000

  await machinomy.machinomy.openChannels()

  await initGeneratorsTable(vm)
  await initialiseDbCell(vm)
  await initLoadControlsTable(vm)

  await web.addMeter(vm)
  reader.start()

  // await db.createTables()
  // initialise DB by set a first price
  // await db.requests.updatePrice(Utils.intervalStart(quantum), defaultPrice)

  if (isSeller) {
    // TODO: always run as seller
    await seller.init()
    buyer.on(Buyer.Event.BUY, async trade => {
      // checker.queueTrade(trade)
      vm.operatorClient.sendTrade(trade)
    })
    seller.on(Seller.Event.SELL, async payment => {
      // checker.queuePayment(payment)
    })
    // checker.start()
  }

  reader.on(IMeterReader.Event.Connected, async (value) => {
    if (value) {
      // @ts-ignore
      reader.sendKnownAgents(vm.account)
    }
  })

  reader.on(IMeterReader.Event.Read, async ({ meter, value }) => {
    await vm.powerLogger.addMeasurement(value)
    // await db.requests.addMeasurements([value])
    await web.notifyMeterValue(meter, value)
    // if (isBuyer) {
      // const pry = await vm.machinomyFacade.paymentRequired(upstreamAccount)
      // vm.operatorClient.sendStats({
      //   buyerId: vm.account,
      //   sellerId: pry.receiver,
      //   time: Math.floor(Date.now().valueOf() / 1000),
      //   saleWh: value.value.toNumber(),
      //   cost: pry.price.mul(value.value).toString()
      // })
      // const upstreamAccount = this.db.service.getUppstreamAccountByContragent(pry.receiver)
      // await buyer.buyEnergy(upstreamAccount, value)
      // }
      // checker.addToCheck([value])
  })

  reader.on(IMeterReader.Event.Init, async ({ approve, meter, value }) => {
    const isContractSeller = (value.seller === vm.ideaId!)

    await db.service.updateTransactionFromMqtt(value)

    log.debug('Init request from MQTT')
    log.debug(`Init request from MQTT, transaction id: ${value.id}`)

    if (isContractSeller) {
      value.approved = true
      approve(value)
      await db.service.updateCostAndDirection(value.contragent, value.cost, true, getTimestamp(value.timeStamp))
    } else {
      await db.service.updateCostAndDirection(value.seller, value.cost, false, getTimestamp(value.timeStamp))
    }
  })

  reader.on(IMeterReader.Event.Progress, async ({ approve, meter, value }) => {
    log.debug('***************************Progress request from MQTT')

    await new Promise(resolve => {
      setTimeout(() => resolve(0), Math.random() * 1500)
    })
    const isContractSeller = (value.seller === vm.ideaId!)

    log.debug(`Is seller ${isContractSeller}`)

    let openChannels = []

    const closeChannels = async (channels: Array<any>) => {
      channels.sort((a: PaymentChannel, b: PaymentChannel) =>
         a.spent > b.spent ? 1 : -1
      )

      await Promise.all(channels.map(async (channel, index) => {
        if (index) {
          await machinomy.doCloseChannel(channel.channelId)
        }
      }))
    }

    if (!isContractSeller) {
      const upstreamAccount = await db.service.getUppstreamAccountByContragent(value.seller)
      const power = new BigNumber(value.amount).mul(new BigNumber(1e+18));
      const price = new BigNumber(value.cost)
      const datetime = moment(parseInt(value.timeStamp, 10)).utc()
      await db.service.updateCostAndDirection(value.seller, value.cost, false, getTimestamp(value.timeStamp))
      log.debug(datetime, value.timeStamp)

      openChannels = await machinomy.getOpenChannelsByReceiverAndSender(upstreamAccount, vm.account)

      await closeChannels(openChannels)

      openChannels = await machinomy.getOpenChannelsByReceiverAndSender(upstreamAccount, vm.account)

      log.debug(`open channels ${JSON.stringify(openChannels)}`)

      try {
        await buyer.buyEnergyWithPrice(upstreamAccount, power, price, datetime)
      } catch (e) {
        log.error(e)
      }
    } else {
      const upstreamAccount = await db.service.getUppstreamAccountByContragent(value.contragent)
      let openChannels = await machinomy.getOpenChannelsByReceiverAndSender(vm.account, upstreamAccount)

      log.debug(`open channels before filtering ${JSON.stringify(openChannels)}`)

      await closeChannels(openChannels)

      openChannels = await machinomy.getOpenChannelsByReceiverAndSender(vm.account, upstreamAccount)

      log.debug(`open channels ${JSON.stringify(openChannels)}`)

      value.payment_state = true
      approve(value)
      await db.service.updateCostAndDirection(value.contragent, value.cost, true, getTimestamp(value.timeStamp))
    }

    const balance = await balanceHelper.getBalance()
    // @ts-ignore
    reader.sendFinance(balance.toString())
    await updateOnchainBalance(vm);
    await db.service.updateTransactionFromMqtt(value)
  })

  reader.on(IMeterReader.Event.NewAgent, async ({ answer, meter, value }) => {
    const agentId = value.agentId
    const agentAccount = await db.service.getUppstreamAccountByContragent(agentId)
    log.debug(`Agent Account:  ${agentAccount}`)
    if ('' === agentAccount && agentId !== vm.ideaId) {
      const upstreamAccount = value.passport.ethereum_wallet
      log.debug(`Agent ID ====== ${agentId}`)
      log.debug(`Upstream Account ====== ${upstreamAccount}`)
      await db.service.saveNeighbour(agentId, upstreamAccount)
      answer(vm.account)
    }
  })

  // EXAMPLE

  // BatteryPower, 16 +
  // EmeterPower, 40 +
  // AmigoPrice, 107 +
  // PowerFromEnodeAndPort, 6 +
  // ValueFromEnodeAndLoad, 32-35
  // StatusFromEnodeRelay, 101(102-104)
  // StatusFromRelay 105

  // reader.reader_send_gen_type 60
  // reader_send_gen_parametr 115
  // reader_send_amigo_unload_status 111
  // reader_send_load_priority 63
  // reader_send_mas_strat_mode 65
  // reader_send_trade_support 117

  reader.on(IMeterReader.Event.BatteryPower, async ({ meter, value }) => {
    log.info(`Battery power recieved ${value.value}`)
    await db.service.updateGeneratorPower(value.value, getTimestamp(value.timeStamp))
  })

  reader.on(IMeterReader.Event.EmeterPower, async ({ meter, value }) => {
    log.info(`Emeter power recieved ${value.value}`)
    await db.service.updateNetPower(value.value, getTimestamp(value.timeStamp))
  })

  reader.on(IMeterReader.Event.AmigoPrice, async ({ meter, value }) => {
    log.info(`Amigo price recieved ${value.value}`)
    await db.service.updateNetCost(value.value, getTimestamp(value.timeStamp))
  })

  reader.on(IMeterReader.Event.PowerFromEnodeAndPort, async ({ meter, value }) => {
    log.info(`Power from encode and port recieved ${value.value}`)
    log.info(`sender id: ${value.senderId}`)
    const neighbourName = getNeighbourByIdeaIdAndPort(numberId, value.senderId)
    await db.service.updateNeighbourPower(neighbourName, value.value, getTimestamp(value.timeStamp))
  })

  reader.on(IMeterReader.Event.ValueFromEnodeAndLoad, async ({ meter, value }) => {
    log.info(`Value from encode and load recieved ${value.value}`)
    log.info(`sender id: ${value.senderId}`)
    await db.service.updateLoadByPriority(parseInt(value.senderId || '0', 10), value.value)
  })

  reader.on(IMeterReader.Event.StatusFromEnodeRelay, async ({ meter, value }) => {
    log.info(`Value from encode and load recieved ${value.value}`)
    log.info(`sender id: ${value.senderId}`)
    await db.service.updateLoadControlState(parseInt(value.senderId || '0', 10), value.value)
  })
}

async function initialiseDbCell (vm: VirtualMeter): Promise<void> {
  await vm.database.service.initCellState(vm.account, vm.cellName || '')
}

async function updateOnchainBalance(vm: VirtualMeter): Promise<void> {
  vm.machinomyFacade.onchainTokenBalance().then(async (value) => {
    await vm.database.service.updateOnchainBalance(vm.account, value.toNumber())
  })
}

function initOnchainBalanceTask (vm: VirtualMeter, timeout: number) {
  return setInterval(() => {
    vm.machinomyFacade.onchainTokenBalance().then(async (value) => {
      await vm.database.service.updateOnchainBalance(vm.account, value.toNumber())
    })
  }, timeout)
}

async function initLoadControlsTable (vm: VirtualMeter): Promise<void> {
  await vm.database.service.initLoadControlsTable(
    [
      {
        roomName: 'Kitchen',
        priority: 1
      },
      {
        roomName: 'Room',
        priority: 2
      },
      {
        roomName: 'Bathroom',
        priority: 3
      }
    ]
  )
}

async function initGeneratorsTable (vm: VirtualMeter): Promise<void> {
  await vm.database.service.initGeneratorsTable(
    [
      {
        generatorType: 'absent',
        propertyType: ''
      },
      {
        generatorType: 'benz',
        propertyType: 'cost'
      },
      {
        generatorType: 'sun',
        propertyType: 'cost'
      },
      {
        generatorType: 'acc',
        propertyType: 'capacity'
      }
    ]
  )
}

function getTimestamp (value: string): number {
  return parseInt(value, 10)
}

function getNeighbourById (id?: string): string {
  return AGENT_NAME + (id ? id : '1')
}

function getNeighbourByIdeaIdAndPort (ideaId?: string, portId?: string): string {
  let result = AGENT_NAME
  const portsMap = new Map()
  // @ts-ignore
  const key = ideaId + portId

  // first agent
  portsMap.set('11', '2')
  portsMap.set('12', '4')
  portsMap.set('13', '3')

  // second agent
  portsMap.set('21', '1')
  portsMap.set('22', '3')
  portsMap.set('23', '4')

  // third agent
  portsMap.set('31', '1')
  portsMap.set('32', '2')
  portsMap.set('33', '4')

  // fourth agent
  portsMap.set('41', '3')
  portsMap.set('42', '1')
  portsMap.set('43', '2')

  return result + portsMap.get(key)
}

export default class Application {
  private readonly meters: VirtualMeterContainer

  private readonly web: WebServer

  private readonly quantum: number
  private readonly defaultPrice: BigNumber
  private readonly isSeller: boolean

  constructor (quantum: number, defaultPrice: BigNumber, isSeller: boolean, allowSendStatistic: boolean, meters: VirtualMeterContainer, web: WebServer) {
    this.quantum = quantum
    this.defaultPrice = defaultPrice
    this.isSeller = isSeller

    this.meters = meters

    this.web = web
  }

  async start (): Promise<void> {
    log.info('Start application')
    await this.web.start()
    log.info('Got meters', this.meters.accounts())
    const promises = this.meters.map(async (account, meter) => {
      await startMeter(meter, this.quantum, this.defaultPrice, this.isSeller, this.web)
    })
    await Promise.all(promises)
  }
}
