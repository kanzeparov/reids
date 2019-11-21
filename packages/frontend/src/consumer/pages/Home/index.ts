import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import DashboardInfo from '../../components/DashboardInfo'
import DashboardChart from '../../components/DashboardChart'
import DashboardTables from '../../components/DashboardTables'

import template from './Home.vue'

import {
  Getter,
  Action,
  namespace,
} from 'vuex-class'

const profileModule = namespace('profile')
const paymentModule = namespace('payment')
const transactionModule = namespace('transaction')
const counterpartyModule = namespace('counterparty')

@Component({
  name: 'Home',
  mixins: [template],
  components: {
    DashboardInfo,
    DashboardChart,
    DashboardTables,
  }
})
export default class Home extends Vue {
  @profileModule.Action syncBalance!: Function
  @counterpartyModule.Action syncCounterparties!: Function
  @transactionModule.Action syncTransactions!: Function
  @paymentModule.Action syncPayments!: Function

  @profileModule.Action desyncBalance!: Function
  @counterpartyModule.Action desyncCounterparties!: Function
  @transactionModule.Action desyncTransactions!: Function
  @paymentModule.Action desyncPayments!: Function

  $paymentsStream!: any

  beforeMount () {
    this.syncBalance()
    this.syncCounterparties()
    this.syncTransactions()
    this.$paymentsStream = this.syncPayments()
  }

  async destroyed () {
    await this.desyncBalance()
    await this.desyncCounterparties()
    await this.desyncTransactions()
    await this.desyncPayments()
  }
}
