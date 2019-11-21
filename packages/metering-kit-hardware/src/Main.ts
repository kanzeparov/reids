import Registry from './Registry'
import IOptions from './config/IOptions'

export default class Main {
  registry: Registry

  constructor (options: IOptions) {
    this.registry = new Registry(options)
  }

  async run (): Promise<void> {
    const hardwareDatabase = await this.registry.hardwareDatabase()
    await hardwareDatabase.createTables()

    const application = await this.registry.application()

    await application.run()
  }
}
