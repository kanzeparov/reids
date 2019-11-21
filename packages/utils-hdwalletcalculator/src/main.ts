import Application from './application'
import { Configuration } from '@onder/common'

async function main () {
  const configuration = new Configuration()
  const application = new Application(configuration)
  await configuration.init()
  application.startApplication()
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
