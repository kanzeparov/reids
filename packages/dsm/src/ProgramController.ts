import Logger from './Logger'
import * as Router from 'koa-router'
import { ProgramService } from './ProgramService'

const log = new Logger('program-controller')

export interface PostProgramRequest {
  program: string
  programOptions: any
}

export class ProgramController {
  readonly programService: ProgramService

  constructor (programService: ProgramService) {
    this.programService = programService
  }

  async init () {
    await this.programService.init()
  }

  router () {
    let router = new Router()
    router.get('/list', this.getProgramListHandler.bind(this))
    router.get('/', this.getProgramHandler.bind(this))
    router.get('/options', this.getProgramOptionsHandler.bind(this))
    router.post('/', this.postProgramHandler.bind(this))
    return router
  }

  async getProgramHandler (ctx: Router.IRouterContext) {
    const program = await this.programService.currentProgram()
    ctx.status = 200
    ctx.response.body = {
      'value': program
    }
  }

  async getProgramListHandler (ctx: Router.IRouterContext) {
    const list = await this.programService.getProgramList()
    log.info(`Program list = ${list}`)
    ctx.status = 200
    ctx.response.body = {
      'value': list
    }
  }

  async getProgramOptionsHandler (ctx: Router.IRouterContext) {
    const options = await this.programService.getProgramOptions()
    log.info(`Program options = ${options}`)
    ctx.status = 200
    ctx.response.body = {
      'value': options
    }
  }

  async postProgramHandler (ctx: Router.IRouterContext) {
    const request = ctx.request.body as PostProgramRequest
    ctx.response.body = await this.programService.setCurrentProgram(request.program, request.programOptions)
    ctx.status = 200
  }
}
