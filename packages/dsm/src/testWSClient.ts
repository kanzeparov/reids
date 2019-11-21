#!/usr/bin/env node

import * as JsonRpcWs from 'json-rpc-ws'
import * as yargs from 'yargs'
import { DateTime } from 'luxon'

async function main (): Promise<void> {
  const argv = yargs
    .option('endpoint', {
      alias: 'e',
      describe: 'DSM Address',
      default: 'ws://localhost:8080'
    })
    .option('timestamp', {
      alias: 't'
    })
    .argv

  const client = JsonRpcWs.createClient()
  const endpoint = argv.endpoint
  const timestampArg = argv.timestamp as string
  const timestamp = timestampArg ? DateTime.fromISO(timestampArg) : DateTime.local()
  const params = [timestamp.toString()]

  console.debug(`Asking DSM on ${endpoint} for timestamp ${timestamp.toString()}`)
  client.connect(endpoint, () => {
    client.send('getPrice', params, (error, reply) => {
      if (error) {
        console.error(error)
        return
      }
      console.log(`Current price on ${timestamp} is ${reply}`)
      process.exit(0)
    })
  })
}

main().then(() => {
  // Do Nothing
}).catch(error => {
  console.error(error)
  process.exit(1)
})
