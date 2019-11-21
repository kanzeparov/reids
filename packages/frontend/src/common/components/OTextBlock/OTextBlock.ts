import { Component, Prop } from 'vue-property-decorator'
import BaseComponent from '@/common/components/BaseComponent'
import IPropsToClassMapping from '@/common/interfaces/IPropsToClassMapping'

@Component({})
export default class OTextBlock extends BaseComponent {
  @Prop(Boolean) mono?: boolean
  @Prop(Boolean) monoLarge?: boolean
  @Prop(Boolean) upcase?: boolean
  @Prop(Boolean) bold?: boolean

  classMappings: IPropsToClassMapping = {
    mono: 'mono',
    monoLarge: 'mono-large',
    upcase: 'upcase',
    bold: 'bold',
  }
}
