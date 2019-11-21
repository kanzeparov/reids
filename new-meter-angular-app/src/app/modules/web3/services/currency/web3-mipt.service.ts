import { Injectable } from '@angular/core';

import { combineLatest, Observable, Observer, of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

import { HexString } from '@shared/shared.types';

import { MiptAbi, MiptBalancePayload } from '@modules/web3/models/mipt.model';
import { TransferPayload } from '@modules/web3/models/transfer.model';
import { Web3Service } from '@modules/web3/services/web3.service';
import { Web3HelperService } from '@modules/web3/services/currency/web3-helper.service';

@Injectable()
export class Web3MiptService {

  constructor(
    private web3Service: Web3Service,
    private web3Helper: Web3HelperService,
  ) { }

  getBalance$ (payload: MiptBalancePayload) {
    return combineLatest(
      of(payload.accountAddress),
      of(payload.tokenContract),
      this.getAbi$(),
    ).pipe(
      switchMap(([accountAddress, tokenContract, abi]) => {
        return new Observable((observer: Observer<any>) => {
          const contract = this.web3Service
            .getContract(abi, tokenContract)
            .at(tokenContract);

          return contract.balanceOf(
            accountAddress,
            this.web3Helper.handleGetBalance(observer)
          );
        });
      }),
      first(),
    );
  }

  deposit$({ from, to, amount, tokenContract }: TransferPayload) {
    if (!to) {
      throw new Error(`Receiver address can not be: ${to}`);
    }

    if (!amount) {
      throw new Error(`REIDS18 amount can not be: ${amount}`);
    }

    if (!from) {
      throw new Error(`Sender address can not be: ${from}`);
    }

    return this.buildTransactionPayload$(
      of(from),
      of(to),
      of(this.web3Helper.toWei(amount)),
      of(tokenContract),
    ).pipe(
      switchMap(this.transfer$),
      first(),
    );
  }

  private buildTransactionPayload$(
    from$: Observable<HexString>,
    to$: Observable<HexString>,
    amount$: Observable<number>,
    tokenContract$: Observable<HexString>,
  ): Observable<TransferPayload> {
    return combineLatest(
      from$,
      to$,
      amount$,
      tokenContract$,
      this.getAbi$(),
    ).pipe(
      map(this.combinePayload),
    );
  }

  private transfer$ = ({ from, to, amount, tokenContract, abi }: TransferPayload) => {
    return new Observable((observer: Observer<any>) => {
      const contract = this.web3Service
        .getContract(abi, tokenContract, { from })
        .at(tokenContract);

      contract.transfer(to, amount, this.web3Helper.handleTransfer(observer));
    });
  }

  private combinePayload = ([ from, to, amount, tokenContract, abi ]): TransferPayload => {
    return { from, to, amount, tokenContract, abi };
  }

  private getAbi$() {
    /* tslint:disable */
    const abi: MiptAbi[] = [{ constant: true, inputs: [], name: 'mintingFinished', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: true, inputs: [], name: 'name', outputs: [{ name: '', type: 'string' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [{ name: '_spender', type: 'address' }, { name: '_value', type: 'uint256' }], name: 'approve', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: false, inputs: [{ name: '_from', type: 'address' }, { name: '_to', type: 'address' }, { name: '_value', type: 'uint256' }], name: 'transferFrom', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: true, inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [{ name: '_to', type: 'address' }, { name: '_amount', type: 'uint256' }], name: 'mint', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: false, inputs: [{ name: '_spender', type: 'address' }, { name: '_subtractedValue', type: 'uint256' }], name: 'decreaseApproval', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: true, inputs: [{ name: '_owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [], name: 'renounceOwnership', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: false, inputs: [], name: 'finishMinting', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: true, inputs: [], name: 'owner', outputs: [{ name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: true, inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [{ name: '_spender', type: 'address' }, {  name: '_addedValue', type: 'uint256' }], name: 'increaseApproval', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function' }, { constant: true, inputs: [{ name: '_owner', type: 'address' }, { name: '_spender', type: 'address' }], name: 'allowance', outputs: [{ name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [{ name: '_newOwner', type: 'address' }], name: 'transferOwnership', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' }, { inputs: [], payable: false, stateMutability: 'nonpayable', type: 'constructor' }, { anonymous: false, inputs: [{ indexed: true, name: 'to', type: 'address' }, { indexed: false, name: 'amount', type: 'uint256' }], name: 'Mint', type: 'event' }, { anonymous: false, inputs: [], name: 'MintFinished', type: 'event' }, { anonymous: false, inputs: [{ indexed: true, name: 'previousOwner', type: 'address' }], name: 'OwnershipRenounced', type: 'event' }, { anonymous: false, inputs: [{ indexed: true, name: 'previousOwner', type: 'address' }, { indexed: true, name: 'newOwner', type: 'address' }], name: 'OwnershipTransferred', type: 'event' }, { anonymous: false, inputs: [{ indexed: true, name: 'owner', type: 'address' }, { indexed: true, name: 'spender', type: 'address' }, { indexed: false, name: 'value', type: 'uint256' }], name: 'Approval', type: 'event' }, { anonymous: false, inputs: [{ indexed: true, name: 'from', type: 'address' }, { indexed: true, name: 'to', type: 'address' }, { indexed: false, name: 'value', type: 'uint256' }], name: 'Transfer', type: 'event' }, { constant: true, inputs: [], name: 'totalSupply', outputs: [{ name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function' }, { constant: false, inputs: [{ name: '_to', type: 'address' }, { name: '_value', type: 'uint256' }], name: 'transfer', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function' }];
    /* tslint:enable */

    return new Observable((observer: Observer<MiptAbi[]>) => {
      observer.next(abi);
      observer.complete();
    });
  }
}
