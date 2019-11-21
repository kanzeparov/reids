import { Component, Prop } from 'vue-property-decorator'
import IPropsToClassMapping from '@/common/interfaces/IPropsToClassMapping'
import BaseComponent from '@/common/components/BaseComponent'

@Component({})
export default class OBtn extends BaseComponent {
  @Prop(Boolean) outline?: boolean
  @Prop(Boolean) upcase?: boolean
  @Prop(String) color?: string

  classMappings: IPropsToClassMapping = {
    outline: 'outline',
    upcase: 'upcase bold',
    color: 'c-{}',
  }
}
