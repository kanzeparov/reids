import { Component, Prop } from 'vue-property-decorator'
import BaseComponent from '@/common/components/BaseComponent'
import IPropsToClassMapping from '@/common/interfaces/IPropsToClassMapping'

@Component({})
export default class OHeadedText extends BaseComponent {
  @Prop(String) head?: string
  @Prop(String) text?: string
  @Prop(Boolean) headBold?: boolean

  classMappings: IPropsToClassMapping = {
    headBold: 'bold',
  }
}
