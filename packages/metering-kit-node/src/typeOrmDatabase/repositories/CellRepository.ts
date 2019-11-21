import {EntityRepository, Repository} from 'typeorm'
import {Cell} from '../models/Cell'

@EntityRepository(Cell)
export class CellRepository extends Repository<Cell> {

}
