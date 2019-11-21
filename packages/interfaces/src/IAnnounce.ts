export default interface IAnnounce {
  meterTransport (address: string, defaultPort: number): void
  tradeChannel (address: string, defaultPort: number): void
  operatorTransport (address: string, defaultPort: number): void
}
