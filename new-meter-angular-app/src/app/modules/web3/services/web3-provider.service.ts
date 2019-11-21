import { Injectable } from '@angular/core';

@Injectable()
export class Web3ProviderService {

  private readonly global: any = window;

  constructor() { }

  get isAvailable() {
    const { web3 } = this.global;

    return (
      web3 !== undefined &&
      web3.currentProvider &&
      web3.currentProvider.selectedAddress !== undefined
    );
  }

  getProvider() {
    return this.global.web3.currentProvider;
  }

  getAddress() {
    return this.getProvider().selectedAddress || '';
  }
}
