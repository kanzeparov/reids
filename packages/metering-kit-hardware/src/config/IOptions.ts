import { IMeterConfiguration } from '@onder/interfaces'

export default interface IOptions {
  readonly quantum: number
  readonly meters: Array<IMeterConfiguration>
  readonly webInterfacePort: number
  readonly webInterfaceHost: string
  readonly databaseUrl: string
  readonly resolver: {
    kind: string,
    domain?: string
  }
  readonly proxy: string
}
