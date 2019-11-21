import { HexString } from '@shared/shared.types';

export enum DeviceAccountRole {
  None = 'None',
  Sender = 'Sender',
  Receiver = 'Receiver',
}

export interface DeviceData {
  accountAddress: HexString;
  accountRole: DeviceAccountRole;
  isSender: boolean;
}
