import '../common/polyfill'
import '../common/localization'
import '../common/plugins'

import '@assets/scss/fonts.scss'
import '@assets/scss/global.scss'

import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import * as Store from './store'
const store = Store.store

import router from './router'

// Import self-routed components
import './pages/WrongBrowser'

/* Shared base components */
import '../common/components'

import Logger from '../common/services/logger'
const log = new Logger('onder-frontend-consumer-main')

/* ERROR HANDLER */
Vue.config.errorHandler = function (err: any, vm: any, info: any) {
  log.error(`Vue error: ${err}`)
}

import websocket from '@/common/services/websocket-client'
import NetworkService from '@/common/services/network-service'

import { namespace } from 'vuex-class'
const profileModule = namespace('profile')

import TheSidebar from './components/TheSidebar'
import TheNavbar from './components/TheNavbar'
import TheConnectionLost from './components/TheConnectionLost'

import template from './Main.vue'

@Component({
  mixins: [ template ],
  store,
  router,
  components: {
    TheSidebar,
    TheNavbar,
    TheConnectionLost,
  }
})
export class App extends Vue {
  @profileModule.Action getConfig!: Function

  $route: any
  $mount: any
  appIsReady: boolean = false
  navbarDisabled: boolean = false
  online: boolean = true

  async created () {
    NetworkService.listenConnection().subscribe((hasConnection: boolean) => {
      this.online = hasConnection
    })

    await websocket.connect()
    await this.getConfig()

    this.appIsReady = true
  }

  updated () {
    this.navbarDisabled = (this.$route.meta || {}).disableNavbar === true
  }

  mounted () {
    log.info('Consumer is mounted')
  }
}

window.onerror = (errorMsg, url, lineNo, colNo, error) => {
  log.error(`Global event: ${errorMsg}`)
}

export const app = new App().$mount('#app')
