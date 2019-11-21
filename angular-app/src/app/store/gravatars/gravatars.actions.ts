import { Action } from '@ngrx/store';

import { GravatarsCollection } from './gravatars.model';

export enum ActionTypes {
  ExtendCollection = '[Gravatars] Extend Collection',
  AddCollection = '[Gravatars] Add Collection',
}

export class ExtendCollection implements Action {
  readonly type = ActionTypes.ExtendCollection;

  constructor(public payload: GravatarsCollection) { }
}

export class AddCollection implements Action {
  readonly type = ActionTypes.AddCollection;

  constructor(public payload: GravatarsCollection) { }
}

export type ActionsUnion = AddCollection | ExtendCollection;
