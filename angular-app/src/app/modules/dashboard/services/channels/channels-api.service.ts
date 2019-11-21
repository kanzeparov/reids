import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiChannelsResponse, ApiCloseChannelResponse } from '@modules/dashboard/models/api-channel.model';

import { Observable, Subscriber, throwError, concat } from 'rxjs';
import { HTTP_RESPONSE_MOCKS } from './channels-api.mock';
import { delay, retryWhen, take } from 'rxjs/operators';

@Injectable()
export class ChannelsApiService {
  private RETRY_DELAY = 2000;
  private RETRIES_COUNT = 5;

  private getChannelsUrl = 'http://METER.devices.onder.tech:6065/meters/METER';
  private closeChannelUrl = 'http://METER.devices.onder.tech:6065/meters/METER/channels/CHANNEL';

  constructor(private http: HttpClient) { }

  getChannels(meterUuid: string) {
    const url = this.getChannelsUrl.replace(/METER/g, meterUuid);

    // Mock
    // return new Observable<ApiChannelsResponse>((subscriber: Subscriber<ApiChannelsResponse>) => {
    //   setTimeout(() => {
    //     // subscriber.error('Shit happens bro');
    //     subscriber.next(HTTP_RESPONSE_MOCKS.getChannels);
    //     subscriber.complete();
    //   }, 3000);
    // });

    return this.http.get<ApiChannelsResponse>(url).pipe(
      retryWhen(errors => concat(
        errors.pipe(
          delay(this.RETRY_DELAY),
          take(this.RETRIES_COUNT),
        ),
        throwError(`Could not fetch channels for meter: ${meterUuid}`))
      )
    );
  }

  closeChannel(meterUuid: string, channelUuid: string) {
    const url = this.closeChannelUrl
      .replace(/METER/g, meterUuid)
      .replace(/CHANNEL/g, channelUuid);
    const body = {};

    return this.http.delete<ApiCloseChannelResponse>(url, body);

    // Mock
    // return new Observable<ApiCloseChannelResponse>((subscriber: Subscriber<ApiCloseChannelResponse>) => {
    //   setTimeout(() => {
    //     // subscriber.error('Shit happens bro');
    //     subscriber.next(HTTP_RESPONSE_MOCKS.closeChannel);
    //     subscriber.complete();
    //   }, 3000);
    // });
  }
}
