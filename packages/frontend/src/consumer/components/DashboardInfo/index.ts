import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import { namespace } from 'vuex-class'
const profileModule = namespace('profile')

import template from './DashboardInfo.vue'

@Component({
  name: 'DashboardInfo',
  mixins: [template],
})
export default class DashboardInfo extends Vue {
  @profileModule.Getter('balance') balance?: number
  @profileModule.State((s: any) => s.data.energyBalance) energyBalance?: number

  $router: any

  goToDeposit () {
    this.$router.push({ name: 'Deposit' })
  }
  goToWithdraw () {
    this.$router.push({ name: 'Withdraw' })
  }
}
