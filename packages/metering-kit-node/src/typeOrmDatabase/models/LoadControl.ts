import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from 'typeorm'
import { Cell } from './Cell'

@Entity()
export class LoadControl extends BaseEntity {
  @PrimaryGeneratedColumn()
  controlId!: string

  @Column({ default: '' })
  roomName!: string

  @Column({ default: 0 })
  priority!: number

  @Column({ default: false })
  isWork!: boolean

  @Column({ default: 0, type: 'real' })
  roomLoad!: number

  @Column({ default: 0, type: 'real' })
  fullRoomLoad!: number

  @Column({ default: 0 })
  roomLoadUpdateTime!: number

  @ManyToOne(type => Cell, cell => cell.neighbours)
  cell?: Cell
}
