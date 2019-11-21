import { Injectable } from '@angular/core';

import { ApiMeterReportsChartItem } from '@modules/dashboard/models/api-meter-reports.model';

import { HttpClient } from '@angular/common/http';

@Injectable()
export class ChartReportsApiService {
  consumptionUrl = '/api/reports/consumption';
  priceUrl = '/api/reports/price';

  constructor(private http: HttpClient) { }

  fetchInitialConsumption() {
    return this.http.get<ApiMeterReportsChartItem[]>(this.consumptionUrl);
  }

  fetchInitialPrices() {
    return this.http.get<ApiMeterReportsChartItem[]>(this.priceUrl);
  }
}
