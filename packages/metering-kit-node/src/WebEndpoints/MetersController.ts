import { BigNumber } from 'bignumber.js'
import VirtualMeter from '../VirtualMeter'
import * as Router from 'koa-router'
import { MetersPresentation, SettingsDataState } from './MetersPresentation'
import * as koaBody from 'koa-body'

BigNumber.config({ EXPONENTIAL_AT: [-100, 100] })

export class MetersController {
  vm: VirtualMeter
  presentation: MetersPresentation

  constructor (vm: VirtualMeter) {
    this.vm = vm
    this.presentation = new MetersPresentation(vm)
  }

  router () {
    console.log('routerrouter')
    const router = new Router()
    const namespace = `/meters/${this.vm.account}`
    router.get(`${namespace}`, this.handleGetMeter.bind(this))
    router.options(`${namespace}`, this.setCorsHeaders.bind(this))
    router.post(`${namespace}/transfer`, this.postTransfer.bind(this))
    router.options(`${namespace}/transfer`, this.setCorsHeaders.bind(this))
    router.post(`${namespace}/closechannel/:neighbourId`, this.handleCloseChannelsByNeighbourId.bind(this))
    router.delete(`${namespace}/channels/:channelId`, this.handleCloseChannel.bind(this))
    router.options(`${namespace}/channels/:channelId`, this.setCorsHeaders.bind(this))
    router.get(`${namespace}/userdata`, this.getUserData.bind(this))
    router.get(`${namespace}/userfulldata`, this.getUserFullData.bind(this))
    router.get(`${namespace}/neighbours`, this.getUserNeighbours.bind(this))
    router.get(`${namespace}/settingsdata`, this.getSettingsData.bind(this))
    router.post(`${namespace}/settingsdata`, koaBody(), this.postSettingsData.bind(this))

    return router
  }

  setCorsHeaders (ctx: Router.IRouterContext) {
    ctx.response.set('Access-Control-Allow-Origin', '*')
    ctx.response.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    ctx.response.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, HEAD, OPTIONS')
    ctx.response.status = 200
  }

  async postTransfer (ctx: Router.IRouterContext) {
    this.setCorsHeaders(ctx)
    const body = ctx.request.body as any
    if (body) {
      const to = body.to
      const amount = new BigNumber(body.amount)
      const tokenContract = body.tokenContract
      if (tokenContract) {
        ctx.response.body = await this.vm.machinomyFacade.transferToken(tokenContract, to, amount)
      } else {
        const tx = await this.vm.machinomyFacade.transferEth(to, amount)
        ctx.response.body = {
          tx: tx
        }
      }
    } else {
      ctx.response.status = 400
    }
  }

  async handleCloseChannelsByNeighbourId (ctx: Router.IRouterContext) {
    this.setCorsHeaders(ctx)
    const neighbourId = ctx.params.neighbourId
    try {
      const { result1, result2 } = await this.presentation.doCloseChannelByNeighbourId(neighbourId)
      ctx.response.body = {
        result1,
        result2
      }
    } catch (e) {
      console.error(e)
      ctx.response.status = 404
    }
  }

  async handleCloseChannel (ctx: Router.IRouterContext) {
    this.setCorsHeaders(ctx)
    const channelId = ctx.params.channelId
    try {
      const result = await this.vm.machinomyFacade.doCloseChannel(channelId)
      ctx.response.body = {
        ...result
      }
    } catch (e) {
      console.error(e)
      ctx.response.status = 404
    }
  }

  async handleGetMeter (ctx: Router.IRouterContext) {
    this.setCorsHeaders(ctx)
    ctx.response.body = await this.presentation.balanceState()
  }

  async getUserData (ctx: Router.IRouterContext) {
    this.setCorsHeaders(ctx)
    ctx.response.body = await this.presentation.userDataState()
  }

  async getUserFullData (ctx: Router.IRouterContext) {
    this.setCorsHeaders(ctx)
    ctx.response.body = await this.presentation.userFullDataState()
  }

  async getSettingsData (ctx: Router.IRouterContext) {
    this.setCorsHeaders(ctx)
    ctx.response.body = await this.presentation.settingsDataState()
  }

  async getUserNeighbours (ctx: Router.IRouterContext) {
    this.setCorsHeaders(ctx)
    const neighbours = await this.presentation.getNeighbours()
    ctx.response.body = {
      neighbours: neighbours.map(value => {
        return {
          neighbourId: value.neighbourId
        }
      })
    }
  }

  async postSettingsData (ctx: Router.IRouterContext) {
    this.setCorsHeaders(ctx)
    const body = JSON.parse(ctx.request.body as string)
    if (body) {
      ctx.response.body = await this.presentation.updateDataState(body)
    } else {
      ctx.response.status = 400
    }
  }
}
