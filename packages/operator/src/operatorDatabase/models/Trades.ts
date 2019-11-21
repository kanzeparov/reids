import * as Sequelize from 'sequelize'

export interface AddTrade {
  ID_trades?: number
  sender: string
  receiver: string
  timestamp: number
  value: number
  price: number
}

export interface TradeAttr extends Sequelize.Model<TradeAttr, AddTrade> {
  ID_trades?: number
  sender: string
  receiver: string
  timestamp: number
  value: number
  price: number
}

export const Trades = (sequalize: Sequelize.Sequelize) => {
  return sequalize.define<TradeAttr, AddTrade>('Trades', {
    ID_trades: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    sender: { type: Sequelize.STRING, allowNull: false },
    receiver: { type: Sequelize.STRING, allowNull: false },
    timestamp: { type: Sequelize.BIGINT, allowNull: false },
    value: { type: Sequelize.DECIMAL(10, 5), allowNull: false },
    price: { type: Sequelize.DECIMAL(10, 5), allowNull: false }
  }, {
    timestamps: false,
    tableName: 'trades'
  })
}
