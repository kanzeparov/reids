import { Component, OnInit, Input } from '@angular/core';

const VALID_OFFSETS = [
  'none',
  'x-small',
  'small',
  'medium',
  'large',
  'x-large',
];

@Component({
  selector: 'offset-block',
  templateUrl: './offset-block.component.html',
  styleUrls: ['./offset-block.component.scss']
})
export class OffsetBlockComponent implements OnInit {
  @Input('x-offset') xOffset = 'medium';
  @Input('y-offset') yOffset = 'small';

  constructor() { }

  ngOnInit() {
    if (!VALID_OFFSETS.includes(this.xOffset)) {
      this.throwOffsetValidationError('x-offset');
    }

    if (!VALID_OFFSETS.includes(this.yOffset)) {
      this.throwOffsetValidationError('y-offset');
    }
  }

  get xOffsetClass(): string {
    return `x-offset--${this.xOffset}`;
  }

  get yOffsetClass(): string {
    return `y-offset--${this.yOffset}`;
  }

  private throwOffsetValidationError(fieldName: string): void {
    const availableOffsets = VALID_OFFSETS.join(', ');
    throw new Error(
      `${fieldName} value should be one of: [${availableOffsets}]`
    );
  }

}
