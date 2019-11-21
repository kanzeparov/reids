import { ChartData } from './chart-data.model';

export enum ChartActionType {
  SetSeries = '[Chart] Set series',
  UpdatePoints = '[Chart] Update points',
  AddPoints = '[Chart] Add points',
  AddPointsWithShift = '[Chart] Add points with shift',
}

export interface ChartAction {
  type: ChartActionType;
  payload: ChartData;
}
