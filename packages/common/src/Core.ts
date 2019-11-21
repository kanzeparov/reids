import * as interfaces from '@onder/interfaces'
import Logger from '@machinomy/logger'

const log = new Logger('onder-common-core')

export default class Core implements interfaces.ICore {
  private modules: Map<interfaces.ModuleType, interfaces.IModule>
  private static instance: Core = new Core()

  constructor () {
    this.modules = new Map<interfaces.ModuleType, interfaces.IModule>()
  }

  public static getInstance (): Core {
    return this.instance
  }

  async addModule (module: interfaces.IModule): Promise<void> {
    if (this.modules.has(module.getType())) {
      throw new Error(`Module type ${module.getType()} already exists!`)
    }
    try {
      this.modules.set(module.getType(), module)
      return module.init().then(() => {
        log.info('Success inited ', module.getType())
        return Promise.resolve()
      }).catch((reason) => {
        log.error('Cant init ', module.getType(), reason)
        return Promise.reject(reason)
      })
    } catch (er) {
      this.modules.delete(module.getType())
      log.error(`Can't initialyze module ${module.getType()}:`, er)
      return Promise.reject(`Can't initialyze module ${module.getType()}: ${er}`)
    }
  }

  getModule (type: interfaces.ModuleType): (interfaces.IModule | undefined) {
    if (this.modules.has(type)) {
      let module = this.modules.get(type)
      return module
    }
    return undefined
  }
}
