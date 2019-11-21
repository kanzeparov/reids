import { Action } from '@ngrx/store';
import { DeviceData } from './device.model';

export enum ActionTypes {
  LoadDevice = '[Device] Loading',
  LoadSucceed = '[Device] Load Succeed',
  LoadFailed = '[Device] Load Failed',

  AddData = '[Device] Add data',
}

export class LoadDevice implements Action {
  readonly type = ActionTypes.LoadDevice;

  constructor() { }
}

export class LoadSucceed implements Action {
  readonly type = ActionTypes.LoadSucceed;

  constructor() { }
}

export class LoadFailed implements Action {
  readonly type = ActionTypes.LoadFailed;

  constructor(public payload: string[]) { }
}

export class AddData implements Action {
  readonly type = ActionTypes.AddData;

  constructor(public payload: DeviceData) { }
}

export type ActionsUnion =
  AddData |
  LoadDevice |
  LoadSucceed |
  LoadFailed;
