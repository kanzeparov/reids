import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import { namespace } from 'vuex-class'
const navModule = namespace('navigation')

import template from './TheNavbar.vue'

@Component({
  mixins: [ template ],
})
export default class TheNavbar extends Vue {
  @navModule.Action toggleSidebar!: Function
  @navModule.State((s: any) => s.isSidebarOpen) isSidebarOpen!: boolean
  @navModule.State((s: any) => s.homeRouteName) homeRouteName!: string
  @navModule.State((s: any) => s.prevRouteName) prevRouteName!: string
  @navModule.Getter isHomePage?: boolean

  $route: any
  $router: any

  get routeName (): string {
    const { name } = this.$route
    return this.isHomePage ? `ONDER ${name}` : name
  }

  goToHomePage () {
    const prevRouteIsHomePage = this.prevRouteName === this.homeRouteName

    if (this.prevRouteName && prevRouteIsHomePage) {
      this.$router.back()
    } else {
      this.$router.push({ name: this.homeRouteName })
    }
  }
}
