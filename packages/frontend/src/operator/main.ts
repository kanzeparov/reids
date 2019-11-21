import '../common/polyfill'
import '../common/plugins'
import '../common/localization'

import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import * as Logger from 'js-logger'

let Config = require('../config.json')

import * as Store from './store'
const store = Store.store

import router from './router'

import template from './main.vue'
let logLevel = (Config.debug ? Logger.DEBUG : Logger.ERROR)
Logger.useDefaults()
Logger.setLevel(logLevel)

Vue.config.errorHandler = function (err, vm, info) {
  Logger.error('Vue error: ', err)
}

@Component({
  mixins: [template],
  store,
  components: {},
  router
})

export class App extends Vue {
  mounted (): void {
    Logger.log('Operator is mounted')

    const loaderVisible = Store.readLoaderVisibility(this.$store)
    Logger.info('loader is visible: ', loaderVisible)
  }
}

window.onerror = function (errorMsg, url, lineNo, colNo, error) {
  Logger.error('Global event: ', errorMsg)

  Store.commitLoaderVisibility(store, false)
}

export const app = new App().$mount('#app')
