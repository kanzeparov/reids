import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/app.state';
import { HexString } from '@shared/shared.types';

import * as Web3Actions from '@modules/web3/store/web3.actions';
import { Web3Meta } from '@modules/web3/store/web3.model';

@Injectable()
export class Web3ActionsService {

  constructor(private store$: Store<AppState>) { }

  addAccountAddress = (accountAddress: HexString) => {
    return this.store$.dispatch(new Web3Actions.AddAccountAddress(accountAddress));
  }

  addEthBalance = (balance: number) => {
    return this.store$.dispatch(new Web3Actions.AddEthBalance(balance));
  }

  addMiptBalance = (balance: number) => {
    return this.store$.dispatch(new Web3Actions.AddMiptBalance(balance));
  }

  updateMeta = ({ isAvailable }: { isAvailable: boolean }) => {
    const meta = { isPristine: false, isAvailable };
    return this.store$.dispatch(new Web3Actions.UpdateMeta(meta));
  }
}
