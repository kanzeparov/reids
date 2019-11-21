import { IMeterValue, IMeter } from './'

export default interface IMeterReaderCallback {
  onReadValue (meter: IMeter, value: IMeterValue): PromiseLike<void>
}
