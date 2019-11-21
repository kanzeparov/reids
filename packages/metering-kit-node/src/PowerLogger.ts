import { IMeterValue } from '@onder/interfaces'
import NodeDatabase from './typeOrmDatabase/nodeDatabase'

export default class PowerLogger {
  db: NodeDatabase

  constructor (db: NodeDatabase) {
    this.db = db
  }

  addMeasurement (value: IMeterValue): Promise<void> {
    return Promise.resolve()
    // return this.db.requests.addMeasurement(value)
  }
}
