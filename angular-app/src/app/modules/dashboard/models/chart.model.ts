import { ChartActionType } from '@modules/chart/models/chart-action.model';
import { ChartPointData } from '@modules/chart/models/chart-data.model';

export interface ChartDataSet {
  timestamps: number[];
  points: ChartPointData[];
  meta?: ChartDataSetMeta;
}

export interface ChartDataSetMeta {
  actionType: ChartActionType;
  points: ChartPointData[];
  pointIndexes?: number[];
}
