import { Observable, fromEvent, merge, of } from 'rxjs'
import { mapTo } from 'rxjs/operators'

export default class NetworkService {
  static listenConnection (): Observable<boolean> {
    return merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(mapTo(true)),
      fromEvent(window, 'offline').pipe(mapTo(false)),
    )
  }
}
