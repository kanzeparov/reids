import { MutationTree } from 'vuex'
import { IBalanceRoomResponse } from '@onder/interfaces'
import { INavigationState } from './types'

export const mutations: MutationTree<INavigationState> = {
  toggleSidebarOpen (state: INavigationState, isOpen?: boolean | undefined) {
    state.isSidebarOpen = isOpen === undefined ? !state.isSidebarOpen : isOpen
  },

  setNavTitle (state: INavigationState, navTitle: string) {
    state.navTitle = navTitle
  },

  setCurrentRouteName (state: INavigationState, currentRouteName: string) {
    state.currentRouteName = currentRouteName
  },

  setPrevRouteName (state: INavigationState, prevRouteName: string) {
    state.prevRouteName = prevRouteName
  },

  setHomeRouteName (state: INavigationState, homeRouteName: string) {
    state.homeRouteName = homeRouteName
  },
}
