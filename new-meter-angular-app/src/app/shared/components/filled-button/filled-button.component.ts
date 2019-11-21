import {Component, Input, OnInit} from '@angular/core';

const ALLOWED_THEMES = [
  'interactive',
  'accent',
];

@Component({
  selector: 'filled-button',
  templateUrl: './filled-button.component.html',
  styleUrls: ['./filled-button.component.scss']
})
export class FilledButtonComponent implements OnInit {

  @Input() theme = 'interactive';
  @Input() bold = true;
  @Input() upcase = true;
  @Input() typeSubmit = false;
  @Input() disabled = false;

  constructor() { }

  ngOnInit() {
    if (this.typeSubmit !== false) {
      this.typeSubmit = true;
    }

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
