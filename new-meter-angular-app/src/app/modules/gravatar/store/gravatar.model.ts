import { SafeHtml } from '@angular/platform-browser';

export interface GravatarsCollection {
  [uuid: string]: SafeHtml;
}
