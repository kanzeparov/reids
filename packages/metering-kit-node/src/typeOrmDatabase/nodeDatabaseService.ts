import NodeDatabase from './nodeDatabase'
import { getCustomRepository, Repository, Transaction as TOTransaction, TransactionRepository as TOTransactionRepository } from 'typeorm'
import { CellRepository } from './repositories/CellRepository'
import { ChannelRepository } from './repositories/ChannelRepository'
import { LoadControlRepository } from './repositories/LoadControlRepository'
import { NeighbourRepository } from './repositories/NeighbourRepository'
import { TransactionRepository } from './repositories/TransactionRepository'
import { GeneratorRepository } from './repositories/GeneratorRepository'
import Logger from '../Logger'
import { Cell } from './models/Cell'
import { Generator } from './models/Generator'
import { SettingsDataState } from '../WebEndpoints/MetersPresentation'
import { Transaction } from './models/Transaction'
import { IMeterMqttBaseValue } from '@onder/interfaces'
import { LoadControl } from './models/LoadControl'

const logger = new Logger('nodeDatabase')

const UPDATE_POWER_FACTOR = 3.6

export class NodeDatabaseService {
  private readonly db: NodeDatabase
  public readonly cellRepository: CellRepository = getCustomRepository(CellRepository)
  public readonly channelRepository: ChannelRepository = getCustomRepository(ChannelRepository)
  public readonly loadControlRepository: LoadControlRepository = getCustomRepository(LoadControlRepository)
  public readonly neighbourRepository: NeighbourRepository = getCustomRepository(NeighbourRepository)
  public readonly transactionRepository: TransactionRepository = getCustomRepository(TransactionRepository)
  public readonly generatorRepository: GeneratorRepository = getCustomRepository(GeneratorRepository)

  constructor (db: NodeDatabase) {
    this.db = db
  }

  async getUppstreamAccountByContragent (contragent: string): Promise<string> {
    const neighbour = await this.neighbourRepository.findOne({ neighbourName: contragent })
    return neighbour ? neighbour.upstreamAddress : ''
  }

  async initCellState (upstreamAccount: string, cellName: string): Promise<string> {
    let foundedCell = await this.cellRepository.findOne({ upstreamAddress: upstreamAccount })
    logger.info(`founded Cell: ${foundedCell}`)
    if (!foundedCell) {
      const generator = await this.generatorRepository.findOne({ generatorType: 'absent' })
      foundedCell = await this.cellRepository.save({ upstreamAddress: upstreamAccount, cellName: cellName, generator: generator })
      logger.info(`created Cell: ${foundedCell.cellName}`)
    }
    return foundedCell.cellId
  }

  async getCell (): Promise<Cell> {
    return this.cellRepository.findOneOrFail({
      relations: ['generator', 'loadControls', 'neighbours']
    })
  }

  async getGenerators (): Promise<Generator[]> {
    return this.generatorRepository.find()
  }

  @TOTransaction({ isolation: 'SERIALIZABLE' })
  async postSettingsDataWrappedByTransaction (
    body: SettingsDataState,
    @TOTransactionRepository() generatorRepository: GeneratorRepository,
    @TOTransactionRepository() cellRepository: CellRepository,
    @TOTransactionRepository() loadControlRepository: LoadControlRepository
  ): Promise<void> {
    try {
      const newGenerator = await generatorRepository.findOneOrFail({
        where: {
          generatorType: body.currentGeneratorName
        }
      })

      const cellId = (await cellRepository.findOneOrFail()).cellId

      await cellRepository.update({
        cellId: cellId
      }, {
        cellName: body.mains[0],
        ipAddress: body.mains[1],
        generator: newGenerator,
        pToPStatus: body.p2p.status,
        strategy: body.p2p.current,
        demandBalance: body.balance.status,
        loadControl: body.managedLoad.status
      })
    } catch (e) {
      logger.info('Error while parsing: ', e.message)
    }

    body.radios.slice(1).forEach(async function (value) {
      try {
        await generatorRepository.update({
          generatorType: value.label
        }, {
          power: value.inputTypes[0],
          propertyValue: value.inputTypes[1]
        })
      } catch (e) {
        logger.info('Error while parsing: ', e.message)
      }
    })

    body.managedLoad.items.forEach(async function (value) {
      try {
        await loadControlRepository.update({
          controlId: value.id
        }, {
          roomName: value.name,
          priority: value.priority
        })
      } catch (e) {
        logger.info('Error while parsing: ', e.message)
      }
    })
  }

  async postSettingsData (body: SettingsDataState): Promise<void> {
    return this.postSettingsDataWrappedByTransaction(body, this.generatorRepository, this.cellRepository, this.loadControlRepository)
  }

  async updateTransactionFromMqtt (value: IMeterMqttBaseValue): Promise<Transaction> {
    const channel = await this.channelRepository.findOne({ seller: value.seller, contragent: value.contragent })
    // if (!channel) throw new Error(`channel for contragent ${value.contragent} is empty`)
    logger.info(`founded channel ${channel ? channel.channelId : undefined}`)
    logger.info(`timeStamp is ${value.timeStamp}`)
    return this.transactionRepository.save({
      amount: value.amount,
      port: value.port,
      mode: value.mode,
      cost: value.cost,
      mqttTransactionId: value.id,
      transactionTime: parseInt(value.timeStamp, 10),
      channel: channel,
      approved: value.approved
    })
  }

