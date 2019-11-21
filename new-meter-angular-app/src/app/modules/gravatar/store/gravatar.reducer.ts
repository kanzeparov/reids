import * as Gravatar from './gravatar.actions';
import { GravatarState } from './gravatar.state';

const initialState: GravatarState = {
  collection: {},
};

export function gravatarReducer (state = initialState, action: Gravatar.ActionsUnion) {
  switch (action.type) {
    case Gravatar.ActionTypes.AddCollection:
      return { ...state, collection: action.payload };

    case Gravatar.ActionTypes.ExtendCollection:
      return { ...state, collection: { ...state.collection, ...action.payload } };

    default:
      return state;
  }
}
