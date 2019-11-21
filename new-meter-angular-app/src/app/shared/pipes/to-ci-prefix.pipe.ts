import { Pipe, PipeTransform } from '@angular/core';
import { toCiPrefix } from '@utils/number.util';

@Pipe({ name: 'toCiPrefix' })
export class ToCiPrefixPipe implements PipeTransform {
  transform(value: number, digits: number = 1, placeholder = 'n/a'): string {
    return value ? toCiPrefix(value, digits) : placeholder;
  }
}
