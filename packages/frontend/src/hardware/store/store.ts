import Vue from 'vue'
import * as Vuex from 'vuex'
import { getStoreAccessors } from 'vuex-typescript'
import { State } from './state'
import Http from '../../common/services/http'
import { INetworkSettings } from '../pages/Settings'
import { IMeterConfiguration } from '@onder/interfaces'

const $http = new Http()

Vue.use(Vuex)

type Context = Vuex.ActionContext<State, State>

const state: State = {
  onderUrls: [],
  connectionStatus: false,
  loaderActive: false
}

const getters = {
  getLoaderState (state: State) {
    return state.loaderActive
  },
  getConnectionStatus (state: State) {
    return state.connectionStatus
  },
  getOnderUrls (state: State) {
    return state.onderUrls
  }
}

const mutations = {
  setLoaderVisibility (state: State, loaderState: boolean) {
    state.loaderActive = loaderState
  },
  setOnderUrls (state: State, onderUrls: IMeterConfiguration[]): void {
    state.onderUrls = onderUrls
  },
  setConnectionStatus (state: State, status: boolean) {
    state.connectionStatus = status
  }
}

const actions = {
  async setNetworkSettings (context: Context, settings: INetworkSettings) {
    await $http.request('post', '/wifi/configuration', settings)
  },
  async getNetworkSettings (context: Context): Promise<INetworkSettings> {
    const settings = await $http.request('get', '/wifi/configuration')
    return settings
  },
  async getOnderUrlList (context: Context) {
    const onderUrlList: IMeterConfiguration[] = await $http.request('get', '/wifi')
    mutations.setOnderUrls(context.state, onderUrlList)
    return onderUrlList
  },
  async checkConnection (context: Context) {
    const connectionStatus = await $http.request('get', '/wifi/connection')
    mutations.setConnectionStatus(context.state, connectionStatus.connected)
    return connectionStatus.connected
  },
  async watchConnect (context: Context) {
    const connect = await $http.request('get', '/wifi/watching')
    return connect
  }
}

export const createStore = () => new Vuex.Store<State>({
  state: state,
  getters: getters,
  mutations: mutations,
  actions: actions
})

const { read, commit, dispatch } = getStoreAccessors<State, State>('')
/*************************************************/
/* GETTERS */
/*************************************************/
export const readLoaderVisibility = read(getters.getLoaderState)
export const readConnectionStatus = read(getters.getConnectionStatus)
export const readOnderUrls = read(getters.getOnderUrls)

/*************************************************/
/* MUTATIONS */
/*************************************************/
export const commitLoaderVisibility = commit(mutations.setLoaderVisibility)
export const commitOnderUrls = commit(mutations.setOnderUrls)
export const commitConnectionStatus = commit(mutations.setConnectionStatus)

/*************************************************/
/* ACTIONS */
/*************************************************/
export const dispatchSetNetworkSettings = dispatch(actions.setNetworkSettings)
export const dispatchGetOnderUrlList = dispatch(actions.getOnderUrlList)
export const dispatchCheckConnection = dispatch(actions.checkConnection)
export const dispatchWatchConnect = dispatch(actions.watchConnect)
export const dispatchGetNetworkSettings = dispatch(actions.getNetworkSettings)
