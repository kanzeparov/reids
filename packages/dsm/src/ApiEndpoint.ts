import * as http from 'http'
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as session from 'koa-session'
import * as Router from 'koa-router'
import { ProgramController } from './ProgramController'
import Logger from './Logger'
import * as koaLogger from 'koa-logger'
import * as cors from '@koa/cors'
const log = new Logger('api-endpoint')

export class ApiEndpoint {
  app: Koa
  port: number
  host: string
  server?: http.Server
  programController: ProgramController

  constructor (host: string, port: number, programController: ProgramController) {
    this.port = port
    this.host = host
    this.app = new Koa()
    this.app.use(koaLogger((str, args) => {
      log.info(str, args)
    }))
    this.app.use(session({
      maxAge: 86400000
    }, this.app))
    this.app.use(bodyParser())
    this.app.use(cors({ origin: '*' }))
    let router = new Router()
    router.use('/program', programController.router().routes())
    router.use('/program', programController.router().allowedMethods())
    this.app.use(router.routes())
    this.app.use(router.allowedMethods())
    this.app.use(async ctx => {
      ctx.status = 400
    })
    this.programController = programController
  }

  async start (): Promise<void> {
    log.info('Starting...')
    return new Promise<void>(async (resolve: any) => {
      await this.programController.init()
      this.server = this.app.listen(this.port, this.host, () => {
        log.info(`Listening ${this.host}:${this.port}`)
        resolve()
      })
    })
  }

  async stop (): Promise<void> {
    log.info('Stopping...')
    return new Promise<void>(resolve => {
      if (this.server) {
        this.server.close(() => {
          log.info('Stopped')
          resolve()
        })
      } else {
        resolve()
      }
    })
  }
}
