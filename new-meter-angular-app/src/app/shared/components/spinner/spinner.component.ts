import { Component, OnInit, Input } from '@angular/core';

const AVAILABLE_COLORS = [
  'white',
  'gray-light',
  'gray',
  'gray-dark',
  'black',
  'accent',
  'interactive',
  'caution',
];

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {
  @Input('stroke-width') strokeWidth = 8;
  @Input('width') width = 16;
  @Input('height') height = 16;
  @Input('named-color') namedColor;
  @Input('color') color = 'rgba(0, 0, 0, 0.4)';

  constructor() { }

  ngOnInit() {
    if (this.namedColor && !AVAILABLE_COLORS.includes(this.namedColor)) {
      throw new Error('named-color should be defined properly');
    }
  }
}
