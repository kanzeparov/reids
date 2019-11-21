import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'dashboard-bill-diff',
  templateUrl: './bill-diff.component.html',
  styleUrls: ['./bill-diff.component.scss'],
})
export class BillDiffComponent implements OnInit, OnChanges, OnDestroy {

  @Input() diff: number;

  isDiffPositive = false;
  diffClass = '';
  animationTimeout = null;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.diff.currentValue) {
      return;
    }

    this.isDiffPositive = changes.diff.currentValue > 0;
    this.diffClass = this.isDiffPositive ? 'slide-positive' : 'slide-negative';

    clearTimeout(this.animationTimeout);
    this.animationTimeout = setTimeout(() => {
      this.diffClass = '';
    }, 3100);
  }

  ngOnDestroy() {
    clearTimeout(this.animationTimeout);
  }

}
