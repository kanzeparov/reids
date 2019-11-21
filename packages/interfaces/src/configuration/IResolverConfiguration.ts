import { ResolveType } from './'

export default interface IResolverConfiguration {
  getResolveType (): ResolveType
  getDomainName (): string
}
