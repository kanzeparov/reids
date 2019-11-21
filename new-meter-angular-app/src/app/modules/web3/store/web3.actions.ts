import { Action } from '@ngrx/store';
import { Web3Meta } from '@modules/web3/store/web3.model';
import { HexString } from '@shared/shared.types';

export enum ActionTypes {
  AddAccountAddress = '[Web3] Add Account Address',
  AddEthBalance = '[Web3] Add ETH Balance',
  AddMiptBalance = '[Web3] Add REIDS18 Balance',
  UpdateMeta = '[Web3] Update Meta',
}

export class AddAccountAddress implements Action {
  readonly type = ActionTypes.AddAccountAddress;

  constructor(public payload: HexString) { }
}

export class AddEthBalance implements Action {
  readonly type = ActionTypes.AddEthBalance;

  constructor(public payload: number) { }
}

export class AddMiptBalance implements Action {
  readonly type = ActionTypes.AddMiptBalance;

  constructor(public payload: number) { }
}

export class UpdateMeta implements Action {
  readonly type = ActionTypes.UpdateMeta;

  constructor(public payload: Web3Meta) { }
}

export type ActionsUnion =
  AddAccountAddress |
  AddEthBalance |
  AddMiptBalance |
  UpdateMeta;
