import { Injectable } from '@angular/core';
import { Chart, Series } from 'highcharts';

import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ChartActionType } from '@modules/chart/models/chart-action.model';
import { ChartSeriesData, ChartSeriesModel, ChartPointData } from '@modules/chart/models/chart-data.model';
import { ChartAction } from '@modules/chart/models/chart-action.model';


@Injectable()
export class ChartService {

  constructor() { }

  public drawFromActions = (chart: Chart, action: ChartAction) => {
    const actionType = action.type;
    const seriesDataList = action.payload.seriesDataList;

    const series$ = this.getSeries$(chart, seriesDataList);

    series$.subscribe((model: ChartSeriesModel) => {
      switch (actionType) {
        case ChartActionType.SetSeries:
          return this.setSeries(model);
        case ChartActionType.UpdatePoints:
          return this.updatePoints(model);
        case ChartActionType.AddPoints:
          return this.addPoints(model);
        case ChartActionType.AddPointsWithShift:
          return this.addPointsWithShift(model);
      }
    });
  }

  private setSeries(seriesModel: ChartSeriesModel) {
    seriesModel.ref.setData(seriesModel.points);
  }

  private updatePoints(seriesModel: ChartSeriesModel) {
    seriesModel.points.forEach((newPoint: ChartPointData, index: number) => {
      const series = seriesModel.ref;
      const pointIndex = seriesModel.pointIndexes[index];
      const existingPoint = series.data[pointIndex];

      existingPoint.update(newPoint, true);
    });
  }

  private addPoints(seriesModel: ChartSeriesModel) {
    seriesModel.points.forEach((point: ChartPointData) => {
      seriesModel.ref.addPoint(point, true, false);
    });
  }

  private addPointsWithShift(seriesModel: ChartSeriesModel) {
    seriesModel.points.forEach((point: ChartPointData) => {
      seriesModel.ref.addPoint(point, true, true);
    });
  }

  private getSeries$(chart: Chart, seriesDataList: ChartSeriesData[]) {
    return of(...seriesDataList).pipe(
      map((seriesData: ChartSeriesData) => ({
        ...seriesData,
        ref: this.getChartSeries(chart, seriesData.id),
      }))
    );
  }

  private getChartSeries(chart: Chart, seriesId: string) {
    return chart.get(seriesId) as Series;
  }
}
