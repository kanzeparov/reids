import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiMeterReportsChartItem } from '@modules/dashboard/models/api-meter-reports.model';
import { ChartDataSet } from '@modules/dashboard/models/chart.model';
import { ChartAction } from '@modules/chart/models/chart-action.model';
import { ChartPointData } from '@modules/chart/models/chart-data.model';

import { ChartDataService } from '@modules/dashboard/services/chart/chart-data.service';
import { formatTime, formatDateTime } from '@utils/datetime.util';
import { TOKEN_EXPONENT } from '@modules/dashboard/dashboard.constant';

@Component({
  selector: 'dashboard-price-chart',
  templateUrl: './price-chart.component.html',
  styleUrls: ['./price-chart.component.scss'],
  providers: [
    ChartDataService,
  ],
})
export class PriceChartComponent implements OnInit {
  SERIES_ID = 'sellPrice';

  @Input('initialData') initialData$: Observable<ApiMeterReportsChartItem[]>;
  @Input('dataUpdates') dataUpdates$: Observable<ApiMeterReportsChartItem>;

  chartConfig = {
    options: {
      chart: { type: 'line', height: 80, marginBottom: 30 },
      xAxis: {
        labels: {
          enabled: true,
          formatter: (p: any) => {
            return `${formatTime(p.value)}`;
          },
        },
      },
      plotOptions: {
        series: {
          states: {
            hover: {
              halo: { size: 0 },
            },
          },
        },
        line: {
          marker: {
            enabled: false,
            states: {
              hover: {
                radius: 3,
                fillColor: 'black',
                lineWidth: 0,
                lineWidthPlus: 0,
              }
            }
          }
        },
      },
      tooltip: {
        formatter() {
          const date = formatDateTime(this.x, 'HH:mm DD MMM');
          return `${ this.y.toFixed(3) } MIPT tokens / kW·h <br/> ${date}`;
        },
      }
    },
    seriesOptions: [
      { data: [], id: this.SERIES_ID, color: '#C29C24' },
    ],
  };

  chartActions$ = new Subject<ChartAction>();

  timestamps: number[] = [];
  points: ChartPointData[] = [];

  constructor(private chartData: ChartDataService) { }

  ngOnInit() {
    this.initialData$
      .pipe(
        map(this.buildAccumulation),
        map(this.normalizeAcc),
      )
      .subscribe(this.saveValuesAndDraw);

    this.dataUpdates$
      .pipe(
        map(this.updateAccumulation),
        map(this.normalizeAcc),
      )
      .subscribe(this.saveValuesAndDraw);
  }

  get totalPrice() {
    return this.points.reduce((memo: number, point: any) => {
      return memo + point.y;
    }, 0);
  }

  get averagePrice() {
    if (this.points.length === 0) {
      return 0;
    }

    return this.totalPrice / this.points.length;
  }

  get lastPrice() {
    if (this.points.length === 0) {
      return 0;
    }

    return this.points[this.points.length - 1].y;
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

  normalizeAcc = (accumulation: ChartDataSet) => {
    return {
      ...accumulation,
      points: accumulation.points.map(this.normalizePrice),
      meta: {
        ...accumulation.meta,
        points: accumulation.meta.points.map(this.normalizePrice),
      },
    };
  }

  normalizePrice = (point: ChartPointData) => {
    return {
      ...point,
      y: point.y * TOKEN_EXPONENT,
    };
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
