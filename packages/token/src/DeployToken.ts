import * as fs from 'fs-extra'
import * as path from 'path'
import * as contracts from './index'
import HDWalletProvider from '@machinomy/hdwallet-provider'
import Logger from '@machinomy/logger'

require('dotenv').config()

const LOG = new Logger('deploy-token')

async function run () {
  const KEY = process.env.DEPLOY_FROM_SEED_PHRASE || 'peanut giggle name tree canoe tube render ketchup survey segment army will'
  const ETH_RPC_URL = process.env.ETH_RPC_URL || 'https://rinkeby.infura.io'

  LOG.info(`ETH_RPC_URL = ${ETH_RPC_URL}`)

  const provider = HDWalletProvider.http(KEY, ETH_RPC_URL)

  LOG.info(`Wait for 30-60 seconds, please.`)

  const Token = contracts.Token.contract(provider)
  const instanceToken = await Token.new({ from: await provider.getAddress(0) })

  const address = instanceToken.address
  const transactionHash = instanceToken.transactionHash

  LOG.info(`Address = ${address}`)
  LOG.info(`TransactionHash = ${transactionHash}`)

  const newItemJSON = {
    events: {},
    links: {},
    address: address,
    transactionHash: transactionHash
  }

  const ARTIFACT_PATH = path.resolve(__dirname, '../build/contracts/Token.json')
  const tokenJSON = require(ARTIFACT_PATH)
  tokenJSON['networks']['4'] = newItemJSON

  fs.writeFileSync(ARTIFACT_PATH, JSON.stringify(tokenJSON, null, 2))

  LOG.info('Token has been successfully deployed.')

  process.exit(0)
}

run().then(() => {
  // Do Nothing
}).catch(error => {
  console.error(error)
  process.exit(1)
})
