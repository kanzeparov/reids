import Vue from 'vue'
import * as Logger from 'js-logger'
import { Component } from 'vue-property-decorator'
import template from './NetworkSettings.vue'
import * as Store from '../../store'
import Dictionary, { IListItem } from '../../../common/services/dictionary'
import Notification from '../../../common/services/notification'

const $notification = new Notification()

const ecryption = require('../../dictionaries/encryption.json')
const Ecryption = new Dictionary(ecryption)

export interface INetworkSettings {
  ssid: string
  password: string
  encryption: string
  ip?: string
  mask?: string
  getway?: string
  dnsPrimary?: string
  dnsSecondary?: string
  [key: string]: string | undefined
}

@Component({
  name: 'Settings',
  mixins: [template],
  components: {}
})

export default class NetworkSettings extends Vue {
  showPassword: boolean = false
  ecryptionList: IListItem[] = Ecryption.getList()
  sendButtonStatus: boolean = true
  activeExtraSettings: string[] = []
  title: string = 'Настройка параметров сети'
  addressPlaceholder: string = '255.255.255.255'
  addressMask: string = '###.###.###.###'
  networkSettings: INetworkSettings = {
    ssid: '',
    password: '',
    encryption: '',
    ip: '',
    mask: '',
    getway: '',
    dnsPrimary: '',
    dnsSecondary: ''
  }

  mounted () {
    return this.getIntialSettings()
  }

  async sendSettings (): Promise<any> {
    const settings = this.getSettingsData()
    try {
      this.sendButtonStatus = false
      await Store.dispatchSetNetworkSettings(this.$store, settings)
      this.successApply()
    } catch (e) {
      Logger.error(e)
      this.errorApply(e)
      this.sendButtonStatus = true
    }
  }

  successApply (): void {
    $notification.showSuccess({
      name: 'Success',
      message: 'Settings successfully applied.'
    }, this)
  }

  errorApply (error: Error): void {
    $notification.showError({
      name: error.name,
      message: error.message
    }, this)
  }

  async getIntialSettings (): Promise<void> {
    try {
      const settings = await Store.dispatchGetNetworkSettings(this.$store)
      this.networkSettings.ssid = settings.ssid
      this.networkSettings.password = settings.password
      this.networkSettings.encryption = settings.encryption
    } catch (e) {
      this.networkSettings.ssid = ''
      this.networkSettings.password = ''
      this.networkSettings.encryption = Ecryption.getFirstValue()
    }
  }

  getSettingsData (): INetworkSettings {
    if (this.activeExtraSettings.indexOf('extra') === -1) {
      return {
        ssid: this.networkSettings.ssid,
        password: this.networkSettings.password,
        encryption: this.networkSettings.encryption
      }
    }
    return {
      ...this.networkSettings
    }
  }
}
