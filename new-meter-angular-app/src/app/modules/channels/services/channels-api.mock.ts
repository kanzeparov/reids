import { ApiCloseChannelEvent } from '../api-channel.model';

export const CHANNELS_API_RESPONSE_MOCKS = {
  closeChannel: {
    txID: '0xcbb12e0d89631978dae08ad93d16ac5193de0c24112cbff447102026648c3dde',
    events: [
      {
        event: ApiCloseChannelEvent.DidSettle,
        args: {
          channelId: '0x2916d22931034ee6bb9eda94f4ebbb4200000000000000000000000000000000',
        },
      },
    ],
    channel: {
      sender: '0x74EcbE56958969A0b166DC95Cc0F4Aa6aA035fD7',
      receiver: '0x85176b816BEd182c08DdaAcCF6fD060a152Da175',
      channelId: '0x2916d22931034ee6bb9eda94f4ebbb4200000000000000000000000000000000',
      value: '200000000000000000',
      spent: '35434044111',
      state: 1,
      tokenContract: '0xD4a2AcE348c122EdCA6e0e11AD1c6e21EeE36C5C',
      settlementPeriod: '11520',
      settlingUntil: (Date.now() / 1000) + 75,
    },
  },
};
