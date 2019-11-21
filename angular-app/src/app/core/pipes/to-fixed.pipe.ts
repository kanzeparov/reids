import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'toFixed' })
export class ToFixedPipe implements PipeTransform {
  transform(value: number, digits: number = 2, placeholder = 'n/a'): string {
    return value ? value.toFixed(digits) : placeholder;
  }
}