  async updateOnchainBalance (upstreamAddress: string, balance: number): Promise<void> {
    await this.cellRepository.update({ upstreamAddress: upstreamAddress }, { onchainBalance: balance })
  }

  async saveNeighbour (neighbourName: string, upstreamAddress: string): Promise<void> {
    const cell = await this.getCell()
    if (!cell) return

    const neighbour = await this.neighbourRepository.findOne({
      neighbourName: neighbourName,
      upstreamAddress: upstreamAddress
    })

    if (neighbour) return

    logger.info('neighbourName: ', neighbourName)
    logger.info('upstreamAddress: ', upstreamAddress)
    logger.info('cell: ', cell)

    try {
      await this.neighbourRepository.save({
        neighbourName: neighbourName,
        upstreamAddress: upstreamAddress,
        cell: cell
      })
    } catch (e) {
      logger.error(e)
    }

  }

  async updateGeneratorPower (power: number, timestamp?: number) {
    const cell = await this.getCell()
    if (!cell || !cell.generator) return

    const generator = cell.generator
    generator.power = power

    if (timestamp) {
      if (generator.powerUpdateTime) {
        generator.fullPower += UPDATE_POWER_FACTOR * generator.power * (timestamp - generator.powerUpdateTime)
      }
      generator.powerUpdateTime = timestamp
    }

    await this.cellRepository.save(cell)
  }

  async updateNetPower (netPower: number, timestamp?: number) {
    const cell = await this.getCell()
    if (!cell) return

    if (timestamp) {
      if (cell.netPowerUpdateTime) {
        cell.fullNetPower += UPDATE_POWER_FACTOR * cell.netPower * (timestamp - cell.netPowerUpdateTime)
      }
      cell.netPowerUpdateTime = timestamp
    }

    cell.netPower = netPower
    await this.cellRepository.save(cell)
  }

  async updateNetCost (netCost: number, timestamp?: number) {
    const cell = await this.getCell()
    if (!cell) return

    if (timestamp) {
      if (cell.netCostUpdateTime) {
        cell.fullNetCost += UPDATE_POWER_FACTOR * cell.netCost * (timestamp - cell.netCostUpdateTime)
      }
      cell.netCostUpdateTime = timestamp
    }

    cell.netCost = netCost
    await this.cellRepository.save(cell)
  }

  async updateNeighbourPower (neighbourName: string, power: number, timestamp?: number) {
    const neighbour = await this.neighbourRepository.findOne({ neighbourName: neighbourName })
    if (!neighbour) return

    if (timestamp) {
      if (neighbour.powerUpdateTime) {
        neighbour.fullPower += UPDATE_POWER_FACTOR * neighbour.power * (timestamp - neighbour.powerUpdateTime)
      }
      neighbour.powerUpdateTime = timestamp
    }

    neighbour.power = power

    await this.neighbourRepository.save(neighbour)
  }

  async updateLoadByPriority (priority: number, roomLoad: number, timestamp?: number) {
    const load = await this.loadControlRepository.findOne({ priority: priority })
    if (!load) return

    if (timestamp) {
      if (load.roomLoadUpdateTime) {
        load.fullRoomLoad += UPDATE_POWER_FACTOR * load.roomLoad * (timestamp - load.roomLoadUpdateTime)
      }
      load.roomLoadUpdateTime = timestamp
    }

    load.roomLoad = roomLoad

    await this.loadControlRepository.save(load)
  }

  async updateCostAndDirection (neighbourName: string, cost: number, direction: boolean, timestamp?: number) {
    const neighbour = await this.neighbourRepository.findOne({ neighbourName: neighbourName })
    if (!neighbour) return

    if (timestamp) {
      if (neighbour.costUpdateTime) {
        neighbour.fullCost += UPDATE_POWER_FACTOR * neighbour.cost * (timestamp - neighbour.costUpdateTime)
      }
      neighbour.costUpdateTime = timestamp
    }

    neighbour.cost = cost
    neighbour.direction = direction

    await this.neighbourRepository.save(neighbour)
  }

  async initGeneratorsTable (generators: Array<any>): Promise<void> {
    const generatorsTable = await this.generatorRepository.find()
    logger.info(`Generators: ${generatorsTable}`)
    if (!generatorsTable.length) {
      logger.info(`Start to create generators`)
      await Promise.all(generators.map(async gen => {
        let generator = new Generator()
        generator.propertyType = gen.propertyType
        generator.generatorType = gen.generatorType
        await this.generatorRepository.save(generator)
      }))
    }
  }

  async updateLoadControlState (priority: number, state: boolean): Promise<void> {
    const loadControl = await this.loadControlRepository.findOne({ priority: priority })
    if (loadControl) {
      loadControl.isWork = state
      await this.loadControlRepository.save(loadControl)
    }
  }

  async initLoadControlsTable (loadControls: Array<any>): Promise<void> {
    const loads = await this.loadControlRepository.find()
    const cell = await this.cellRepository.findOne()
    logger.info(`Controls: ${loads}`)
    if (!loads.length) {
      logger.info(`Start to create loads`)
      await Promise.all(loadControls.map(async load => {
        let control = new LoadControl()
        control.roomName = load.roomName
        control.priority = load.priority
        control.cell = cell
        await this.loadControlRepository.save(control)
      }))
    }
  }
}
