import * as AccountBalance from './account-balance.actions';
import { AccountBalanceState } from './account-balance.state';

const initialState: AccountBalanceState = {
  list: [],
};

export function accountBalanceReducer (state = initialState, action: AccountBalance.ActionsUnion) {
  switch (action.type) {
    case AccountBalance.ActionTypes.AddList:
      return { ...state, list: action.payload };
    default:
      return state;
  }
}
