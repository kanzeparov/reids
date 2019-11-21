import { ApiCloseChannelEvent } from '@modules/dashboard/models/api-channel.model';

export const HTTP_RESPONSE_MOCKS = {
  getChannels: {
    account: '0xF6EBc1744a067F826D687B366a3CE7d7BD7af07F',
    balance: [
      {
        ticker: 'ETH',
        tokenContract: '',
        offchain: '0',
        onchain: '1860597267927656266'
      },
      {
        ticker: 'REIDSCoin_v18',
        tokenContract: '0xD4a2AcE348c122EdCA6e0e11AD1c6e21EeE36C5C',
        offchain: '199999999681250021',
        onchain: '10042000000999599999536057484151',
      },
    ],
    channels: [
      {
        sender: '0xF6EBc1744a067F826D687B366a3CE7d7BD7af07F',
        receiver: '0xf3718908E40B4FCd3ec8656b152C2C67D3357DC3',
        channelId: '0x85c946412480405bb25a5e5a3b5f164800000000000000000000000000000000',
        value: '200000000000000000',
        spent: '28411248207',
        state: 1,
        tokenContract: '0xD4a2AcE348c122EdCA6e0e11AD1c6e21EeE36C5C',
        settlementPeriod: '11520',
        settlingUntil: (Date.now() / 1000) + 10,
      },
    ]
  },

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
