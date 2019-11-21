import { ApiEndpoint } from './ApiEndpoint'
import Logger from './Logger'
import { ProgramController } from './ProgramController'
import { ProgramService } from './ProgramService'
import { PricingProgramContainer } from './PricingProgramContainer'
import { UnreachableError } from './UnreachableError'
import { IPriceSource } from './IPriceSource'
import { WebsocketRPC } from './WebsocketRPC'
import { WebsocketServer } from './WebsocketServer'

const log = new Logger('endpoint')

export type Endpoint = Endpoint.Stopped | Endpoint.Started

export namespace Endpoint {
  export enum State {
    STARTED,
    STOPPED
  }

  export interface Stopped {
    readonly state: State.STOPPED
    readonly priceSource: IPriceSource
    readonly rpc: WebsocketRPC
    readonly api: ApiEndpoint
  }

  export interface Started {
    readonly state: State.STARTED
    readonly priceSource: IPriceSource
    readonly rpc: WebsocketRPC
    readonly api: ApiEndpoint
  }

  export function build (host: string, port: number, apiHost: string, apiPort: number, pathToConfig: string, priceSource: IPriceSource, pricingPrograms: PricingProgramContainer): Stopped {
    log.info(`Building endpoint on ${host}:${port} and API on ${apiHost}:${apiPort}`)
    const websocketServer = new WebsocketServer(host, port)
    const rpc = new WebsocketRPC(websocketServer, priceSource)
    const programService = new ProgramService(pathToConfig, pricingPrograms)
    const programController = new ProgramController(programService)
    const api = new ApiEndpoint(apiHost, apiPort, programController)
    return {
      state: State.STOPPED,
      priceSource: priceSource,
      rpc: rpc,
      api: api
    }
  }

  export async function start (endpoint: Started | Stopped): Promise<Started> {
    switch (endpoint.state) {
      case State.STARTED:
        return endpoint
      case State.STOPPED:
        await endpoint.rpc.start()
        await endpoint.api.start()
        return {
          state: State.STARTED,
          rpc: endpoint.rpc,
          priceSource: endpoint.priceSource,
          api: endpoint.api
        }
      /* istanbul ignore next */
      default:
        throw new UnreachableError(endpoint)
    }
  }

  export async function stop (endpoint: Endpoint): Promise<Stopped> {
    switch (endpoint.state) {
      case State.STARTED:
        log.info(`Stopping WS Server`)
        await endpoint.rpc.stop()
        await endpoint.api.stop()
        return {
          state: State.STOPPED,
          rpc: endpoint.rpc,
          priceSource: endpoint.priceSource,
          api: endpoint.api
        }
      case State.STOPPED:
        return endpoint
      /* istanbul ignore next */
      default:
        throw new UnreachableError(endpoint)
    }
  }
}
