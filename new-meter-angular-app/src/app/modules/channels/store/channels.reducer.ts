import * as Channels from './channels.actions';
import { ChannelsState } from './channels.state';

const initialState: ChannelsState = {
  collection: {},
};

export function channelsReducer (state = initialState, action: Channels.ActionsUnion) {
  switch (action.type) {
    case Channels.ActionTypes.AddCollection:
      return { ...state, collection: action.payload };

    case Channels.ActionTypes.UpdateItem:
      return { ...state, collection: { ...state.collection, [action.payload.uuid]: action.payload } };

    case Channels.ActionTypes.DeleteItem:
      const newCollection = { ...state.collection };
      delete newCollection[action.payload];

      return { ...state, collection: { newCollection } };

    default:
      return state;
  }
}
