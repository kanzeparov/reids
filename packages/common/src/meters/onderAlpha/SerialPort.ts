import Port from 'serialport'
import { Buffer } from 'buffer'
import Logger from '../Logger'
import { Mutex } from 'await-semaphore'

const log = new Logger('onder-alpha-serial-port')

let mutex = new Mutex()

export function crc16 (buffer: Buffer): Buffer {
  let crc = 0xFFFF
  buffer.forEach(byte => {
    crc = crc ^ byte
    for (let j = 0; j < 8; j++) {
      let odd = crc & 0x0001
      crc = crc >> 1
      if (odd) {
        crc = crc ^ 0xA001
      }
    }
  })

  let checksum = Buffer.from(crc.toString(16), 'hex')
  return checksum.swap16()
}

export default class SerialPort {
  readonly serialPort: Port

  constructor (path: string) {
    this.serialPort = new Port(path, {
      baudRate: 115200,
      parity: 'none',
      dataBits: 8,
      stopBits: 1,
      autoOpen: true
    })
    this.serialPort.on('error', error => {
      log.error('Got error %o', error)
    })
  }

  get path () {
    return this.serialPort.path
  }

  async open (): Promise<void> {
    return mutex.use(async () => {
      log.debug(`Opening port ${this.path}`)
      return new Promise<void>(resolve => {
        const check = () => {
          if (this.serialPort.isOpen) {
            resolve()
          } else {
            setTimeout(check, 200)
          }
        }
        check()
      })
    })
  }

  async ask (message: Buffer, isDone: (b: Buffer) => boolean): Promise<Buffer> {
    return mutex.use(async () => {
      await this.write(message)
      return this.readUntil(isDone)
    })
  }

  async askHex (query: string, isDone: (b: Buffer) => boolean): Promise<Buffer> {
    return mutex.use(async () => {
      await this.writeHex(query)
      return this.readUntil(isDone)
    })
  }

  private async writeHex (query: string): Promise<void> {
    let sanitized = query.replace(/\s+/g, '')
    return this.write(Buffer.from(sanitized, 'hex'))
  }

  private async write (message: Buffer): Promise<void> {
    let crc = crc16(message)
    let query = Buffer.concat([message, crc])
    log.debug(`Writing to ${this.path}: ${query.toString('hex')}`)
    return new Promise<void>((resolve, reject) => {
      this.serialPort.write(query, error => {
        if (error) {
          log.error(`Can not write to port ${this.path}`)
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  private async readUntil (isDone: (b: Buffer) => boolean): Promise<Buffer> {
    let accumulator = Buffer.alloc(0)
    const port = this.serialPort

    return new Promise<Buffer>((resolve, reject) => {
      function onData (error: any) {
        if (error) {
          return reject(error)
        }
        let chunk = port.read() as Buffer
        if (chunk) {
          log.debug(`Got chunk of length ${chunk.length}`)
          accumulator = Buffer.concat([accumulator, chunk])
          if (isDone(accumulator)) {
            log.debug(`Read from port ${port.path}: 0x${chunk.toString('hex')}`)
            port.removeAllListeners('readable')
            resolve(accumulator)
          }
        }
      }
      port.on('readable', onData)
    })
  }
}
