import * as contracts from '@onder/token'
import { Mutex } from 'await-semaphore'
import {
  IMachinomy,
  IMeterValue,
  IMetaPayment
} from '@onder/interfaces'
import {
  Machinomy,
  BuyResult,
  Transport,
  RemoteChannelInfos,
  RemoteChannelInfo,
  PaymentChannel,
  PaymentRequiredResponse
} from 'machinomy'
import {
  StandardToken
} from '@machinomy/contracts'
import * as Web3 from 'web3'
import { BigNumber } from 'bignumber.js'

import * as moment from 'moment'
import { Logger, ErrorFactory, Utils, pify } from '@onder/common'
import ProblemController from './ProblemController'
import TradeChannel from './TradeChannel'
import Ethereum from './Ethereum'

const log = new Logger('machinomy-facade')

const MINIMUM_CHANNEL_AMOUNT = new BigNumber('200000000000000000')

const buyMutex = new Mutex()
const checkChannelAndDepositMutex = new Mutex()

export default class MachinomyFacade implements IMachinomy {
  readonly machinomy: Machinomy

  private readonly web3: Web3
  private readonly quantum: number
  private readonly account: string
  private channelOpen: Boolean = false
  private tradeChannel: TradeChannel
  private readonly problemController: ProblemController
  private readonly _tokenContract: string

  private openChannelPromise?: Promise<string | boolean | void>

  constructor (account: string, quantum: number, ethereum: Ethereum, databaseUrl: string, minimumChannelAmount: BigNumber | undefined, problemController: ProblemController, tradeChannel: TradeChannel, tokenContract: string) {
    this.account = account
    this.quantum = quantum
    this.tradeChannel = tradeChannel
    this.web3 = ethereum.forAccount(this.account)
    this.machinomy = new Machinomy(this.account, this.web3, {
      databaseUrl: databaseUrl,
      minimumChannelAmount: minimumChannelAmount || MINIMUM_CHANNEL_AMOUNT,
      transport: tradeChannel instanceof Transport ? tradeChannel : undefined
    })
    this.problemController = problemController
    this._tokenContract = tokenContract
  }

  async openChannels (): Promise<PaymentChannel[]> {
    const channels = await this.machinomy.channels()
    return channels.filter(channel => { // calculate chan balance with currently upstream
      if (!channel) {
        return false
      }
      const isTokenChannel = !!channel.tokenContract
      const isOpen = channel.state === 0
      const isUpstreamChannel = isOpen && channel.sender === this.account
      const isPending = channel.state === 0 || channel.state === 1
      const isDownstreamChannel = isPending && channel.receiver === this.account
      return !isTokenChannel && (isUpstreamChannel || isDownstreamChannel)
    })
  }

  async openTokenChannels (): Promise<PaymentChannel[]> {
    const channels = await this.machinomy.channels()
    return channels.filter(channel => { // calculate chan balance with currently upstream
      if (!channel) {
        return false
      }
      const isTokenChannel = !!channel.tokenContract
      const isOpen = channel.state === 0
      const isUpstreamChannel = isOpen && channel.sender === this.account
      const isPending = channel.state === 0 || channel.state === 1
      const isDownstreamChannel = isPending && channel.receiver === this.account
      return isTokenChannel && (isUpstreamChannel || isDownstreamChannel)
    })
  }

  async notSettledTokenChannels (): Promise<PaymentChannel[]> {
    const channels = await this.machinomy.channels()
    return channels.filter(channel => { // calculate chan balance with currently upstream
      if (!channel) {
        return false
      }
      const isTokenChannel = !!channel.tokenContract
      const isNotSettled = channel.state === 0 || channel.state === 1
      const isUpstreamChannel = isNotSettled && channel.sender === this.account
      const isPending = channel.state === 0 || channel.state === 1
      const isDownstreamChannel = isPending && channel.receiver === this.account
      return isTokenChannel && (isUpstreamChannel || isDownstreamChannel)
    })
  }

  async doCloseChannel (channelId: string) {
    return this.machinomy.close(channelId)
  }

  async onchainBalance (): Promise<BigNumber> {
    const balance = await new Promise<BigNumber>((resolve, reject) => {
      this.web3.eth.getBalance(this.account, (err, result) => {
        err ? reject(err) : resolve(result)
      })
    })
    log.info(`Onchain balance is ${balance.toString()}`)
    return new BigNumber(balance)
  }

