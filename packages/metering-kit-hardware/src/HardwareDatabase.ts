import * as sqlite3 from 'sqlite3'
import { IHardwareDatabase, IMeterValue } from '@onder/interfaces'
import { MeterValue } from '@onder/common'
import * as moment from 'moment'
import { BigNumber } from 'bignumber.js'

const sqlitePrifix = 'sqlite://'

export default class HardwareDatabase implements IHardwareDatabase {
  private db: sqlite3.Database

  constructor (databaseUrl: string) {
    let connnectionString = databaseUrl
    if (connnectionString.startsWith(sqlitePrifix)) {
      connnectionString = connnectionString.substr(sqlitePrifix.length)
    }
    this.db = new (sqlite3.verbose()).Database(connnectionString)
  }

  async createTables (): Promise<void> {
    const query = 'CREATE TABLE IF NOT EXISTS meterValues (meterKey VARCHAR(255), value DOUBLE, delta DOUBLE, datetime INTEGER, PRIMARY KEY (meterKey, datetime))'
    await this.run(query)
  }

  async addMeterValues (meterId: string, meterValues: IMeterValue[]): Promise<void> {
    const values = meterValues.map(() => `(?, ?, ?, ?)`).join(',')

    const params: any[] = []
    meterValues.forEach(meterValue => {
      params.push(meterId)
      params.push(meterValue.value.toNumber())
      params.push(meterValue.delta.toNumber())
      params.push(meterValue.datetime.valueOf())
    })

    const query = `INSERT INTO meterValues ('meterKey', 'value', 'delta', 'datetime') VALUES ${values};`
    await this.run(query, params)
  }

  async getAllMeterValues (meterId: string, limit: number): Promise<IMeterValue[]> {
    const rows = await this.all(`SELECT * FROM meterValues WHERE meterKey = ? ORDER BY datetime ASC LIMIT ?;`, [meterId, limit])
    return rows.map(meterValue => new MeterValue(
      new BigNumber(meterValue.value),
      new BigNumber(meterValue.delta),
      moment(meterValue.datetime).utc(),
      new BigNumber(0)
    ))
  }

  async clearAllMeterValues (meterId: string, meterValues: IMeterValue[]): Promise<void> {
    const timePoints = meterValues.map(v => v.datetime.valueOf()).join(',')
    const query = `DELETE FROM meterValues WHERE meterKey = "${meterId}" AND datetime in (${timePoints});`
    await this.run(query)
  }

  async clearAll (): Promise<void> {
    await this.run('DELETE FROM meterValues;')
  }

  async run (query: string, params?: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.run(query, params, error => {
        error ? reject(error) : resolve()
      })
    })
  }

  async all (query: string, params?: any): Promise<Array<any>> {
    return new Promise<Array<any>>((resolve, reject) => {
      this.db.all(query, params, (error, rows) => {
        error ? reject(error) : resolve(rows)
      })
    })
  }
}
