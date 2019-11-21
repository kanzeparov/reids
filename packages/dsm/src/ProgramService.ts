import Logger from './Logger'
import loadJsonFile from 'load-json-file'
import { PricingProgramContainer } from './PricingProgramContainer'
import writeJsonFile from 'write-json-file'

const log = new Logger('program-service')

export class ProgramService {
  pathToConfig: string
  json: any
  pricingPrograms: PricingProgramContainer

  constructor (pathToConfig: string, pricingPrograms: PricingProgramContainer) {
    this.pathToConfig = pathToConfig
    this.json = {}
    this.pricingPrograms = pricingPrograms
  }

  async init (): Promise<void> {
    this.json = await loadJsonFile(this.pathToConfig)
  }

  async setCurrentProgram (program: string, programOption: any): Promise<void> {
    log.info(`Set program to ${program}`)
    this.json.plugin = program
    log.info(`Set program options to ${JSON.stringify(programOption)}`)
    const patched = Object.assign(this.json.pluginOptions, programOption)
    this.json.pluginOptions = patched
    await writeJsonFile(this.pathToConfig, this.json, { detectIndent: true })
  }

  async currentProgram (): Promise<string> {
    return this.json.plugin
  }

  async getProgramList () {
    return this.pricingPrograms.getPrograms()
  }

  async getProgramOptions () {
    return this.json.pluginOptions
  }
}
