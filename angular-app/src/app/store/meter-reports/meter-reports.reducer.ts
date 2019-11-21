import * as Reports from './meter-reports.actions';
import { MeterReportsState } from './meter-reports.state';

const initialState: MeterReportsState = {
  collection: {},
};

const updateCollection = (state, newMeterReports) => {
  const meterUuids = Object.keys(newMeterReports);

  return meterUuids.reduce((prevMeterReports, meterUuid) => {
    if (prevMeterReports[meterUuid]) {
      return { ...prevMeterReports, [meterUuid]: newMeterReports[meterUuid] };
    }

    return prevMeterReports;
  }, state.collection);
};

export function reducer(state = initialState, action: Reports.ActionsUnion) {
  switch (action.type) {
    case Reports.ActionTypes.AddCollection:
      return { ...state, collection: action.payload };

    case Reports.ActionTypes.UpdateCollection:
      return { ...state, collection: updateCollection(state, action.payload) };

    default:
      return state;
  }
}
