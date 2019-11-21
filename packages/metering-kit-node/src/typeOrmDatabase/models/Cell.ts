import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, OneToOne, JoinColumn } from 'typeorm'
import { Channel } from './Channel'
import { Neighbour } from './Neighbour'
import { LoadControl } from './LoadControl'
import { Generator } from './Generator'

@Entity()
export class Cell extends BaseEntity {
  @PrimaryGeneratedColumn()
  cellId!: string

  @Column()
  cellName!: string

  @Column({ nullable: true })
  ipAddress?: string

  @Column({ default: 0, type: 'bigint' })
  onchainBalance!: number

  @OneToOne(type => Generator)
  @JoinColumn()
  generator!: Generator

  @Column({ default: 0, type: 'real' })
  netPower!: number

  @Column({ default: 0, type: 'real' })
  fullNetPower!: number

  @Column({ default: 0 })
  netPowerUpdateTime!: number

  @Column({ default: 0, type: 'real' })
  netCost!: number

  @Column({ default: 0, type: 'real' })
  fullNetCost!: number

  @Column({ default: 0 })
  netCostUpdateTime!: number

  @Column({ default: false })
  loadControl!: boolean

  @Column({ default: false })
  pToPStatus!: boolean

  @OneToMany(type => LoadControl, loadControl => loadControl.cell)
  loadControls?: LoadControl[]

  @Column({ nullable: true, default: 'no' })
  strategy!: string

  @Column({ default: false })
  demandBalance!: boolean

  @OneToMany(type => Neighbour, neighbour => neighbour.cell)
  neighbours?: Neighbour[]

  @Column({ nullable: true })
  upstreamAddress!: string

  @OneToMany(type => Channel, chanel => chanel.cell)
  chanels?: Channel[]
}
