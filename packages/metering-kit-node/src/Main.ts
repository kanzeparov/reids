import IOptions from './config/IOptions'
import Registry from './Registry'

export default class Main {
  registry: Registry

  constructor (options: IOptions) {
    this.registry = new Registry(options)
  }

  async run (): Promise<void> {
    const application = await this.registry.application()
    await application.start()
  }
}
