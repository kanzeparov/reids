import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'shortUuid' })
export class ShortUuidPipe implements PipeTransform {
  transform(uuid: string): string {
    const placeholder = '…';
    const fromStart = 7;
    const fromEnd = 5;

    if (uuid.length <= fromStart + fromEnd) {
      return uuid;
    }

    const headTail = [ uuid.slice(0, fromStart), uuid.slice(-fromEnd) ];
    return headTail.join(placeholder);
  }
}
