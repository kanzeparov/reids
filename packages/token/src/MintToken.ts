#!/usr/bin/env node

import * as yargs from 'yargs'
import * as contracts from './index'
import Logger from '@machinomy/logger'
import HDWalletProvider from '@machinomy/hdwallet-provider'
import * as Web3 from 'web3'
import * as BigNumber from 'bignumber.js'

const LOG = new Logger('mint-tokens')

require('dotenv').config()

function pify<T> (fn: Function): Promise<T> {
  return new Promise((resolve, reject) => {
    const handler = (err: any, res: T) => {
      if (err) {
        return reject(err)
      }

      return resolve(res)
    }

    fn(handler)
  })
}

const ETH_RPC_URL = process.env.ETH_RPC_URL || 'http://localhost:8545'

const MINT_FROM_SEED_PHRASE = process.env.MINT_FROM_SEED_PHRASE
if (!MINT_FROM_SEED_PHRASE) {
  LOG.error('Please, set MINT_FROM_SEED_PHRASE env variable')
  process.exit(1)
}

const MINT_TO_SEED_PHRASE = process.env.MINT_TO_SEED_PHRASE
if (!MINT_TO_SEED_PHRASE) {
  LOG.error('Please, set MINT_TO_SEED_PHRASE env variable')
  process.exit(1)
}

const TOKEN_CONTRACT = process.env.TOKEN_CONTRACT
if (!TOKEN_CONTRACT) {
  LOG.error('Please, set TOKEN_CONTRACT env variable')
  process.exit(1)
}

const args = yargs
  .option('amount', {
    describe: 'Amount of tokens to send'
  })
  .argv

const MINT_AMOUNT = new BigNumber.BigNumber(Number(args['amount']) || 1)

async function run (): Promise<void> {
  LOG.info(`Start minting ${MINT_AMOUNT} tokens in network ${ETH_RPC_URL}`)
  const providerFrom = HDWalletProvider.http(MINT_FROM_SEED_PHRASE!, ETH_RPC_URL)
  const providerTo = HDWalletProvider.http(MINT_TO_SEED_PHRASE!, ETH_RPC_URL)
  const web3From = new Web3(providerFrom)
  const web3To = new Web3(providerTo)
  const accountsFrom = await pify<string[]>((cb: (error: Error, accounts: string[]) => void) => {
    web3From.eth.getAccounts(cb)
  })
  const accountsTo = await pify<string[]>((cb: (error: Error, accounts: string[]) => void) => {
    web3To.eth.getAccounts(cb)
  })

  const Token = contracts.Token.contract(providerFrom)
  const instanceToken = await Token.at(TOKEN_CONTRACT!)
  await instanceToken.mint(accountsTo[0], MINT_AMOUNT, {
    from: accountsFrom[0],
    gas: 300000
  })
  LOG.info(`${MINT_AMOUNT.toString()} tokens have been minted for ${accountsTo[0]}.`)
  LOG.info(`Balance of ${accountsTo[0]} is ${await instanceToken.balanceOf(accountsTo[0])}.`)
  process.exit(0)
}

run().then(() => {
  // Do Nothing
}).catch(error => {
  console.error(error)
  process.exit(1)
})
