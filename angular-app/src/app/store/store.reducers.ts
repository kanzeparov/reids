import { reducer as metersReducer } from './meters/meters.reducer';
import { reducer as meterReportsReducer } from './meter-reports/meter-reports.reducer';
import { reducer as gravatarsReducer } from './gravatars/gravatars.reducer';

export const reducers = {
  meters: metersReducer,
  meterReports: meterReportsReducer,
  gravatars: gravatarsReducer,
};
