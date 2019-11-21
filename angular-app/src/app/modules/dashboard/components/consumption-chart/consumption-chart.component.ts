import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiMeterReportsChartItem } from '@modules/dashboard/models/api-meter-reports.model';
import { ChartDataSet } from '@modules/dashboard/models/chart.model';
import { ChartAction } from '@modules/chart/models/chart-action.model';
import { ChartPointData } from '@modules/chart/models/chart-data.model';

import { ChartDataService } from '@modules/dashboard/services/chart/chart-data.service';
import { formatTime, formatDateTime } from '@utils/datetime.util';

@Component({
  selector: 'dashboard-consumption-chart',
  templateUrl: './consumption-chart.component.html',
  styleUrls: ['./consumption-chart.component.scss'],
  providers: [
    ChartDataService,
  ],
})
export class ConsumptionChartComponent implements OnInit {
  SERIES_ID = 'consumption';

  @Input('initialData') initialData$: Observable<ApiMeterReportsChartItem[]>;
  @Input('dataUpdates') dataUpdates$: Observable<ApiMeterReportsChartItem>;

  chartConfig = {
    options: {
      chart: { type: 'column', height: 110, marginBottom: 30 },
      xAxis: {
        labels: {
          enabled: true,
          formatter: (p: any) => {
            return `${formatTime(p.value)}`;
          },
        },
      },
      plotOptions: {
        column: {
          pointPadding: 0,
          groupPadding: 0,
          borderWidth: 0,
          grouping: false,
        },
      },
      tooltip: {
        formatter() {
          const date = formatDateTime(this.x, 'HH:mm DD MMM');
          return `${ this.y.toFixed(2) } kW·h <br /> ${date}`;
        },
      },
    },
    seriesOptions: [
      { data: [], id: this.SERIES_ID, color: '#F4C52E99' },
    ],
  };

  chartActions$ = new Subject<ChartAction>();

  timestamps: number[] = [];
  points: ChartPointData[] = [];

  constructor(private chartData: ChartDataService) { }

  ngOnInit() {
    this.initialData$
      .pipe(map(this.buildAccumulation))
      .subscribe(this.saveValuesAndDraw);

    this.dataUpdates$
      .pipe(map(this.updateAccumulation))
      .subscribe(this.saveValuesAndDraw);
  }

  get totalConsumption() {
    return this.points.reduce((memo: number, point: any) => {
      return memo + point.y;
    }, 0);
  }

  get minConsumption() {
    return Math.min(
      ...this.points.map((point: any) => point.y)
    );
  }

  get maxConsumption() {
    return Math.max(
      ...this.points.map((point: any) => point.y)
    );
  }

  get averageConsumption() {
    if (this.points.length === 0) {
      return 0;
    }

    return this.totalConsumption / this.points.length;
  }

  buildAccumulation = (items: ApiMeterReportsChartItem[]) => {
    return this.chartData.buildAcc(items);
  }

  updateAccumulation = (item: ApiMeterReportsChartItem) => {
    const accumulation = {
      timestamps: this.timestamps,
      points: this.points,
    };

    return this.chartData.updateAcc(accumulation, item);
  }

  saveValuesAndDraw = (accumulation: ChartDataSet) => {
    this.timestamps = accumulation.timestamps;
    this.points = accumulation.points;

    const chartAction = this.chartData.buildChartAction(
      this.SERIES_ID, accumulation.meta
    );

    this.chartActions$.next(chartAction);
  }
}
