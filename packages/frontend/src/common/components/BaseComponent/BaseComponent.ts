import Vue from 'vue'
import Component from 'vue-class-component'
import IPropsToClassMapping from '@/common/interfaces/IPropsToClassMapping'

@Component({})
export default class BaseComponent extends Vue {
  classMappings: IPropsToClassMapping = {}
  $props: any

  get classesFromProps (): Array<string> {
    const props: Array<[string, any]> =
      Object.entries(this.$props)
        .filter(([k, _]: [string, any]) => this.classMappings.hasOwnProperty(k))
        .filter(([_, v]: [string, any]) => Boolean(v))
    return props.map(this.getClassFromProp)
  }

  getClassFromProp ([prop, value]: [string, any]): string {
    return this.classMappings[prop].replace(/{}/g, value)
  }
}
