import Vue from 'vue'

import OButton from './OButton'
import OHeadline from './OHeadline'
import OHeadedText from './OHeadedText'
import OTextBlock from './OTextBlock'

const components: Array<any> = [
  OButton,
  OHeadline,
  OHeadedText,
  OTextBlock,
]

components.forEach(component => Vue.component(component.name, component))
