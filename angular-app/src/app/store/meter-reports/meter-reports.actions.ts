import { Action } from '@ngrx/store';

import { MeterReportsCollection } from './meter-reports.model';

export enum ActionTypes {
  AddCollection = '[Meter Reports] Add Collection',
  UpdateCollection = '[Meter Reports] Update Collection',
}

export class AddCollection implements Action {
  readonly type = ActionTypes.AddCollection;

  constructor(public payload: MeterReportsCollection) { }
}

export class UpdateCollection implements Action {
  readonly type = ActionTypes.UpdateCollection;

  constructor(public payload: MeterReportsCollection) { }
}

export type ActionsUnion =
  | AddCollection
  | UpdateCollection;
