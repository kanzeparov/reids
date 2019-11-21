import ModuleType from './ModuleType'

interface IModule {

  getType (): ModuleType

  init (): Promise<void>

}

export default IModule
