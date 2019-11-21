import * as Sequelize from 'sequelize'

export interface AddError {
  type: number
  account: string
  timestamp: number
}

export interface ErrorAttr extends Sequelize.Model<ErrorAttr, AddError> {
  type: number
  account: string
  timestamp: number
}

export const Errors = (sequalize: Sequelize.Sequelize) => {

  const res = sequalize.define<ErrorAttr, AddError>('Errors', {
    timestamp: { type: Sequelize.BIGINT, allowNull: false },
    account: { type: Sequelize.STRING, allowNull: false },
    type: { type: Sequelize.BIGINT, allowNull: false }
  }, {
    timestamps: false,
    tableName: 'errors',
    indexes: [{
      unique: true,
      fields: ['account', 'timestamp', 'type']
    }]
  })
  res.removeAttribute('id')
  return res
}
