import { EntityRepository, Repository } from 'typeorm'
import { Generator } from '../models/Generator'

@EntityRepository(Generator)
export class GeneratorRepository extends Repository<Generator> {

}
