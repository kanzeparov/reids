import Vue from 'vue'
import * as Vuex from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'
import { State } from './state'

Vue.use(Vuex)

const state: State = {
  loaderActive: false
}

const getters = {
  getLoaderState (state: State) {
    return state.loaderActive
  }
}

const mutations = {
  setLoaderVisibility (state: State, loaderState: boolean) {
    state.loaderActive = loaderState
  }
}

const actions = {}

export const createStore = () => new Vuex.Store<State>({
  state: state,
  getters: getters,
  mutations: mutations,
  actions: actions
})

const { read, commit } = getStoreAccessors<State, State>('')

/*************************************************/
/* GETTERS */
/*************************************************/
export const readLoaderVisibility = read(getters.getLoaderState)

/*************************************************/
/* MUTATIONS */
/*************************************************/
export const commitLoaderVisibility = commit(mutations.setLoaderVisibility)

/*************************************************/
/* ACTIONS */
/*************************************************/
