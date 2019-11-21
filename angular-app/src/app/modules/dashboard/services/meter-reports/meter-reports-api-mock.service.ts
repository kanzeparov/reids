import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { interval } from 'rxjs';

import { WebsocketService } from '@core/services/websocket.service';
import { ApiMeterReports } from '../../models/api-meter-reports.model';

@Injectable({
  providedIn: 'root',
})
export class MeterReportsApiMockService {
  mockMeters: any[] = [];
  mockLastUpdateTime = 1544584500000;
  mockLastUpdateNum = 0;

  constructor(
    private http: HttpClient,
    private websocket: WebsocketService,
  ) { }

  shuffleMeterValues(meters: any) {
    return meters.map(m => {
      return {
        ...m,
        price: Math.random() * 5 + 10,
        saleKwh: Math.random() * 5 + 10,
      };
    });
  }

  streamFakeUpdates(metersUrl: string) {
    interval(5000).subscribe(() => {
      if (this.mockMeters.length === 0) {
        return;
      }

      const time = this.mockLastUpdateNum++ % 3 !== 0 ?
        this.mockLastUpdateTime :
        this.mockLastUpdateTime += 600000;

      this.websocket.sendMessage({
        time,
        instantConsumption: Math.random() * 5 + 10,
        instantPrice: Math.random() * 5 + 10,
        meters: this.shuffleMeterValues(this.mockMeters),
      });
    });

    this.http
      .get<ApiMeterReports[]>(metersUrl)
      .subscribe(d => this.mockMeters = d);
  }
}
