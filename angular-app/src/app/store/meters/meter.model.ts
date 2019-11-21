export interface MeterItem {
  uuid: string;
  name: string;
  comment: string;
  isSeller?: boolean;
}

export interface MetersCollection {
  [uuid: string]: MeterItem;
}

export interface MeterRelations {
  [sellerUuid: string]: string[];
}
