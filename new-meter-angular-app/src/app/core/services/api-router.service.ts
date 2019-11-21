import { Injectable } from '@angular/core';
import { environment } from '@env';

declare interface UrlOptions {
  [key: string]: string;
}

@Injectable()
export class ApiRouterService {

  private readonly METER_ADDRESS_REGEX = /^0x.+$/g;
  private readonly BASE_DOMAIN = '{protocol}//{device}.devices.onder.tech:6065/meters/{device}';

  constructor() { }

  buildPath(pathTemplate: string, userOptions: UrlOptions = {}) {
    const urlTemplate = `${this.BASE_DOMAIN}/${pathTemplate}`;

    return this.buildUrl(urlTemplate, userOptions);
  }

  buildUrl(urlTemplate: string, userOptions: UrlOptions = {}) {
    const options = {
      ...this.getBaseOptions(),
      ...userOptions,
    };
    const optionEntries = Object.entries(options);

    return optionEntries.reduce((memo: string, [key, value]: [string, string]) => {
      const pattern = this.buildPattern(key);

      return memo.replace(pattern, value);
    }, urlTemplate);
  }

  private buildPattern(key: string) {
    return new RegExp(`\{${key}\}`, 'g');
  }

  private getBaseOptions() {
    return {
      device: this.getDeviceAddressFromHostname(),
      protocol: this.getCurrentProtocol(),
    };
  }

  private getDeviceAddressFromHostname() {
    const urlHostname = window.location.hostname;
    const deviceFromUrlHostname = urlHostname
      .split('.')
      .find((chunk: string) => this.METER_ADDRESS_REGEX.test(chunk));

    return deviceFromUrlHostname ?
      deviceFromUrlHostname :
      environment.fallbackCurrentMeterUuid;
  }

  private getCurrentProtocol() {
    return window.location.protocol;
  }
}
