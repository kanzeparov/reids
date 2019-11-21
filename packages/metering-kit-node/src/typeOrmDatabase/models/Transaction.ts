import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from 'typeorm'
import { Channel } from './Channel'

@Entity()
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  transactionId!: string

  @Column()
  mqttTransactionId!: string

  @Column({ default: 0 })
  port!: number

  @Column({ default: 0 })
  mode!: number

  @Column({ default: 0, type: 'real' })
  amount!: number

  @Column({ default: 0, type: 'real' })
  cost!: number

  @Column({ default: 0, type: 'bigint' })
  transactionTime!: number

  @Column({ default: false })
  approved!: boolean

  @Column({ nullable: true })
  reason!: string

  @Column({ default: 0 })
  progress!: number

  @Column({ default: 0 })
  progressProcent!: number

  @Column({ default: false })
  paymentState!: boolean

  @ManyToOne(type => Channel, chanel => chanel.transactions)
  channel?: Channel
}
