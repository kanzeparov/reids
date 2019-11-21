export interface ApiMeterReportsChartItem {
  time: number;
  value: string;
}

export interface ApiMeterReports {
  uuid: string;
  price: string;
  saleKwh: string;
  saleTokens: string;
  purchaseKwh: string;
  purchaseTokens: string;
  updateTime: number;
}

export interface ApiMeterReportsUpdate {
  time: number;
  instantConsumption: string;
  instantPrice: string;
  meters: ApiMeterReports[];
}
