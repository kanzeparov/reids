import { Injectable } from '@angular/core';

import { combineLatest, Observable } from 'rxjs';
import { filter, map} from 'rxjs/operators';

import { MeterItem } from '@store/meters/meter.model';
import { MeterReportsCollection, MeterReportsItem } from '@store/meter-reports/meter-reports.model';
import { GravatarsCollection } from '@store/gravatars/gravatars.model';
import { GravatarStoreService } from '@core/services/gravatar-store.service';

import { TOKEN_EXPONENT } from '@modules/dashboard/dashboard.constant';
import { MeterReportsTableItem } from '@modules/dashboard/models/meter-reports-table-item.model';

import { toSafeNumber } from '@utils/number.util';
import { fromNow } from '@utils/datetime.util';

export type CombinedItemsArgs = [MeterItem[], MeterReportsCollection, GravatarsCollection];

@Injectable()
export class MeterReportsDataService {
  TO_FIXED_DIGITS = 3;
  NO_VALUE = 'n/a';

  constructor(private gravatarStore: GravatarStoreService) { }

  buildTableItems(
    meters$: Observable<MeterItem[]>,
    meterReports$: Observable<MeterReportsCollection>,
  ) {
    const gravatars$ = this.gravatarStore.getGravatars();

    return combineLatest(
      meters$,
      meterReports$,
      gravatars$,
    ).pipe(
      filter(this.hasValues),
      map(this.combineItems),
    );
  }

  private hasValues([meters, meterReports, _]: CombinedItemsArgs) {
    return meters.length > 0 && Object.keys(meterReports).length > 0;
  }

  private combineItems = ([meters, meterReports, gravatars]: CombinedItemsArgs): MeterReportsTableItem[] => {
    return meters.map((originalMeter: MeterItem) => {
      const uuid = originalMeter.uuid;
      const isSeller = Boolean(originalMeter.isSeller);

      const meter = this.normalizeMeter(originalMeter);
      const meterReport = this.normalizeMeterReport(meterReports[uuid]);
      const gravatar = gravatars[uuid];

      return { uuid, isSeller, meter, meterReport, gravatar };
    });
  }

  /* Normalization */

  private normalizeMeter(meter: MeterItem) {
    return {
      name: meter.name,
      comment: meter.comment,
    };
  }

  private normalizeMeterReport(meterReport: MeterReportsItem) {
    const price = this.normalizeTokens(meterReport.price);
    const saleTokens = this.normalizeTokens(meterReport.saleTokens);
    const purchaseTokens = this.normalizeTokens(meterReport.purchaseTokens);

    const saleKwh = this.normalizeKwh(meterReport.saleKwh);
    const purchaseKwh = this.normalizeKwh(meterReport.purchaseKwh);

    const updateTime = this.normalizeTimestamp(meterReport.updateTime);

    return {
      price,
      priceIsQuiet: price === this.NO_VALUE,

      saleTokens,
      saleTokensIsQuiet: saleTokens === this.NO_VALUE,

      purchaseTokens,
      purchaseTokensIsQuiet: purchaseTokens === this.NO_VALUE,

      saleKwh,
      saleKwhIsQuiet: saleKwh === this.NO_VALUE,

      purchaseKwh,
      purchaseKwhIsQuiet: purchaseKwh === this.NO_VALUE,

      updateTime,
      updateTimeIsQuiet: updateTime === this.NO_VALUE || updateTime === 'now',
    };
  }

  private normalizeTokens(tokens: number) {
    if (tokens === 0) {
      return this.NO_VALUE;
    }

    return (toSafeNumber(tokens) * TOKEN_EXPONENT).toFixed(this.TO_FIXED_DIGITS);
  }

  private normalizeKwh(kwh: number) {
    if (kwh === 0) {
      return this.NO_VALUE;
    }

    return kwh.toFixed(this.TO_FIXED_DIGITS);
  }

  private normalizeTimestamp(timestamp: any) {
    if (timestamp === 0) {
      return this.NO_VALUE;
    }

    return fromNow(timestamp);
  }
}
