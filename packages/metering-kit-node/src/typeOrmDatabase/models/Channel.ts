import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, OneToMany } from 'typeorm'
import { Cell } from './Cell'
import { Transaction } from './Transaction'

@Entity()
export class Channel extends BaseEntity {
  @PrimaryGeneratedColumn()
  channelId!: string

  @ManyToOne(type => Cell, cell => cell.chanels)
  cell?: Cell

  @Column()
  seller!: string

  @Column()
  contragent!: string

  @Column()
  channelAddress?: string

  @OneToMany(type => Transaction, transaction => transaction.channel)
  transactions?: Transaction[]

  @Column({ default: false })
  active!: boolean

  @Column({ default: 0, type: 'bigint' })
  offchainBalance!: number
}
