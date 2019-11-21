import { Action } from '@ngrx/store';
import { AccountBalance } from './account-balance.model';

export enum ActionTypes {
  AddList = '[AccountBalance] Add List',
}

export class AddList implements Action {
  readonly type = ActionTypes.AddList;

  constructor(public payload: AccountBalance[]) { }
}

export type ActionsUnion = AddList;
