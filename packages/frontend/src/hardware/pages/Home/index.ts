import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import template from './Home.vue'
import * as Store from '../../store'

@Component({
  name: 'Home',
  mixins: [template],
  components: {}
})

export default class Home extends Vue {
  async mounted () {
    const connectionStatus = await Store.dispatchCheckConnection(this.$store)
    if (!connectionStatus) {
      this.$router.push({
        name: 'Settings'
      })
    } else {
      return this.onderListRedirect()
    }
  }
  async onderListRedirect () {
    const onderList = await Store.dispatchGetOnderUrlList(this.$store)
    if (onderList.length === 1) {
      document.location.href = `http://${onderList[0]}`
    } else {
      this.$router.push({
        name: 'OnderList'
      })
    }
  }

  get connectionStatus (): boolean {
    return Store.readConnectionStatus(this.$store)
  }
}
