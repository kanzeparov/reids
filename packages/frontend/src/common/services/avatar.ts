import GenerateAvatar from '@dicebear/avatars'
import SpriteCollection from '@dicebear/avatars-identicon-sprites'

export default class Avatar {
  private readonly avatar: string
  constructor (seed: string) {
    const avatars = new GenerateAvatar(SpriteCollection)
    this.avatar = avatars.create(seed)
  }
  getAvatarImage (): string {
    return this.avatar
  }
}
