import { Module } from 'vuex'

import { getters } from './getters'
import { actions } from './actions'
import { mutations } from './mutations'
import { INavigationState } from './types'
import { RootState } from '@/consumer/store/types'

export const state: INavigationState = {
  isSidebarOpen: false,
  navTitle: '',

  currentRouteName: '',
  prevRouteName: '',
  homeRouteName: '',
}

const namespaced: boolean = true

export const navigation: Module<INavigationState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
}
