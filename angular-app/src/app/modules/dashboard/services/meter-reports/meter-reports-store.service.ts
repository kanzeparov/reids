import { Injectable } from '@angular/core';
import {select, Store} from '@ngrx/store';
import { AppState } from '@app/app.state';

import { unixInMs } from '@utils/datetime.util';
import { toSafeNumber } from '@utils/number.util';

import * as MeterReports from '@store/meter-reports/meter-reports.actions';
import { MeterReportsCollection, MeterReportsItem } from '@store/meter-reports/meter-reports.model';

import { ApiMeterReports } from '../../models/api-meter-reports.model';
import { selectMeterReportsCollection } from '@store/meter-reports/meter-reports.selectors';

@Injectable()
export class MeterReportsStoreService {

  constructor(private store$: Store<AppState>) { }

  getMeterReports() {
    return this.store$.pipe(select(selectMeterReportsCollection));
  }

  public addCollection = (apiMeters: ApiMeterReports[]) => {
    if (apiMeters.length === 0) {
      return;
    }

    const collection: MeterReportsCollection = this.buildCollection(apiMeters);
    return this.store$.dispatch(new MeterReports.AddCollection(collection));
  }

  public updateCollection = (apiMeters: ApiMeterReports[]) => {
    if (apiMeters.length === 0) {
      return;
    }

    const collection: MeterReportsCollection = this.buildCollection(apiMeters);
    return this.store$.dispatch(new MeterReports.UpdateCollection(collection));
  }

  private buildCollection(apiMeters: ApiMeterReports[]) {
    return apiMeters.reduce((memo, meterReport: ApiMeterReports) => {
      return { ...memo, [meterReport.uuid]: this.normalizeMeterReport(meterReport) };
    }, {});
  }

  private normalizeMeterReport(apiMeter: ApiMeterReports): MeterReportsItem {
    return {
      ...apiMeter,
      updateTime: unixInMs(apiMeter.updateTime),
      price: toSafeNumber(apiMeter.price),
      saleKwh: toSafeNumber(apiMeter.saleKwh),
      saleTokens: toSafeNumber(apiMeter.saleTokens),
      purchaseKwh: toSafeNumber(apiMeter.purchaseKwh),
      purchaseTokens: toSafeNumber(apiMeter.purchaseTokens),
    };
  }
}
