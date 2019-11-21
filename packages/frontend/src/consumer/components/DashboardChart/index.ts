import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import { namespace } from 'vuex-class'
const paymentModule = namespace('payment')
const profileModule = namespace('profile')

import Chart from './Chart'

import template from './DashboardChart.vue'

@Component({
  name: 'DashboardChart',
  mixins: [ template ],
  components: {
    Chart,
  },
})
export default class DashboardChart extends Vue {
  @profileModule.State((s: any) => s.data.isSeller) isSeller!: boolean

  @paymentModule.Getter datetimeTicks!: string[]
  @paymentModule.Getter totalPower!: string
  @paymentModule.Getter totalWastedPower!: string
  @paymentModule.Getter totalPrice!: string
  @paymentModule.Getter totalSellPrice!: string

  @Prop(Promise) paymentsStream!: Promise<any>

  activeChart: number = 5

  seriesSize: number = 100
  charts: object = {
    powerChart: {
      chartOptions: {
        chart: { type: 'column', height: 80 },
      },
      seriesOptions: [
        { id: 'powerList', name: 'power', color: '#F4C52E' },
        { id: 'wastedPowerList', name: 'wastedPower', color: '#FC121B' },
      ],
    },
    priceChart: {
      chartOptions: {
        chart: { type: 'column', height: 50 },
      },
      seriesOptions: [
        { id: 'priceList', name: 'price', color: '#a9a9a9' },
      ],
    },
    sellPriceChart: {
      chartOptions: {
        chart: { type: 'line', height: 50 },
      },
      seriesOptions: [
        { id: 'sellPriceList', name: 'sellPrice', color: '#F4C52E' },
      ],
    },
  }

  get hasWastedPower (): boolean {
    return this.totalWastedPower !== '0.00'
  }

  // handlePeriodToggleStickiness () {
  //   const { periodToggle, stickyPeriodToggle } = this.$refs
  //   if (!periodToggle || !stickyPeriodToggle) return
  //
  //   const needToStick = 0 >= periodToggle.getBoundingClientRect().top
  //   const isHidden = stickyPeriodToggle.classList.contains('hidden')
  //
  //   if (needToStick && isHidden) {
  //     stickyPeriodToggle.classList.remove('hidden')
  //   }
  //   if (!needToStick && !isHidden) {
  //     stickyPeriodToggle.classList.add('hidden')
  //   }
  // }
}
