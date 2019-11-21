import Vue from 'vue'
import Notifications from 'vue-notification'

import INotificationMessage from '../interfaces/INotificationMessage'

export default class Http {
  constructor () {
    Vue.use(Notifications)
  }
  private showNotification (message: INotificationMessage, vue: Vue, group: string) {
    vue.$notify({
      group,
      title: message.name,
      text: message.message
    })
  }
  showError (message: INotificationMessage, vue: Vue) {
    this.showNotification(message, vue, 'error')
  }
  showInfo (message: INotificationMessage, vue: Vue) {
    this.showNotification(message, vue, 'info')
  }
  showSuccess (message: INotificationMessage, vue: Vue) {
    this.showNotification(message, vue, 'success')
  }
}
