import {EntityRepository, Repository} from 'typeorm'
import {LoadControl} from '../models/LoadControl'

@EntityRepository(LoadControl)
export class LoadControlRepository extends Repository<LoadControl> {

}
