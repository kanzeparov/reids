export default interface IMeterTransportCallback {
  turnOn (): Promise<boolean>
  turnOff (): Promise<boolean>
}
