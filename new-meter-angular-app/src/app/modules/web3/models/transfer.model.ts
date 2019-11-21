import { HexString } from '@shared/shared.types';

export interface TransferPayload {
  from?: HexString;
  to?: HexString;
  amount: number;
  tokenContract?: HexString;
  abi?: HexString;
}
