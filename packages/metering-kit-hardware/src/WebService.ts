import * as express from 'express'
import * as bodyParser from 'body-parser'
import { resolve } from 'path'
import * as history from 'connect-history-api-fallback'
import Logger from './Logger'

const log = new Logger('web-service')

function expressApplication (routes: Map<string, express.Router>): express.Application {
  let app = express()
  app.use(bodyParser.json())
  routes.forEach((r, prefix) => {
    app.use(prefix, r)
  })
  app.use(history())
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
  })
  app.use('/', express.static(resolve('../frontend/hardware'), { fallthrough: true }))
  const router = express.Router()
  router.get('/', (req, res) => {
    res.redirect('/index.html')
  })
  app.use(router)
  return app
}

export default class WebService {
  private readonly port: number
  private readonly hostname: string

  private routers: Map<string, express.Router> = new Map()

  constructor (port: number, host: string) {
    this.port = port
    this.hostname = host
  }

  run (): void {
    let app = expressApplication(this.routers)
    app.listen(this.port, this.hostname, () => {
      log.info(`Listening on port ${this.port}!`)
    })
  }

  attach (prefix: string, router: express.Router): void {
    if (this.routers.has(prefix)) {
      throw new Error(`Attempt to redefine route to ${prefix} prefix`)
    }

    this.routers.set(prefix, router)
  }
}
