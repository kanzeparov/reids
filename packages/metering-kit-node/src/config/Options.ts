import { validate, InvalidConfigError, DefaultPorts } from '@onder/common'
import * as moment from 'moment'
import * as yargs from 'yargs'
import IOptions from './IOptions'
import { BigNumber } from 'bignumber.js'
import { URL } from 'url'

const parser = yargs
  .config()
  .alias('c', 'config')
  .demandOption('config')

const constraints = {
  'resolver.kind': {
    presence: {
      allowEmpty: false
    }
  },
  quantum: {
    presence: true,
    isDuration: true
  },
  webInterfaceHost: {
    presence: true
  },
  cellName: {
    presence: {
      allowEmpty: false
    }
  },
  meters: {
    presence: {
      allowEmpty: false
    }
  },
  databaseConfig: {
    presence: {
      allowEmpty: false
    }
  },
  databaseUrl: {
    presence: {
      allowEmpty: false
    }
  },
  defaultPrice: {
    presence: {
      allowEmpty: false
    }
  },
  upstreamAccount: { // FIXME Validate ETH address
    presence: {
      allowEmpty: false
    }
  },
  ethereumUrl: {
    presence: {
      allowEmpty: false
    }
  },
  isSeller: {
    presence: {
      allowEmpty: false
    }
  },
  wallets: {
    presence: {
      allowEmpty: false
    }
  },
  dsmUrl: {
    presence: {
      allowEmpty: false
    }
  },
  tokenContract: {
    presence: {
      allowEmpty: false
    }
  }
}

namespace Options {
  async function parse (args: Array<string>): Promise<any> {
    const options = parser.parse(args)
    const validationErrors = validate(options, constraints)
    if (validationErrors) {
      throw new InvalidConfigError(validationErrors)
    } else {
      return options
    }
  }

  export async function build (args: Array<string>): Promise<IOptions> {
    const options = await parse(args)
    const tradePort = options.tradePort || DefaultPorts.TRADE_CHANNEL
    const webInterfacePort = options.webInterfacePort || DefaultPorts.WEB_INTERFACE
    return {
      cellName: options.cellName,
      resolver: options.resolver,
      quantum: moment.duration(options.quantum).asMilliseconds(),
      meters: options.meters,
      webInterfacePort: webInterfacePort,
      tradePort: tradePort,
      tradeHost: options.tradeHost,
      host: options.webInterfaceHost,
      databaseUrl: options.databaseUrl,
      databaseConfig: options.databaseConfig,
      proxy: options.proxy,
      defaultPrice: new BigNumber(options.defaultPrice.toString()),
      upstreamAccount: options.upstreamAccount,
      wallets: options.wallets,
      ethereumUrl: options.ethereumUrl,
      allowSendStatistic: Boolean(options.allowSendStatistic),
      isSeller: Boolean(options.isSeller),
      storeErrors: Boolean(options.storeErrors),
      dsmUrl: new URL(options.dsmUrl),
      operatorUrl: options.operatorUrl ? new URL(options.operatorUrl) : undefined,
      minimumChannelAmount: options.minimumChannelAmount ? new BigNumber(options.minimumChannelAmount) : undefined,
      tokenContract: options.tokenContract
    }
  }
}

export default Options
