import VirtualMeter from './VirtualMeter'
import { BigNumber } from 'bignumber.js'

export default class BalanceHelper {
  private vm: VirtualMeter

  constructor (vm: VirtualMeter) {
    this.vm = vm
  }

  async getBalance (): Promise<BigNumber> {
    const db = this.vm.database
    const machinomy = this.vm.machinomyFacade

    const cell = await db.service.getCell()
    const neighbours = cell.neighbours || []

    let result = new BigNumber(cell.onchainBalance)

    const division = new BigNumber(10).pow(18)

    await Promise.all(neighbours.map(async (neighbour) => {

      const recieverChannel = await machinomy.getOpenChannelByRecieverAndSender(
        this.vm.account,
        neighbour.upstreamAddress)
      const senderChannel = await machinomy.getOpenChannelByRecieverAndSender(
        neighbour.upstreamAddress,
        this.vm.account)

      if (recieverChannel) {
        const channelResult = recieverChannel.spent.dividedToIntegerBy(division)
        result = result.plus(channelResult)
      }

      if (senderChannel) {
        const channelResult = senderChannel.value.minus(senderChannel.spent).dividedToIntegerBy(division)
        result = result.plus(channelResult)
      }
    }))
    return result
  }
}
