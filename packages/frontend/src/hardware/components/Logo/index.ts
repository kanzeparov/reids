import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import template from './Logo.vue'

@Component({
  name: 'Logo',
  mixins: [template],
  components: {}
})

export default class Logo extends Vue {}
