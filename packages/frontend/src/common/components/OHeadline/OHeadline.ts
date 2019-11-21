import { Component, Prop } from 'vue-property-decorator'
import IPropsToClassMapping from '@/common/interfaces/IPropsToClassMapping'
import BaseComponent from '@/common/components/BaseComponent'

@Component({})
export default class OHeadline extends BaseComponent {
  @Prop(Boolean) inline?: boolean
  @Prop(String) color?: string

  classMappings: IPropsToClassMapping = {
    inline: 'inline',
    color: 'c-{}',
  }
}
