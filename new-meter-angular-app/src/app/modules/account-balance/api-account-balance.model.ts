export enum ApiAccountBalanceCurrency {
  Eth = 'ETH',
  MiptToken = 'REIDSCoin_v18',
}

export interface ApiAccountBalance {
  ticker: ApiAccountBalanceCurrency;
  offchain: string;
  onchain: string;
  tokenContract: string;
}
