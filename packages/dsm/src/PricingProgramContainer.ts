import { IPricingProgram } from './IPricingProgram'
import Logger from './Logger'
import * as _ from 'lodash'
const log = new Logger('pricing-program-container')

export type Constructor = {
  new (args: any): IPricingProgram
  name: string
}

const humane = (text: string) => _.kebabCase(text).replace('-program', '')

export class PricingProgramContainer {
  private mapping: Map<string, Constructor> = new Map()

  append (program: Constructor) {
    const humanName = humane(program.name)
    this.mapping.set(humanName, program)
    return this
  }

  get (name: string) {
    const humanName = humane(name)
    return this.mapping.get(humanName)
  }

  build (name: string, args: any) {
    const Program = this.mapping.get(name)
    if (Program) {
      log.info(`Found pricing program ${name}`)
      return new Program(args)
    } else {
      throw new Error(`Can not find program ${name}`)
    }
  }

  getPrograms (): Array<string> {
    return Array.from(this.mapping.keys())
  }
}
