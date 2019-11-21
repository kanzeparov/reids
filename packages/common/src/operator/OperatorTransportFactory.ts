import OperatorTransport from './OperatorTransport'

export default class OperatorTransportFactory {
  private instances: Map<number, OperatorTransport> = new Map()

  createOperatorTransport (port: number): OperatorTransport {
    if (!this.instances.has(port)) {
      this.instances.set(port, new OperatorTransport(port))
    }
    let result = this.instances.get(port)
    if (!result) {
      result = new OperatorTransport(port)
      this.instances.set(port, result)
    }
    return result
  }
}
