import { HexString } from '@shared/shared.types';

declare interface MiptAbiIO {
  indexed?: boolean;
  name: string;
  type: string;
}

export interface MiptAbi {
  constant?: boolean;
  inputs?: MiptAbiIO[];
  name?: string;
  outputs?: MiptAbiIO[];
  payable?: boolean;
  stateMutability?: string;
  type?: string;
  anonymous?: boolean;
}

export interface MiptBalancePayload {
  accountAddress: HexString;
  tokenContract: HexString;
  abi?: MiptAbi[];
}
