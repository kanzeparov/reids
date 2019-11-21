import * as Device from './device.actions';
import { DeviceState } from './device.state';
import { DeviceAccountRole } from './device.model';

const initialState: DeviceState = {
  data: {
    accountAddress: '',
    accountRole: DeviceAccountRole.None,
    isSender: false,
  },
  meta: {
    isLoaded: false,
    isLoading: false,
    loadErrors: [],
  },
};

export function deviceReducer (state = initialState, action: Device.ActionsUnion) {
  switch (action.type) {
    case Device.ActionTypes.AddData:
      return { ...state, data: action.payload };

    case Device.ActionTypes.LoadDevice:
      return { ...state, meta: { isLoading: true, isLoaded: false, loadErrors: [] } };

    case Device.ActionTypes.LoadSucceed:
      return { ...state, meta: { isLoading: false, isLoaded: true, loadErrors: [] } };

    case Device.ActionTypes.LoadFailed:
      return { ...state, meta: { isLoading: false, isLoaded: false, loadErrors: action.payload } };

    default:
      return state;
  }
}
