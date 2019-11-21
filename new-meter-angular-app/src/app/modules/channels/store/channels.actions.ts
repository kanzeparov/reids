import { Action } from '@ngrx/store';

import { ChannelsCollection, ChannelItem } from './channels.model';

export enum ActionTypes {
  AddCollection = '[Channels] Add Collection',

  UpdateItem = '[Channels] Update Item',
  DeleteItem = '[Channels] Delete Item',
}

export class AddCollection implements Action {
  readonly type = ActionTypes.AddCollection;

  constructor(public payload: ChannelsCollection) { }
}

export class UpdateItem implements Action {
  readonly type = ActionTypes.UpdateItem;

  constructor(public payload: ChannelItem) { }
}

export class DeleteItem implements Action {
  readonly type = ActionTypes.DeleteItem;

  constructor(public payload: string) { }
}

export type ActionsUnion =
  AddCollection |
  UpdateItem |
  DeleteItem;
