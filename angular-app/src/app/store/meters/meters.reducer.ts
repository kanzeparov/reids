import * as Meters from './meters.actions';
import { MetersState } from './meters.state';

const initialState: MetersState = {
  collection: {},
  relations: {},
};

export function reducer(state = initialState, action: Meters.ActionsUnion) {
  switch (action.type) {
    case Meters.ActionTypes.AddCollection:
      return { ...state, collection: action.payload };
    case Meters.ActionTypes.AddRelations:
      return { ...state, relations: action.payload };
    default:
      return state;
  }
}
