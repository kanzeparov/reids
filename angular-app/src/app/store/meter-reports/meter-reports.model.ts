export interface MeterReportsItem {
  uuid: string;
  price: number;
  saleKwh: number;
  saleTokens: number;
  purchaseKwh: number;
  purchaseTokens: number;
  updateTime: number;
}

export interface MeterReportsCollection {
  [uuid: string]: MeterReportsItem;
}
