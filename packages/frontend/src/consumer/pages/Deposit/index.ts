import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import { namespace } from 'vuex-class'
const profileModule = namespace('profile')

import template from './Deposit.vue'

@Component({
  name: 'Deposit',
  mixins: [template],
  components: {}
})
export default class Deposit extends Vue {
  @profileModule.Getter balance?: number
  @profileModule.Action syncBalance!: Function
  @profileModule.Action desyncBalance!: Function

  isValidAmount: boolean = true
  errorMessages: string[] = []
  amount: string = ''

  submitDeposit () {
    this.validate(this.amount)
    if (!this.isValidAmount) {
      return
    }

    console.log('Submit deposit', this.amount)
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
