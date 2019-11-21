import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Generator extends BaseEntity {
  @PrimaryGeneratedColumn()
  generatorId!: string

  @Column({ default: '' })
  generatorType!: string

  @Column({ default: '' })
  propertyType!: string

  @Column({ default: 0 })
  propertyValue!: number

  @Column({ default: 0, type: 'real' })
  power!: number

  @Column({ default: 0, type: 'real' })
  fullPower!: number

  @Column({ default: 0 })
  powerUpdateTime!: number
}
