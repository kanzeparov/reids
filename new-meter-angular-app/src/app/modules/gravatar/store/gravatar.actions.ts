import { Action } from '@ngrx/store';

import { GravatarsCollection } from './gravatar.model';

export enum ActionTypes {
  ExtendCollection = '[Gravatar] Extend Collection',
  AddCollection = '[Gravatar] Add Collection',
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
