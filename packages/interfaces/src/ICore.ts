import ModuleType from './ModuleType'
import IModule from './IModule'

export default interface ICore {
  getModule (type: ModuleType): (IModule | undefined)
}
