import * as Sequelize from 'sequelize'
import TimestampColumn from './TimestampColumn'

export interface AddError {
  key: string
  timestamp: number
  type: number
  meta: string
}

export interface ErrorAttr extends Sequelize.Model<ErrorAttr, AddError> {
  key: string
  timestamp: number
  type: number
  meta: string
}

export const Errors = (sequalize: Sequelize.Sequelize) => {

  const res = sequalize.define<ErrorAttr, AddError>('Errors', {
    key: { type: Sequelize.STRING, allowNull: false },
    timestamp: { type: TimestampColumn, allowNull: false },
    type: { type: Sequelize.INTEGER, allowNull: false },
    meta: { type: Sequelize.STRING, allowNull: false }
  }, {
    timestamps: false,
    tableName: 'errors',
    rejectOnError: true,
    indexes: [{
      unique: true,
      fields: ['key', 'timestamp', 'type']
    }]
  })
  res.removeAttribute('id')
  return res
}
