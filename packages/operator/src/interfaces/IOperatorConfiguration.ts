import { IModule, ResolveType } from '@onder/interfaces'

export default interface IOperatorConfiguration extends IModule {
  domainName: string
  getDatabaseUrl (): string

  getOperatorPort (): number

  getResolveType (): ResolveType
}
