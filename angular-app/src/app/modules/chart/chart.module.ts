import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule as AngularChartModule } from 'angular-highcharts';

import { ChartComponent } from './components/chart/chart.component';

@NgModule({
  declarations: [
    ChartComponent
  ],
  imports: [
    CommonModule,
    AngularChartModule,
  ],
  exports: [
    ChartComponent,
  ]
})
export class ChartModule { }
