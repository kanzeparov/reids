import * as Vuex from 'vuex'
import { State } from './state'

import { createStore } from './store'

export const store: Vuex.Store<State> = createStore()

export * from './store'
