import { GetterTree, ActionContext } from 'vuex'

import { RootState } from '@/consumer/store/types'
import { INavigationState } from './types'

export const getters: GetterTree<INavigationState, RootState> = {
  isHomePage (state: INavigationState): boolean {
    return state.homeRouteName === state.currentRouteName
  }
}
