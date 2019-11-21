import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import { IWebError } from '@onder/interfaces'

import { IMeterError } from '@/consumer/store/modules/meter-error/types'
import { namespace } from 'vuex-class'
const errorModule = namespace('meterError')

import template from './ErrorLog.vue'

@Component({
  name: 'ErrorLog',
  mixins: [ template ],
})
export default class ErrorLog extends Vue {
  @errorModule.Action syncMeterErrors!: Function
  @errorModule.Getter fixedErrors?: Array<IMeterError>
  @errorModule.Getter notFixedErrors?: Array<IMeterError>

  deleteError (error: any) {
    const confirmDeleting = window.confirm('Are you going to delete error?')
    if (confirmDeleting) {
      console.log("You've deleted error", error)
    }
  }

  deleteAllErrors () {
    console.log('Clear all errors')
  }

  async created () {
    this.syncMeterErrors()
  }
}
