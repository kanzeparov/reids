import { IMeterValue } from '../meters'

export default interface IHardwareDatabase {
  createTables (): Promise<void>
  addMeterValues (meterId: string, meterValues: IMeterValue[]): Promise<void>
  getAllMeterValues (meterId: string, limit: number): Promise<IMeterValue[]>
  clearAllMeterValues (meterId: string, meterValues: IMeterValue[]): Promise<void>
  clearAll (): Promise<void>
}
