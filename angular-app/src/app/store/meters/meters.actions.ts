import { Action } from '@ngrx/store';

import { MetersCollection, MeterRelations } from './meter.model';

export enum ActionTypes {
  AddCollection = '[Meter] Add Collection',
  AddRelations = '[Meter] Add Relations',
}

export class AddCollection implements Action {
  readonly type = ActionTypes.AddCollection;

  constructor(public payload: MetersCollection) { }
}

export class AddRelations implements Action {
  readonly type = ActionTypes.AddRelations;

  constructor(public payload: MeterRelations) { }
}

export type ActionsUnion = AddCollection | AddRelations;
