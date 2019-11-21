enum ResolveType {
  Bonjour = 'Bonjour',
  DNS = 'DNS'
}

namespace ResolveType {
  export function select (name: string): ResolveType {
    if (name in ResolveType) {
      return name as ResolveType
    } else {
      throw Error(`Unsupported resolver "${name}"`)
    }
  }
}

export default ResolveType
