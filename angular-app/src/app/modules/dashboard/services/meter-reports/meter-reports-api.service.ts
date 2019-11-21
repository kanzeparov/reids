import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { WebsocketService } from '@core/services/websocket.service';

import { Subject } from 'rxjs';
import { MeterReportsApiMockService } from './meter-reports-api-mock.service';

import { environment } from '@env';

import {
  ApiMeterReports,
  ApiMeterReportsUpdate,
} from '../../models/api-meter-reports.model';

@Injectable()
export class MeterReportsApiService {
  metersUrl = '/api/reports/meters';

  constructor(
    private http: HttpClient,
    private websocket: WebsocketService,
    private mockApi: MeterReportsApiMockService,
  ) { }

  fetchInitialMeters() {
    return this.http.get<ApiMeterReports[]>(this.metersUrl);
  }

  streamUpdates() {
    const updatesSubject$ = new Subject<ApiMeterReportsUpdate>();

    this.websocket
      .connect()
      .pipe(this.websocket.mapToJson)
      .subscribe(
        (data: any) => updatesSubject$.next(data),
        (error: any) => console.log('Oops', error),
      );

    if (environment.enableMocks) {
      this.mockApi.streamFakeUpdates(this.metersUrl);
    }

    return updatesSubject$;
  }
}
