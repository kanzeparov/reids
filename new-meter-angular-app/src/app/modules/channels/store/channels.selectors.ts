import { createFeatureSelector, createSelector } from '@ngrx/store';

import { AppState } from '@app/app.state';
import { ChannelsState } from './channels.state';

import { ChannelItem, ChannelsCollection } from './channels.model';
import { ApiChannelState } from '../api-channel.model';

export const findChannelByUuid = (channels: ChannelsCollection, uuid: string) => {
  return channels[uuid];
};

export const selectChannels = createFeatureSelector<AppState, ChannelsState>(
  'channels'
);

export const selectChannelsCollection = createSelector(
  selectChannels,
  (channelsState: ChannelsState) => channelsState.collection
);

export const selectChannelsList = createSelector(
  selectChannelsCollection,
  (channels: ChannelsCollection) => Object.values(channels)
);

export const selectOpenChannelsList = createSelector(
  selectChannelsList,
  (channelsList: ChannelItem[]) => {
    return channelsList.filter(({ state }: ChannelItem) => state === ApiChannelState.Open);
  }
);

export const selectChannelByUuid = createSelector(
  selectChannelsCollection,
  findChannelByUuid,
);
