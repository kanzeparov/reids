import { Options } from './Options'

describe('#build', () => {
  test('parse command line arguments', () => {
    const filename = '/path/to/config'
    const argv = `--config=${filename}`.split(' ')
    let parsed = Options.build(argv)
    expect(parsed.config).toBe(filename)
  })
})
