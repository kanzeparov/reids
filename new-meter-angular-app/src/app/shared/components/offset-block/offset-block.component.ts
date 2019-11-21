import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'offset-block',
  templateUrl: './offset-block.component.html',
  styleUrls: ['./offset-block.component.scss']
})
export class OffsetBlockComponent implements OnInit {
  VALID_OFFSETS = [
    'none',
    'x-small',
    'small',
    'medium',
    'large',
    'x-large',
  ];

  VALID_FLEX_ALIGNMENTS = [
    'start',
    'end',
    'center',
  ];

  VALID_FLEX_JUSTIFIES = [
    'start',
    'end',
    'center',
    'space-between',
  ];

  VALID_FLEX_DIRECTIONS = [
    'row',
    'column',
  ];

  @Input('x-offset') xOffset = 'medium';
  @Input('y-offset') yOffset = 'small';
  @Input('align') align = 'start';
  @Input('justify') justify = 'start';
  @Input('direction') direction = 'row';

  constructor() { }

  ngOnInit() {
    if (!this.VALID_OFFSETS.includes(this.xOffset)) {
      this.throwValidationError('x-offset', this.VALID_OFFSETS);
    }

    if (!this.VALID_OFFSETS.includes(this.yOffset)) {
      this.throwValidationError('y-offset', this.VALID_OFFSETS);
    }

    if (!this.VALID_FLEX_ALIGNMENTS.includes(this.align)) {
      this.throwValidationError('align', this.VALID_FLEX_ALIGNMENTS);
    }

    if (!this.VALID_FLEX_JUSTIFIES.includes(this.justify)) {
      this.throwValidationError('justify', this.VALID_FLEX_JUSTIFIES);
    }

    if (!this.VALID_FLEX_DIRECTIONS.includes(this.direction)) {
      this.throwValidationError('direction', this.VALID_FLEX_DIRECTIONS);
    }
  }

  get xOffsetClass(): string {
    return `x-offset--${this.xOffset}`;
  }

  get yOffsetClass(): string {
    return `y-offset--${this.yOffset}`;
  }

  get alignClass(): string {
    return `align--${this.align}`;
  }

  get justifyClass(): string {
    return `justify--${this.justify}`;
  }

  get directionClass(): string {
    return `direction--${this.direction}`;
  }

  private throwValidationError(fieldName: string, validValues: string[]): void {
    const availableOffsets = validValues.join(', ');
    throw new Error(
      `${fieldName} value should be one of: [${availableOffsets}]`
    );
  }

}
