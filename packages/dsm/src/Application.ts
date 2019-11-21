import { Settings } from './Settings'
import { Endpoint } from './Endpoint'
import { UnreachableError } from './UnreachableError'
import Logger from './Logger'
import { IPricingProgram } from './IPricingProgram'
import { PricingProgram } from './PricingProgram'

const log = new Logger('application')

export type Application = Application.Stopped | Application.Started | Application.Empty

export namespace Application {
  export enum State {
    EMPTY,
    STOPPED,
    STARTED
  }

  export interface Empty {
    state: State.EMPTY
  }

  export interface Stopped {
    state: State.STOPPED
    endpoint: Endpoint.Stopped
    plugin: IPricingProgram
  }

  export interface Started {
    state: State.STARTED
    endpoint: Endpoint.Started
    plugin: IPricingProgram
  }

  export const EMPTY: Empty = {
    state: State.EMPTY
  }

  export function build (s: Settings): Stopped {
    log.info('Building application')
    log.debug('Based on settings', s)
    const plugin = PricingProgram.build(s.plugin, s.pluginOptions)
    const endpoint = Endpoint.build(s.host, s.port, s.apiHost, s.apiPort, s.pathToConfig, plugin, PricingProgram.ALL)
    const result: Stopped = {
      state: State.STOPPED,
      endpoint: endpoint,
      plugin: plugin
    }
    log.debug('Built application', result)
    return result
  }

  export async function start (application: Application): Promise<Started> {
    log.info('Starting application', application)
    switch (application.state) {
      case State.EMPTY:
        throw new Error('Can not start empty application')
      case State.STARTED:
        return application
      case State.STOPPED:
        const endpoint = await Endpoint.start(application.endpoint)
        return {
          state: State.STARTED,
          endpoint: endpoint,
          plugin: application.plugin
        }
      /* istanbul ignore next */
      default:
        throw new UnreachableError(application)
    }
  }

  export async function stop (application: Application): Promise<Stopped | Empty> {
    log.info('Stopping application')
    switch (application.state) {
      case State.EMPTY:
        return application
      case State.STOPPED:
        return application
      case State.STARTED:
        const endpoint = await Endpoint.stop(application.endpoint)
        return {
          state: State.STOPPED,
          plugin: application.plugin,
          endpoint: endpoint
        }
      /* istanbul ignore next */
      default:
        throw new UnreachableError(application)
    }
  }
}
