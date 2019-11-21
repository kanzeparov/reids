import {EntityRepository, Repository} from 'typeorm'
import {Neighbour} from '../models/Neighbour'

@EntityRepository(Neighbour)
export class NeighbourRepository extends Repository<Neighbour> {

}
