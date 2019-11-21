import * as yargs from 'yargs'

export interface Options {
  readonly config: string
}

const PARSER = yargs
  .alias('c', 'config')
  .demandOption('config')

export namespace Options {
  export function build (argv: Array<string>): Options {
    const options = PARSER.parse(argv)
    return {
      config: String(options.config)
    }
  }
}
