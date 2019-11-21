import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import template from './Home.vue'

@Component({
  name: 'Home',
  mixins: [template],
  components: {}
})

export default class Home extends Vue {}
