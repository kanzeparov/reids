import { SafeHtml } from '@angular/platform-browser';

export interface MeterReportsTableItem {
  uuid: string;
  isSeller: boolean;

  meter: {
    name: string;
    comment: string;
  };

  meterReport: {
    price: string;
    priceIsQuiet: boolean;

    saleKwh: string;
    saleKwhIsQuiet: boolean;

    saleTokens: string;
    saleTokensIsQuiet: boolean;

    purchaseKwh: string;
    purchaseKwhIsQuiet: boolean;

    purchaseTokens: string;
    purchaseTokensIsQuiet: boolean;

    updateTime: string;
    updateTimeIsQuiet: boolean;
  };

  gravatar: SafeHtml;
}
