import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiMeter, ApiMeterRelation } from '../../models/api-meter.model';

@Injectable()
export class MetersApiService {
  private metersUrl = '/api/meters';
  private meterRelationsUrl = '/api/meters/relations';

  constructor(private http: HttpClient) { }

  fetchMeters() {
    return this.http.get<ApiMeter[]>(this.metersUrl);
  }

  fetchMeterRelations() {
    return this.http.get<ApiMeterRelation[]>(this.meterRelationsUrl);
  }
}
