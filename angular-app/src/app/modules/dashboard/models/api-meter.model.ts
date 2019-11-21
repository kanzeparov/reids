export interface ApiMeter {
  uuid: string;
  name: string;
  comment: string;
}

export interface ApiMeterRelation {
  sellerUuid: string;
  meterUuid: string;
}
