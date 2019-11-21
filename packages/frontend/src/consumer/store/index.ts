import { Store, StoreOptions } from 'vuex'

import { RootState } from './types'
import { state, getters, mutations, actions } from './store'
import { modules } from './modules'

const storeOptions: StoreOptions<RootState> = {
  state,
  getters,
  mutations,
  actions,
  modules,
}

export const store: Store<RootState> = new Store<RootState>(storeOptions)

export * from './store'
