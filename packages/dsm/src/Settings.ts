import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { readFileSync } from 'fs'
import { WatchingFile } from './WatchingFile'

export interface Settings {
  readonly host: string
  readonly port: number
  readonly apiHost: string
  readonly apiPort: number
  readonly plugin: string
  readonly pluginOptions: Object
  readonly pluginDataCheckingRate: number
  readonly pathToConfig: string
}

export namespace Settings {
  export function observe (filename: string): Observable<Settings> {
    return new WatchingFile(filename)
      .pipe(
        map(filename => readFileSync(filename).toString()),
        map(content => parse(content, filename))
      )
  }

  export function parse (content: string, pathToConfig: string): Settings {
    const config = JSON.parse(content)
    return {
      host: config.host,
      port: config.port,
      apiHost: config.apiHost,
      apiPort: config.apiPort,
      plugin: config.plugin,
      pluginOptions: config.pluginOptions,
      pluginDataCheckingRate: config.pluginDataCheckingRate,
      pathToConfig: pathToConfig
    }
  }
}
