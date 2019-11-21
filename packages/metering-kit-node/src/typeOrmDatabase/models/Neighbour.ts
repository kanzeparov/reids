import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from 'typeorm'
import { Cell } from './Cell'

@Entity()
export class Neighbour extends BaseEntity {
  @PrimaryGeneratedColumn()
  neighbourId!: string

  @Column({ default: '', unique: true })
  neighbourName!: string

  @Column({ default: 0, type: 'real' })
  power!: number

  @Column({ default: 0, type: 'real' })
  fullPower!: number

  @Column({ default: 0 })
  powerUpdateTime!: number

  @Column({ default: 0, type: 'real' })
  cost!: number

  @Column({ default: 0, type: 'real' })
  fullCost!: number

  @Column({ default: 0 })
  costUpdateTime!: number

  @Column({ default: 0 })
  offchainBalance!: number

  @Column()
  upstreamAddress!: string

  @Column({ default: false })
  connectStatus!: boolean

  @Column({ default: false })
  direction!: boolean

  @ManyToOne(type => Cell, cell => cell.neighbours)
  cell?: Cell
}
