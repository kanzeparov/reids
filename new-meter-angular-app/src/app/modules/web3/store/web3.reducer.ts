import * as Web3 from './web3.actions';
import { Web3State } from './web3.state';

const initialState: Web3State = {
  accountAddress: '',
  balance: {
    eth: 0,
    mipt: 0,
  },
  meta: {
    isPristine: true,
    isAvailable: false,
  }
};

export function web3Reducer (state = initialState, action: Web3.ActionsUnion) {
  switch (action.type) {
    case Web3.ActionTypes.AddAccountAddress:
      return { ...state, accountAddress: action.payload };

    case Web3.ActionTypes.AddEthBalance:
      return { ...state, balance: { ...state.balance, eth: action.payload } };

    case Web3.ActionTypes.AddMiptBalance:
      return { ...state, balance: { ...state.balance, mipt: action.payload } };

    case Web3.ActionTypes.UpdateMeta:
      return { ...state, meta: { ...state.meta, ...action.payload } };

    default:
      return state;
  }
}