  async getOpenChannelByRecieverAndSender (reciever: string, sender: string): Promise<PaymentChannel> {
    const channels = await this.openTokenChannels()
    log.debug(channels)
    const channel = channels.filter((ch) => {
      return ch.receiver === reciever && ch.sender === sender
    })[0]
    if (!channel) log.error(`can't find channel by reciever ${reciever} and sender ${sender}`)
    return channel
  }

  async getOpenChannelsByReceiverAndSender (receiver: string, sender: string): Promise<Array<PaymentChannel>> {
    const channels = await this.openTokenChannels()
    log.debug(channels)
    const channels_filt = channels.filter((ch) => {
      return ch.receiver === receiver && ch.sender === sender
    })
    return channels_filt
  }

  async offchainBalanceByChannelId (channelId: string): Promise<BigNumber> {
    const channel = await this.machinomy.channelById(channelId)
    const division = new BigNumber(10).pow(18)
    if (!channel) log.error(`Can't find chanel with id ${channelId}`)
    log.info(`Offchain balance ${channel ? channel.spent : 0}`)
    return channel ? channel.spent.dividedToIntegerBy(division) : new BigNumber(0)
  }

  async offchainBalance (): Promise<BigNumber> {
    const openChannels = await this.openChannels()
    const channelBalances = openChannels.map(channel => {
      return channel.value.minus(channel.spent)
    })
    const balance = channelBalances.reduce((acc, balance) => {
      return acc.plus(balance)
    }, new BigNumber(0))
    log.info(`Offchain balance is ${balance.toString()}`)
    return new BigNumber(balance)
  }

  async onchainTokenBalance (): Promise<BigNumber> {
    const provider = this.web3.currentProvider
    const Token = contracts.Token.contract(provider)
    const instanceToken = await Token.deployed()
    // const instanceToken = await Token.at
    let balance = await instanceToken.balanceOf(this.account)
    const division = new BigNumber(10).pow(18)
    balance = balance.dividedToIntegerBy(division)
    log.info(`Account is ${this.account}`)
    log.info(`Onchain token balance is ${balance.toString()}`)
    return balance
  }

  async getAllowance (spender: string): Promise<BigNumber> {
    const provider = this.web3.currentProvider
    const Token = contracts.Token.contract(provider)
    const instanceToken = await Token.deployed()
    let allowance = await instanceToken.allowance(this.account, spender)
    log.info("Current allowance is %o", allowance)
    return allowance
  }

  async increaseAllowance(spender: string): Promise<void> {
    const provider = this.web3.currentProvider
    const Token = contracts.Token.contract(provider)
    const instanceToken = await Token.deployed()
    let incr_value = new BigNumber(10)
    let allowance = await instanceToken.approve(spender, incr_value, {
      from: this.account,
      gas: 300000
    })
  }

  async offchainTokenBalance (): Promise<BigNumber> {
    const openTokenChannels = await this.openTokenChannels()
    const channelTokenBalances = openTokenChannels.map(channel => {
      return channel.value.minus(channel.spent)
    })
    const balance = channelTokenBalances.reduce((acc, balance) => {
      return acc.plus(balance)
    }, new BigNumber(0))
    log.info(`Offchain token balance is ${balance.toString()}`)
    return new BigNumber(balance)
  }

  async ensureBalancePositive (timestamp: moment.Moment): Promise<void> {
    const onchainBalance = await this.onchainBalance()
    const isBalancePositive = onchainBalance.greaterThan(0)
    if (!isBalancePositive) {
      const error = await ErrorFactory.createBuyNotEnoughMoneyError(timestamp, this.account)
      this.problemController.problemReport(error)
      this.openChannelPromise = undefined
      throw new Error('Onchain balance is not positive')
    }
  }

  async buy (upstreamAccount: string, meterValue: IMeterValue): Promise<string> {
    return buyMutex.use(async () => {
      log.debug(`Buying energy: ${meterValue.value} at ${meterValue.datetime}...`)
      await this.ensureBalancePositive(meterValue.datetime)
      await this.openChannel(upstreamAccount)
      const { token } = await this._buy(upstreamAccount, meterValue.delta, meterValue.datetime)
      // resolve all problems
      // this.problemController.resolveProblem(await this.createError(ErrorType.BuyChannelNotExist, meterValue))
      // this.problemController.resolveProblem(await this.createError(ErrorType.BuyNotEnoughMoney, meterValue))
      log.debug(`Bought energy: ${meterValue.value} at ${meterValue.datetime}, got token ${token}`)
      return token
    })
  }

