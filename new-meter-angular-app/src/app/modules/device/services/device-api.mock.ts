import { of } from 'rxjs';

export const DEVICE_API_RESPONSE_MOCKS = {
  getDeviceData$: () => of({
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
        onchain: '100420000009995999995',
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
    ],
  }),
};
