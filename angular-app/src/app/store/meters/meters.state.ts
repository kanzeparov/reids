import { MetersCollection, MeterRelations } from './meter.model';

export interface MetersState {
  collection: MetersCollection;
  relations: MeterRelations;
}