  async buyWithPrice (upstreamAccount: string, power: BigNumber, price: BigNumber, datetime?: moment.Moment): Promise<BuyResult> {
    let spender: string = "0x7660F4fb856C0dCf07439d93Ec3Fe3F438960b89"
    const timestamp = datetime ? datetime : moment.utc()
    return buyMutex.use(async () => {
      log.debug(`Buying energy: ${power} at ${datetime}...`)
      //await this.ensureBalancePositive(timestamp)
      //await this.openChannel(upstreamAccount)
      const { token, channelId } = await this._buy(upstreamAccount, power, timestamp, price)
      let allowance = await this.getAllowance(spender)
      if (allowance.lessThan(new BigNumber(10))) {
        await this.increaseAllowance(spender)
      }
      allowance = await this.getAllowance(spender)
      log.debug(`Bought energy: ${power} at ${timestamp}, got token ${token}`)
      return { token, channelId }
    })
  }

  async checkChannelAndDeposit (channelId: string): Promise<void> {
    await checkChannelAndDepositMutex.use(async () => {
      const channel = await this.machinomy.channelById(channelId)
      log.debug('Checking if need deposit', channel)
      if (channel && channel.state === 0 && new BigNumber(channel.value).div(2).lessThan(channel.spent)) {
        log.debug('Deposit is required')
        await this.machinomy.deposit(channelId, BigNumber.min(new BigNumber(10), channel.value.mul(2)))
      } else {
        log.debug('Deposit is not required')
      }
    })
  }

  // async _buy (upstreamAccount: string, meterValue: IMeterValue): Promise<BuyResult> {
  //   const time = Utils.intervalStart(this.quantum, meterValue.datetime)
  //   const power = meterValue.delta

  //   const tradeChannelInfo = await this.paymentRequired(upstreamAccount, meterValue.datetime)
  //   log.debug(`Trying to call machinomy.buy. Trying to buy ${power.toString()} kilowatts, with price ${tradeChannelInfo.price.toString()}`)
  //   log.debug(`Total is ${tradeChannelInfo.price.times(power).round()}`)
  //   log.debug(`Current open channels:`, await this.openTokenChannels())
  //   const buyResult = await this.machinomy.buy({
  //     price: tradeChannelInfo.price.times(power).round(),
  //     gateway: tradeChannelInfo.gateway,
  //     receiver: tradeChannelInfo.receiver,
  //     meta: JSON.stringify({
  //       type: 'energy_obj', data: {
  //         power,
  //         id: this.account,
  //         time: time.valueOf()
  //       }
  //     }),
  //     tokenContract: this._tokenContract
  //   })

  //   const client = await this.problemController.getOperatorClient(this.account)
  //   await client.sendTrade(this.account, tradeChannelInfo.receiver, meterValue.datetime, power, tradeChannelInfo.price.times(power))
  //   await this.checkChannelAndDeposit(buyResult.channelId)
  //   return buyResult
  // }

  async _buy (upstreamAccount: string, power: BigNumber, datetime: moment.Moment, price?: BigNumber): Promise<BuyResult> {
    const time = Utils.intervalStart(this.quantum, datetime)

    const tradeChannelInfo = await this.paymentRequired(upstreamAccount, datetime)
    if (!price) {
      price = tradeChannelInfo.price
    }

    log.debug(`Trying to call machinomy.buy. Trying to buy ${power.toString()} kilowatts, with price ${price.toString()}`)
    log.debug(`Total is ${price.times(power).round()}`)
    log.debug(`Current open channels:`, JSON.stringify(await this.openTokenChannels()))
    const buyResult = await this.machinomy.buy({
      price: price.times(power).round(),
      gateway: tradeChannelInfo.gateway,
      receiver: tradeChannelInfo.receiver,
      meta: JSON.stringify({
        type: 'energy_obj', data: {
          power,
          id: this.account,
          time: time.valueOf()
        }
      }),
      tokenContract: this._tokenContract
    })

    const client = await this.problemController.getOperatorClient(this.account)
    await client.sendTrade(this.account, tradeChannelInfo.receiver, datetime, power, price.times(power))
    console.log("buyResult %o", buyResult.channelId)
    await this.checkChannelAndDeposit(buyResult.channelId)
    return buyResult
  }

