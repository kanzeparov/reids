import { ActionTree, ActionContext } from 'vuex'

import { INavigationState } from './types'
import { RootState } from '@/consumer/store/types'

type Context = ActionContext<INavigationState, RootState>

export const actions: ActionTree<INavigationState, RootState> = {
  toggleSidebar ({ commit }: Context, isOpen?: boolean | undefined): void {
    commit('toggleSidebarOpen', isOpen)
  },
  setNavTitle ({ commit }: Context, navTitle: string): void {
    commit('setNavTitle', navTitle)
  },

  setCurrentRoute ({ commit }: Context, $route: any) {
    commit('setCurrentRouteName', $route.name)
  },
  setPrevRoute ({ commit }: Context, $route: any) {
    commit('setPrevRouteName', $route.name)
  },
  setHomeRouteName ({ commit }: Context, homeRouteName: string) {
    commit('setHomeRouteName', homeRouteName)
  },
}
