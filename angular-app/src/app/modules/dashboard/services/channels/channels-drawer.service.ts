import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChannelsDrawerService {
  intermediateState$: BehaviorSubject<any>;

  constructor() {}

  init(intermediateState$: BehaviorSubject<any>) {
    this.intermediateState$ = intermediateState$;
  }

  open(meterUuid: string) {
    this.intermediateState$.next({
      meterUuid,
      isOpen: true,
    });
  }

  close() {
    this.intermediateState$.next({
      isOpen: false,
      meterUuid: null,
    });
  }
}
