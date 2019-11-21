import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import { namespace } from 'vuex-class'
const profileModule = namespace('profile')

import template from './Settings.vue'

export interface IDeviceState {
  id: string
  precision: string
  model: string
  manufacturer: string
}

@Component({
  name: 'Settings',
  mixins: [ template ],
  filters: {
    formatPhoneNumber (rawPhoneNumber: string): string {
      return rawPhoneNumber
        .replace(/[^(\+\d+)(\d+)]/g, '')
        .replace(/(\+\d+|\d{0,1})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5')
        .trim()
    }
  }
})
export default class Settings extends Vue {
  @profileModule.Getter account!: string
  @profileModule.State((s: any) => s.data.isSeller) isSeller!: boolean

  device: IDeviceState = {
    id: '1234567890-009',
    precision: 'E2, 0',
    model: 'CRT-6786',
    manufacturer: 'CHINA Energo Models LTD',
  }

  timeZoneList = [
    'GMT+1:00',
    'GMT+2:00',
    'GMT+2:00',
    'GMT+3:00',
    'GMT+3:30',
    'GMT+4:00',
    'GMT+5:00',
    'GMT+5:30',
    'GMT+6:00',
    'GMT+7:00',
    'GMT+8:00',
    'GMT+9:00',
    'GMT+9:30',
    'GMT+10:00',
    'GMT+11:00',
    'GMT+12:00',
    'GMT-11:00',
    'GMT-10:00',
    'GMT-9:00',
    'GMT-8:00',
    'GMT-7:00',
    'GMT-7:00',
    'GMT-6:00',
    'GMT-5:00',
    'GMT-5:00',
    'GMT-4:00',
    'GMT-3:30',
    'GMT-3:00',
    'GMT-3:00',
    'GMT-1:00',
  ]
  languageList = [ 'English' ]

  name: string = 'Ivan Ivanov'
  email: string = 'ivan@ivanov.su'
  phoneNumber: string = '+79991231101'
  streetAddress: string = 'Volgograd city, Maharaeva st, 53 2'
  timezone: string = 'GMT+3:00'
  language: string = 'English'
  sendMonitoring: boolean = true
  upstream: string = '0x13255bfbe8b951.devices.onder.tech'
  sellPrice: number = 10.12
  borrowEnergy: boolean = true
  adminPhoneNumber: string = '+79991230001'
}
