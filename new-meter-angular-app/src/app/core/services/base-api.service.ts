import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, concat, Observable, of, throwError } from 'rxjs';
import { concatMap, delay, retryWhen, skip, take, tap } from 'rxjs/operators';

declare interface Options {
  body?: object;
  errorMsg?: string;
  retryDelay?: number;
  retriesCount?: number;
  pollDelay?: number;
  pollTriggerEvent?: string;
  pollAfterDelay?: boolean;
}

export enum RequestMethod {
  Get = 'GET',
  Post = 'POST',
  Patch = 'PATCH',
  Delete = 'DELETE',
}

@Injectable()
export class BaseApiService {
  private RETRY_DELAY = 2000;
  private RETRIES_COUNT = 5;
  private POLL_DELAY = 5000;
  private POLL_TRIGGER_EVENT = '[BaseApiService] Poll trigger';

  constructor(private http: HttpClient) { }

  get$<T>(url: string, userOptions: Options = {}): Observable<T> {
    return this.performRequest$(RequestMethod.Get, url, userOptions);
  }

  post$<T>(url: string, userOptions: Options = {}): Observable<T> {
    return this.performRequest$(RequestMethod.Post, url, userOptions);
  }

  patch$<T>(url: string, userOptions: Options = {}): Observable<T> {
    return this.performRequest$(RequestMethod.Patch, url, userOptions);
  }

  delete$<T>(url: string, userOptions: Options = {}): Observable<T> {
    return this.performRequest$(RequestMethod.Delete, url, userOptions);
  }

  poll$(url: string, userOptions: Options = {}) {
    const options = {
      ...this.getBaseOptions(url, RequestMethod.Get),
      ...userOptions,
    };

    const request$ = this.get$(url, userOptions);

    const pollTrigger$ = new BehaviorSubject('');
    const pollDelay$ = of(options.pollTriggerEvent).pipe(
      delay(options.pollDelay),
      tap(_ => pollTrigger$.next(options.pollTriggerEvent)),
      skip(1),
    );
    const polledChannels$ = userOptions.pollAfterDelay ?
      concat(pollDelay$, request$) :
      concat(request$, pollDelay$);

    return pollTrigger$.pipe(concatMap(_ => polledChannels$));
  }

  private performRequest$<T>(reqMethod: RequestMethod, url: string, userOptions: Options = {}): Observable<T> {
    const options = {
      ...this.getBaseOptions(url, reqMethod),
      ...userOptions,
    };
    const methodName = this.getMethodName(reqMethod);

    return this.http[methodName]<T>(url, options.body).pipe(
      retryWhen(errors => concat(
        errors.pipe(
          delay(options.retryDelay),
          take(options.retriesCount),
        ),
        throwError(options.errorMsg),
      ))
    );
  }

  private getMethodName(reqMethod: RequestMethod): string {
    switch (reqMethod) {
      case RequestMethod.Get: return 'get';
      case RequestMethod.Post: return 'post';
      case RequestMethod.Patch: return 'patch';
      case RequestMethod.Delete: return 'delete';
    }
  }

  private getBaseOptions(url: string, method: RequestMethod): Options {
    return {
      errorMsg: `Could not perform ${method} request: ${url}`,
      retryDelay: this.RETRY_DELAY,
      retriesCount: this.RETRIES_COUNT,
      pollDelay: this.POLL_DELAY,
      pollTriggerEvent: this.POLL_TRIGGER_EVENT,
      pollAfterDelay: false,
    };
  }
}
