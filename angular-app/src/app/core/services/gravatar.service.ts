import { Injectable } from '@angular/core';

import Avatar from '@dicebear/avatars';
import SpriteCollection from '@dicebear/avatars-identicon-sprites';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class GravatarService {

  constructor(private sanitizer: DomSanitizer) { }

  public generate(seed: string): SafeHtml {
    const storageKey = this.storageKey(seed);
    const avatarFromCache = window.localStorage.getItem(storageKey);

    if (avatarFromCache) {
      return this.safeHtml(avatarFromCache);
    }

    const avatar = new Avatar(SpriteCollection).create(seed);
    window.localStorage.setItem(storageKey, avatar);

    return this.safeHtml(avatar);
  }

  private storageKey(seed: string): string {
    return `avatar:${seed}`;
  }

  private safeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
