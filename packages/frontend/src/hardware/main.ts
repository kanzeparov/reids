import './polyfill'
import '../common/plugins'
import '../common/localization'

import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import Logger from '../common/services/logger'

import * as Store from './store'
const store = Store.store

import router from './router'

import template from './Main.vue'
import Logo from './components/Logo'

/* SETUP LOGGER */
const log = new Logger('onder-frontend-hardware-main')

@Component({
  mixins: [template],
  store,
  components: {
    Logo
  },
  router
})

export class App extends Vue {
  created (): void {
    this.watchConnect()
  }
  mounted (): void {
    log.info('Hardware is mounted')
  }
  watchConnect (): void {
    setInterval(() => {
      return Store.dispatchWatchConnect(this.$store)
    }, 1000)
  }
}

window.onerror = function (errorMsg, url, lineNo, colNo, error) {
  log.error(`Global event: ${errorMsg}`)
  Store.commitLoaderVisibility(store, false)
}

export const app = new App().$mount('#app')
