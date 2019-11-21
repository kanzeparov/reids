import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import { namespace } from 'vuex-class'

import { ITransaction } from '@/consumer/store/modules/transaction/types'
import { ICounterparty } from '@/consumer/store/modules/counterparty/types'

/* Set custom locale to display lastUpdate properly */
import * as moment from 'moment'
moment.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s',
    s:  'now',
    ss: '%s secs',
    m:  '1 min',
    mm: '%d mins',
    h:  '1 hr',
    hh: '%d hrs',
    d:  '1 day',
    dd: '%d days',
    M:  '1 mon',
    MM: '%d mons',
    y:  '1 year',
    yy: '%d years'
  }
})

const transactionModule = namespace('transaction')
const counterpartyModule = namespace('counterparty')
const profileModule = namespace('profile')

import template from './DashboardTables.vue'

@Component({
  name: 'DashboardTables',
  mixins: [template],
})
export default class DashboardTables extends Vue {
  @profileModule.State((s: any) => s.data.isSeller) isSeller!: boolean

  @transactionModule.State((s: any) => s.data.transactions) transactions!: Array<ITransaction>

  @counterpartyModule.Getter counterparties!: Array<ICounterparty>
  @counterpartyModule.Getter totalPower!: string
  @counterpartyModule.Getter totalPrice!: string
  @counterpartyModule.Getter totalDer!: string
}
