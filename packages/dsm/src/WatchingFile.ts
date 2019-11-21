import { Observable, Subscriber } from 'rxjs'
import * as path from 'path'
import * as fs from 'fs'
import Logger from './Logger'

const log = new Logger('watching-file')

export class WatchingFile extends Observable<string> {
  readonly filename: string
  readonly watch: typeof fs.watch

  constructor (filename: string, watch?: typeof fs.watch) {
    super(subscriber => this.handle(subscriber))
    this.filename = filename
    this.watch = watch || fs.watch
  }

  private handle (subscriber: Subscriber<string>): () => void {
    const filename = this.filename
    const filepath = path.resolve(filename)
    const directory = path.dirname(filepath)
    const basename = path.basename(filepath)

    const emit = () => {
      log.debug(`Changed file ${filename}`)
      subscriber.next(filename)
    }

    const watcher = this.watch(directory, { persistent: false, recursive: false })

    watcher.on('change', (event, changedFilename) => {
      if (changedFilename === basename) {
        emit()
      }
    })

    watcher.on('error', error => {
      log.error(`Error on file ${filename}`, error)
      subscriber.error(error)
    })

    watcher.on('close', () => {
      log.error(`Closing file ${filename}`)
      subscriber.complete()
    })

    emit()

    return function unsubscribe () {
      log.info(`Stop watching file ${filename}`)
      watcher.close()
    }
  }
}
