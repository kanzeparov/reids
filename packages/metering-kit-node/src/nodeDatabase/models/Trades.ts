import * as Sequelize from 'sequelize'

export interface AddTrade {
  ID_trades?: number
  ID_measurements: number
  token: string
  timestamp: number
}

export interface TradeAttr extends Sequelize.Model<TradeAttr, AddTrade> {
  ID_trades: number
  ID_measurements: number
  token: string
  timestamp: number
}

export const Trades = (sequalize: Sequelize.Sequelize) => {
  return sequalize.define<TradeAttr, AddTrade>('Trades', {
    ID_trades: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    ID_measurements: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'measurements',
        key: 'ID_measurements'
      }
    },
    token: { type: Sequelize.STRING, allowNull: false },
    timestamp: { type: Sequelize.DECIMAL(64, 0), allowNull: false }
  }, {
    timestamps: false,
    rejectOnError: true,
    tableName: 'trades'
  })
}
