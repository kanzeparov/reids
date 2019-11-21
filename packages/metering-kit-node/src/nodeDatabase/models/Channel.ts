import * as Sequelize from 'sequelize'
import BigNumberColumn from './BigNumberColumn'

export interface AddChannel {
  channelId?: string
  kind: string
  sender: string
  receiver: string
  value: number
  spent: number
  state: number
  contractAddress: string
  tokenContract: string
}

export interface ChannelAttr extends Sequelize.Model<ChannelAttr, AddChannel> {
  channelId: string
  kind: string
  sender: string
  receiver: string
  value: number
  spent: number
  state: number
  contractAddress: string
  tokenContract: string
  dataValues: {
    counterpart: string
    total: number
  }
}

export const Channel = (sequelize: Sequelize.Sequelize) => {
  // We do not need to create this table. It exist in machinomy
  return sequelize.define<ChannelAttr, AddChannel>('Channel', {
    channelId: { type: Sequelize.STRING, primaryKey: true },
    kind: { type: Sequelize.STRING, allowNull: false },
    sender: { type: Sequelize.STRING, allowNull: false },
    receiver: { type: Sequelize.STRING, allowNull: false },
    value: { type: BigNumberColumn, allowNull: false },
    spent: { type: BigNumberColumn, allowNull: false },
    state: { type: Sequelize.SMALLINT, allowNull: false },
    contractAddress: { type: Sequelize.STRING },
    tokenContract: { type: Sequelize.STRING }
  }, {
    timestamps: false,
    rejectOnError: true,
    tableName: 'channel'
  })
}
