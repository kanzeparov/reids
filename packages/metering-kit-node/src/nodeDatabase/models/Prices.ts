import * as Sequelize from 'sequelize'
import BigNumberColumn from './BigNumberColumn'
import TimestampColumn from './TimestampColumn'

export interface AddPrices {
  price: number
  timestamp: number
}

export interface PricesAttr extends Sequelize.Model<PricesAttr, AddPrices> {
  price: number
  timestamp: number
}

export const Prices = (sequalize: Sequelize.Sequelize) => {

  const Prices = sequalize.define<PricesAttr, AddPrices>('Prices', {
    price: { type: BigNumberColumn, allowNull: false },
    timestamp: { type: TimestampColumn, allowNull: false }
  }, {
    timestamps: false,
    tableName: 'prices',
    rejectOnError: true,
    freezeTableName: true
  })

  Prices.removeAttribute('id')

  return Prices
}
