import { ResolveType } from '@onder/interfaces'
import ResolveDNS from './ResolveDNS'
import ResolveBonjour from './ResolveBonjour'
import AnnounceBonjour from './AnnounceBonjour'
import Logger from './Logger'
import IResolve from './IResolve'

const log = new Logger('address-service')

export default class AddressService {
  private readonly resolveType: ResolveType
  private readonly domainName?: string

  private _resolve?: IResolve
  private _announce?: AnnounceBonjour

  constructor (resolveType: ResolveType, domainName?: string) {
    this.resolveType = resolveType
    this.domainName = domainName
  }

  resolve (): IResolve {
    if (!this._resolve) {
      const type = this.resolveType
      switch (type) {
        case ResolveType.DNS:
          log.info('Using DNS resolver')
          this._resolve = new ResolveDNS(this.domainName)
          break
        case ResolveType.Bonjour:
          log.info('Using Bonjour resolver')
          this._resolve = new ResolveBonjour()
          break
        default:
          throw new Error(`Unknow type for address service: type`)
      }
    }
    return this._resolve
  }

  announce (): AnnounceBonjour {
    if (!this._announce) {
      this._announce = new AnnounceBonjour()
    }
    return this._announce
  }
}
