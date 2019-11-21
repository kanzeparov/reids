import * as Sequelize from 'sequelize'
import { TradeAttr } from './Trades'
import BigNumberColumn from './BigNumberColumn'
import TimestampColumn from './TimestampColumn'

export interface AddMeasurement {
  ID_measurements?: number
  key: string
  value: number
  delta: number
  timestamp: number
}

export interface MeasurementAttr extends Sequelize.Model<MeasurementAttr, AddMeasurement> {
  ID_measurements: number
  key: string
  value: number
  delta: number
  timestamp: number
  trade?: TradeAttr
}

export const Measurements = (sequalize: Sequelize.Sequelize) => {

  return sequalize.define<MeasurementAttr, AddMeasurement>('Measurements', {
    ID_measurements: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: Sequelize.STRING, allowNull: false },
    value: { type: BigNumberColumn, allowNull: false },
    delta: { type: BigNumberColumn, allowNull: false },
    timestamp: { type: TimestampColumn, allowNull: false }
  }, {
    timestamps: false,
    tableName: 'measurements',
    rejectOnError: true,
    indexes: [{
      unique: true,
      fields: ['key', 'timestamp']
    }]
  })
}
