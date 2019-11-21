import { validate, InvalidConfigError } from '@onder/common'
import * as moment from 'moment'
import * as yargs from 'yargs'
import IOptions from './IOptions'

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
  webInterfacePort: {
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThan: 0
    }
  },
  webInterfaceHost: {
    presence: true
  },
  meters: {
    presence: true,
    containsAccount: true
  },
  databaseUrl: {
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
    return {
      resolver: options.resolver,
      quantum: moment.duration(options.quantum).asMilliseconds(),
      meters: options.meters,
      webInterfacePort: options.webInterfacePort,
      webInterfaceHost: options.webInterfaceHost,
      databaseUrl: options.databaseUrl,
      proxy: options.proxy
    }
  }
}

export default Options
