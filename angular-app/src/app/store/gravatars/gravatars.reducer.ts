import * as Gravatars from './gravatars.actions';
import { GravatarsState } from './gravatars.state';

const initialState: GravatarsState = {
  collection: {},
};

export function reducer(state = initialState, action: Gravatars.ActionsUnion) {
  switch (action.type) {
    case Gravatars.ActionTypes.AddCollection:
      return { ...state, collection: action.payload };
    case Gravatars.ActionTypes.ExtendCollection:
      return { ...state, collection: { ...state.collection, ...action.payload } };
    default:
      return state;
  }
}
