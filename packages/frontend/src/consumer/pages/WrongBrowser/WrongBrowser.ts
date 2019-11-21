import Vue from 'vue'
import { Component } from 'vue-property-decorator'

export interface IAllowedBrowser {
  name: string,
  logo: string,
  url: string,
}

@Component({})
export default class WrongBrowser extends Vue {
  allowedBrowsers: IAllowedBrowser[] = [
    {
      name: 'Coinbase',
      logo: '/static/browser-logos/coinbase.svg',
      url: '#',
    },
    {
      name: 'Status',
      logo: '/static/browser-logos/status.svg',
      url: '#',
    },
    {
      name: 'True Wallet',
      logo: '/static/browser-logos/true-wallet.svg',
      url: '#',
    },
  ]
}
