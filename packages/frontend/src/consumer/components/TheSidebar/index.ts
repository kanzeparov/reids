import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import { namespace } from 'vuex-class'
const profileModule = namespace('profile')
const navModule = namespace('navigation')

import template from './TheSidebar.vue'

export interface MenuItem {
  name: string
}

@Component({
  mixins: [ template ],
})
export default class TheSidebar extends Vue {
  @navModule.Action toggleSidebar!: Function
  @navModule.State((s: any) => s.isSidebarOpen) isSidebarOpen!: boolean
  @navModule.State((s: any) => s.currentRouteName) currentRouteName!: string

  @profileModule.State((s: any) => s.data.avatar) avatar!: string
  @profileModule.State((s: any) => s.data.shortAccount) shortAccount!: string
  @profileModule.Getter account!: string

  $router: any

  menuItems: MenuItem[] = [
    { name: 'Dashboard' },
    { name: 'Error log' },
    { name: 'Settings' },
  ]

  isActiveItem ({ name }: MenuItem): boolean {
    return this.currentRouteName === name
  }

  goToPage ({ name }: MenuItem) {
    this.$router.push({ name })
    this.toggleSidebar(false)
  }
}
