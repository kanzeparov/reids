import { Injectable } from '@angular/core';
import { Subject, Observable, Observer } from 'rxjs';

import { environment } from '@env';
import { map } from 'rxjs/operators';

const URL = environment.enableMocks ?
  environment.mockWebsocketUrl :
  environment.websocketUrl;

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  constructor() { }

  private subject: Subject<MessageEvent>;

  public connect(url: string = URL): Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
    }

    return this.subject;
  }

  public get mapToJson() {
    return map(({ data }: MessageEvent) => JSON.parse(data));
  }

  public sendMessage(message: any, url: string = URL) {
    return this
      .connect(url)
      .next(message);
  }

  private create(url: string): Subject<MessageEvent> {
    const ws = new WebSocket(url);

    const observable = Observable.create((obs: Observer<MessageEvent>) => {
      ws.onopen = () => {
        console.log(`Connected to websocket: ${url}`);
      };

      ws.onmessage = obs.next.bind(obs);
      ws.onclose = obs.complete.bind(obs);

      ws.onerror = this.handleErrors.bind(this, obs.error.bind(obs));

      return ws.close.bind(ws);
    });

    const observer = {
      next: (data: any) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };

    return Subject.create(observer, observable);
  }

  private handleErrors(errorCb: any, error: any) {
    console.log('Oops from ws service', error);
    errorCb(error);
  }
}
