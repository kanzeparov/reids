import { ModuleType, IModule, IMeterConfiguration } from '@onder/interfaces'
import * as express from 'express'
import { scheduleJob } from 'node-schedule'
import mapper from './WifiConfigMapper'
import * as yaml from 'js-yaml'
import * as fs from 'fs'
import * as shelljs from 'shelljs'
import * as moment from 'moment'
import { Utils } from '@onder/common'
import Logger from './Logger'
import axios from 'axios'

const log = new Logger('wifi-point-service')

function base64Encode (str: string) {
  return Buffer.from(str).toString('base64')
}

function shellExec (command: string, callback?: shelljs.ExecCallback) {
  if (callback) {
    shelljs.exec(command, callback)
  } else {
    shelljs.exec(command)
  }
  log.debug('executed: ' + command)
}

const PING_SCHEDULE = '0 */3 * * * *'

export default class WifiPointService implements IModule {
  isRunning: boolean
  meterConfiguration: Array<IMeterConfiguration>
  isClientMode: boolean
  connected: boolean
  lastWatchTime?: moment.Moment
  wifiConfigPath: string = Utils.getConfigurationDir() + 'wifiConfig.yml'

  constructor (meterConfiguration: Array<IMeterConfiguration>) {
    this.meterConfiguration = meterConfiguration
    this.isRunning = false
    this.connected = false
    this.isClientMode = true
  }

  getType (): any {
    return ModuleType.WifiService
  }

  async init (): Promise<void> {
    if (!this.isRunning) {
      scheduleJob(PING_SCHEDULE, () => {
        if (!this.lastWatchTime || moment.utc().subtract(10, 'second').valueOf() > this.lastWatchTime.valueOf()) {
          this.pingTask()
        }
      })
    }
    return Promise.resolve()
  }

  pingTask (): void {
    if (!this.isClientMode) {
      log.debug('server is Client')
      this.toClientMode()
      setTimeout(() => {
        this.pingTask()
      }, 10000) // TODO: check retry after 10 sec
    }
    this.ping().then(() => this.pingOk()).catch(() => {
      this.pingError()
      this.connected = false
    })
  }

  async ping (): Promise<Object> {
    const yandex = 'http://ya.ru'
    return axios.get(yandex)
  }

  pingOk (): void {
    this.connected = true
    log.debug('pingOk')
  }

  pingError (): void {
    if (this.isClientMode) {
      this.toAccessPointMode()
    }
    log.debug('ping error')
  }

  routes (): express.Router {
    let r = express.Router()
    r.get('/', (req: express.Request, res: express.Response, next: express.NextFunction): void => {
      const meterUrls = this.getMeterUrls(this.meterConfiguration)
      res.status(200).send(meterUrls)
    })
    r.get('/connection', (req: express.Request, res: express.Response, next: express.NextFunction): void => {
      res.status(200).send({ connected: this.connected })
    })
    r.get('/watching', (req: express.Request, res: express.Response, next: express.NextFunction): void => {
      this.watchingPage()
      res.status(200).send()
    })
    r.post('/configuration', this.saveWifiConfigRoute)
    r.get('/configuration', this.getWifiConfigRoute)
    return r
  }

  getMeterUrls (meterConfigs: Array<IMeterConfiguration>): Array<string> {
    return meterConfigs.map(config => config.account + '.onder.com') // FIXME Use resolver
  }

  private saveWifiConfigRoute (req: express.Request, res: express.Response, next: express.NextFunction): void {
    const wifiConfig = mapper.mapWifiConfig(req)
    const { ssid, encryption, password } = wifiConfig

    this.saveConfiguration(wifiConfig)
    .catch((reason: any) => {
      log.error(`Error when saving configuration ${reason}`)
    })
    shellExec(`cd wifiscripts && bash -x wifi.sh save_client "${base64Encode(ssid)}" "${base64Encode(encryption)}" "${base64Encode(password)}"`, (error: any, stdout: any, stderr: any) => {
      this.isClientMode = true
      if (error) {
        log.error(`exec error: ${error}`)
        this.isClientMode = false
      }
    })
    res.status(200).send()
  }

  private getWifiConfigRoute (req: express.Request, res: express.Response, next: express.NextFunction): void {
    try {
      this.watchingPage()
      const wifiConfigExists = fs.existsSync(this.wifiConfigPath)
      if (wifiConfigExists) {
        res.send(yaml.safeLoad(fs.readFileSync(this.wifiConfigPath, 'utf8')))
        return
      }

      res.status(404).send({ status: 'No config file yet' })
    } catch (err) {
      log.error(`e getWifiConfigRoute ${err}`)
      throw err
    }
  }

  private saveConfiguration (wifiConfig: Object): Promise<void> {
    return new Promise((resolve, reject) => {
      const serializedConfig = yaml.dump(wifiConfig)
      fs.writeFile(this.wifiConfigPath, serializedConfig, err => {
        err ? reject(err) : resolve(err)
      })
    })
  }

  toAccessPointMode (): void {
    shellExec('cd wifiscripts && bash wifi.sh set_ap',error => {
      this.isClientMode = false
      if (error) {
        log.error(`exec error: ${error}`)
        this.isClientMode = true
      }
    })
    log.info('server is AccssesPoint')
  }

  toClientMode (): void {
    shellExec('cd wifiscripts && bash wifi.sh set_client',error => {
      this.isClientMode = true
      if (error) {
        log.error(`exec error: ${error}`)
        this.isClientMode = false
      }
    })
    log.info('server is Client')
  }

  watchingPage (): void {
    this.lastWatchTime = moment.utc()
  }
}