  async openChannel (upstreamAccount: string): Promise<boolean> {
    let channels = await this.openTokenChannels()
    if (channels.length > 0) {
      log.debug(`Have ${channels.length} channels open`)
      log.debug(channels)
      return true
    } else {
      log.debug(`Have no channels open`)
      try {
        const tradeChannelInfo = await this.paymentRequired(upstreamAccount)
        let buyOptions = {
          price: 0,
          gateway: tradeChannelInfo.gateway || await this.tradeChannel.getPaymentRequiredURL(upstreamAccount),
          receiver: tradeChannelInfo.receiver,
          meta: JSON.stringify({
            type: 'energy_obj', data: {
              power: 0,
              id: this.account,
              time: 0
            }
          }),
          tokenContract: this._tokenContract
        }
        await this.machinomy.buy(buyOptions)
        this.channelOpen = true
        return true
      } catch (e) {
        log.error(`Can't open channel`, e)
        return false
      }
    }
  }

  async acceptPayment (metaPayment: IMetaPayment): Promise<string> {
    log.debug(`Accept payment from ${metaPayment}`)
    let result = ''
    try {
      const response = await this.machinomy.acceptPayment(metaPayment)
      result = response.token
    } catch (e) {
      log.error(e)
    }

    return result
  }

  async upstreamAccounts (): Promise<Array<string>> {
    const channels = await this.machinomy.channels()
    const upstreamChannels = channels.filter(channel => {
      return channel && channel.sender === this.account
    })
    return upstreamChannels.map(channel => {
      return channel.receiver
    })
  }

  async paymentRequired (upstreamAccount: string, time?: moment.Moment): Promise<PaymentRequiredResponse> {
    const uri = await this.tradeChannel.getPaymentRequiredURL(upstreamAccount)
    const timestamp = time ? time.valueOf() : moment.now().valueOf()
    log.debug('Trying to find current price...', uri, timestamp)
    const response = await this.machinomy.pry(uri, timestamp)
    log.debug('Got response from pricing endpoint')//, response)
    return response
  }

  async getOpenChannels (sender: string): Promise<RemoteChannelInfos> {
    const openChannels = await this.machinomy.openChannels()
    const filtered = openChannels.filter(channel => channel && !!channel.tokenContract)
    const channelsToSender = filtered.filter(chan => chan.sender === sender && chan.receiver === this.account)
    const channelManager = await this.machinomy.registry.channelManager()
    const remoteChainsWithUndef = await Promise.all(channelsToSender.map(async c => {
      const payment = await channelManager.lastPayment(c.channelId)
      return payment ? new RemoteChannelInfo(c.channelId, c.spent, payment.signature) : undefined
    }))
    const remoteChannels = remoteChainsWithUndef.reduce<Array<RemoteChannelInfo>>((acc, channel) => {
      if (channel) acc.push(channel)
      return acc
    }, [])
    return new RemoteChannelInfos(remoteChannels)
  }

  tokenContract (): string {
    return this._tokenContract
  }

  async transferToken (tokenContract: string, to: string, amount: BigNumber) {
    const contract: StandardToken.Contract = await StandardToken.contract(this.web3.currentProvider).at(tokenContract)
    return contract.transfer(to, amount, { from: this.account })
  }

  async transferEth (to: string, amount: BigNumber) {
    return new Promise<any>((resolve, reject) => {
      this.web3.eth.sendTransaction({ from: this.account, to: to, value: amount }, (err, value) => {
        err ? reject(err) : resolve(value)
      })
    })
  }

  async tokenName (): Promise<string> {
    let result = ''
    if (this._tokenContract !== '') {
      const deployed = await contracts.Token.contract(this.web3.currentProvider).at(this._tokenContract)
      result = await deployed.name()
    }
    return result
  }

  async latestBlockNumber (): Promise<number> {
    return pify<number>((cb: (error: Error, blockNumber: number) => void) => {
      this.web3.eth.getBlockNumber(cb)
    })
  }
}
