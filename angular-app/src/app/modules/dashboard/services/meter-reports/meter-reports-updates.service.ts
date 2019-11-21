import { Injectable } from '@angular/core';
import { ApiMeterReportsUpdate } from '../../models/api-meter-reports.model';

@Injectable()
export class MeterReportsUpdatesService {

  constructor() { }

  public buildMeters = (updatedData: ApiMeterReportsUpdate) => {
    return updatedData.meters;
  }

  public buildConsumption = (updatedData: ApiMeterReportsUpdate) => {
    return {
      time: updatedData.time,
      value: updatedData.instantConsumption,
    };
  }

  public buildPrice = (updatedData: ApiMeterReportsUpdate) => {
    return {
      time: updatedData.time,
      value: updatedData.instantPrice,
    };
  }
}
