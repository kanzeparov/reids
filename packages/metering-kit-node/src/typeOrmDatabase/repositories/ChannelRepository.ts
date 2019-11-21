import { EntityRepository, Repository } from 'typeorm'
import { Channel } from '../models/Channel'

@EntityRepository(Channel)
export class ChannelRepository extends Repository<Channel> {

}
