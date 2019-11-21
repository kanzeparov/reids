import { Component, Input, OnInit } from '@angular/core';

const ALLOWED_THEMES = [
  'interactive',
];

@Component({
  selector: 'outline-button',
  templateUrl: './outline-button.component.html',
  styleUrls: ['./outline-button.component.scss']
})
export class OutlineButtonComponent implements OnInit {

  @Input() theme = 'interactive';
  @Input() bold = true;
  @Input() upcase = true;
  @Input() disabled = false;

  constructor() { }

  ngOnInit() {
    if (!ALLOWED_THEMES.includes(this.theme)) {
      throw new Error(`Could not recognize theme: ${this.theme}`);
    }
  }

  get themeClass() {
    return `theme--${this.theme}`;
  }

  get boldClass() {
    return this.bold ? 'bold' : '';
  }

  get upcaseClass() {
    return this.upcase ? 'upcase' : '';
  }

}
