import { Series } from 'highcharts';
import { ChartActionType } from './chart-action.model';

export interface ChartPointData {
  x: number;
  y?: number;
}

export interface ChartSeriesData {
  id: string;
  points: ChartPointData[];
  pointIndexes?: number[];
}

export interface ChartData {
  seriesDataList: ChartSeriesData[];
  action?: ChartActionType;
}

export interface ChartSeriesModel extends ChartSeriesData {
  ref: Series;
}
