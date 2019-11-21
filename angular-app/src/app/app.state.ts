import { MetersState } from '@store/meters/meters.state';
import { MeterReportsState } from '@store/meter-reports/meter-reports.state';
import { GravatarsState } from '@store/gravatars/gravatars.state';

export interface AppState {
  readonly meters: MetersState;
  readonly meterReports: MeterReportsState;
  readonly gravatars: GravatarsState;
}
