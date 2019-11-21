import Avatar from '@dicebear/avatars'
import SpriteCollection from '@dicebear/avatars-identicon-sprites'

export class AvatarService {
  static generate (seed: string): string {
    const storageKey = AvatarService.storageKey(seed)
    const avatarFromCache = window.localStorage.getItem(storageKey)

    if (avatarFromCache) {
      return avatarFromCache
    }

    const avatar = new Avatar(SpriteCollection).create(seed)
    window.localStorage.setItem(storageKey, avatar)

    return avatar
  }

  static storageKey (seed: string): string {
    return `avatar:${seed}`
  }
}
