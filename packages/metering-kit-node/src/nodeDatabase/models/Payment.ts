import * as sequelize from 'sequelize'
import BigNumberColumn from './BigNumberColumn'

export interface AddPayment {}

export interface PaymentAttr extends sequelize.Model<PaymentAttr, AddPayment> {
  id: number
  channelId: string
  kind: string
  token: string
  sender: string
  receiver: string
  price: number
  value: number
  channelValue: number
  v: number
  r: string
  s: string
  meta: string
  contractAddress: string
  createdAt: number
  tokenContract: string,
  counterpart: string
  powerSells: number
  totalSells: number
}

export const Payment = (s: sequelize.Sequelize) => {
  // We do not need to create this table. It exist in machinomy
  return s.define<PaymentAttr, AddPayment>('Payment', {
    id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    kind: { type: sequelize.STRING },
    token: { type: sequelize.STRING, allowNull: false, unique: true },
    sender: { type: sequelize.STRING },
    receiver: { type: sequelize.STRING },
    price: { type: BigNumberColumn },
    value: { type: BigNumberColumn },
    channelValue: { type: BigNumberColumn },
    v: { type: sequelize.INTEGER },
    r: { type: sequelize.STRING },
    s: { type: sequelize.STRING },
    meta: { type: sequelize.STRING },
    contractAddress: { type: sequelize.STRING },
    createdAt: { type: sequelize.DECIMAL(64, 0) },
    tokenContract: { type: sequelize.STRING }
  }, {
    timestamps: false,
    rejectOnError: true,
    tableName: 'payment'
  })
}
