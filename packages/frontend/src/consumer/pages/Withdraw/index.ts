import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import { namespace } from 'vuex-class'
const profileModule = namespace('profile')

import template from './Withdraw.vue'

const avatar: string = `
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 5 5" version="1.1" shape-rendering="crispEdges"><path d="M0 0h5v5H0V0z" fill="#ffffff"></path><path d="M0 0h1v1H0V0zm2 0h1v1H2V0zm2 0h1v1H4V0z" fill-rule="evenodd" fill="#ff8a65"></path><path d="M0 1h5v1H0V1z" fill="#ff8a65"></path><path d="M0 2h5v1H0V2z" fill="#ff8a65"></path><path d="M0 3h1v1H0V3zm2 0h1v1H2V3zm2 0h1v1H4V3z" fill-rule="evenodd" fill="#ff8a65"></path><path d="M0 4h2v1H0V4zm3 0h2v1H3V4z" fill-rule="evenodd" fill="#ff8a65"></path></svg>
`

@Component({
  name: 'Withdraw',
  mixins: [template],
  components: {}
})
export default class Withdraw extends Vue {
  @profileModule.Getter balance?: number
  @profileModule.State((s: any) => s.data.balanceEth) balanceEth?: number
  @profileModule.State((s: any) => s.data.balanceChannel) balanceChannel?: number

  @profileModule.Action syncBalance!: Function
  @profileModule.Action desyncBalance!: Function

  isValidAmount: boolean = true
  errorMessages: string[] = []
  amount: string = ''
  channelsHidden: boolean = true
  channels: Array<any> = [
    {
      avatar,
      account: '0x0a30as1asf78a978asf',
      shortAccount: '0x0a30as...78asf',
      balance: 1.2,
      isUnlocking: false,
    },
    {
      avatar,
      account: '0x0a30as1asf78a978asf',
      shortAccount: '0x0a30as...78asf',
      balance: 1.2,
      isUnlocking: false,
    },
    {
      avatar,
      account: '0x0a30as1asf78a978asf',
      shortAccount: '0x0a30as...78asf',
      balance: 1.8,
      isUnlocking: true,
    },
    {
      avatar,
      account: '0x0a30as1asf78a978asf',
      shortAccount: '0x0a30as...78asf',
      balance: 1.2,
      isUnlocking: false,
    },
    {
      avatar,
      account: '0x0a30as1asf78a978asf',
      shortAccount: '0x0a30as...78asf',
      balance: 0.72,
      isUnlocking: true,
    },
    {
      avatar,
      account: '0x0a30as1asf78a978asf',
      shortAccount: '0x0a30as...78asf',
      balance: 1.2,
      isUnlocking: false,
    },
    {
      avatar,
      account: '0x0a30as1asf78a978asf',
      shortAccount: '0x0a30as...78asf',
      balance: 1.2,
      isUnlocking: false,
    },
    {
      avatar,
      account: '0x0a30as1asf78a978asf',
      shortAccount: '0x0a30as...78asf',
      balance: 1.2,
      isUnlocking: false,
    },
    {
      avatar,
      account: '0x0a30as1asf78a978asf',
      shortAccount: '0x0a30as...78asf',
      balance: 0.72,
      isUnlocking: true,
    },
    {
      avatar,
      account: '0x0a30as1asf78a978asf',
      shortAccount: '0x0a30as...78asf',
      balance: 1.2,
      isUnlocking: false,
    },
    {
      avatar,
      account: '0x0a30as1asf78a978asf',
      shortAccount: '0x0a30as...78asf',
      balance: 1.2,
      isUnlocking: false,
    },
    {
      avatar,
      account: '0x0a30as1asf78a978asf',
      shortAccount: '0x0a30as...78asf',
      balance: 1.2,
      isUnlocking: false,
    },
  ]

  toggleChannels () {
    this.channelsHidden = !this.channelsHidden
  }

  submitWithdraw () {
    this.validate(this.amount)
    if (!this.isValidAmount) {
      return
    }

    console.log('Submit withdraw', this.amount)
  }

  unlockChannel (channel: any) {
    channel.isUnlocking = true
    console.log('Unlock channel', channel)
  }

  onAmountChange () {
    if (!this.isValidAmount) {
      this.validate(this.amount)
    }
  }

  resetValidation () {
    this.isValidAmount = true
    this.errorMessages = []
  }

  validate (value: string) {
    const isBlank = value.trim() === ''
    const notNumber = isNaN(Number(value))
    const lessThanOrEqualToZero = Number(value) <= 0

    if (isBlank || notNumber || lessThanOrEqualToZero) {
      this.isValidAmount = false
      this.errorMessages = ['Amount is not valid']
      return
    }

    this.resetValidation()
  }

  created () {
    this.syncBalance()
  }

  destroyed () {
    this.desyncBalance()
  }
}
