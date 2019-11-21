import * as Sequelize from 'sequelize'
import BigNumberColumn from './BigNumberColumn'
import TimestampColumn from './TimestampColumn'

export interface AddDownstreamPayments {
  power: number
  price: number
  token: string
  downstreamKey: string
  upstreamKey: string
  timestamp: number
}

export interface DownstreamPaymentsAttr extends Sequelize.Model<DownstreamPaymentsAttr, AddDownstreamPayments> {
  power: number
  price: number
  token: string
  downstreamKey: string
  upstreamKey: string
  timestamp: number
}

export const DownstreamPayments = (sequalize: Sequelize.Sequelize) => {

  const DownstreamPayments = sequalize.define<DownstreamPaymentsAttr, AddDownstreamPayments>('DownstreamPayments', {
    power: { type: BigNumberColumn, allowNull: false },
    price: { type: BigNumberColumn, allowNull: false },
    token: { type: Sequelize.STRING, allowNull: false },
    downstreamKey: { type: Sequelize.STRING, allowNull: false },
    upstreamKey: { type: Sequelize.STRING, allowNull: false },
    timestamp: { type: TimestampColumn, allowNull: false }
  }, {
    timestamps: false,
    tableName: 'downstream_payments',
    rejectOnError: true,
    indexes: [{
      unique: true,
      fields: ['downstreamKey', 'upstreamKey', 'timestamp']
    }, {
      index: 'FULLTEXT',
      fields: ['token']
    }]
  })

  DownstreamPayments.removeAttribute('id')
  return DownstreamPayments
}
