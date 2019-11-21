import { Pipe, PipeTransform } from '@angular/core';
import { fromNow } from '@utils/datetime.util';

@Pipe({ name: 'fromNow' })
export class FromNowPipe implements PipeTransform {
  transform(timestamp: number): string {
    return timestamp ? fromNow(timestamp) : 'n/a';
  }
}
