import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import template from './OnderList.vue'
import * as Store from '../../store'
import { IMeterConfiguration } from '@onder/interfaces'

@Component({
  name: 'OnderList',
  mixins: [template],
  components: {}
})

export default class OnderList extends Vue {
  get onders (): IMeterConfiguration[] {
    return Store.readOnderUrls(this.$store)
  }
  async mounted () {
    await Store.dispatchGetOnderUrlList(this.$store)
  }
}
