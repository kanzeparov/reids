import { Observable, Subscription } from 'rxjs'
import { Options } from './Options'
import { Settings } from './Settings'
import { map, mergeScan } from 'rxjs/operators'
import { Application } from './Application'

export class Main {
  subscription: Subscription = Subscription.EMPTY
  readonly application$: Observable<Application>

  constructor (argv: Array<string>) {
    const options = Options.build(argv)
    this.application$ = Settings.observe(options.config).pipe(
      map(Application.build),
      mergeScan<Application, Application>(async (acc, application) => {
        await Application.stop(acc)
        return Application.start(application)
      }, Application.EMPTY)
    )
  }

  start (): void {
    this.subscription = this.application$.subscribe()
  }

  stop (): void {
    this.subscription.unsubscribe()
  }
}
