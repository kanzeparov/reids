import {
  ConnectionKind,
  ModuleType,
  IMeterConfigurationFile,
  IMeterConfigurationEnergomera
} from '@onder/interfaces'
import { expect } from 'chai'

import Configuration from '../Configuration/Configuration'

describe('Common_Configuration', function () {
  process.env['ACCOUNT'] = 'key'

  it('getType', function () {
    const configuration = new Configuration()
    return expect(configuration.getType()).to.be.equal(ModuleType.Configuration)
  })

  it('workTimeout by default', async function () {
    delete process.env['WORKTIMEOUT']
    const configuration = new Configuration()
    await configuration.init()
    return expect(configuration.workTimeout).to.be.equal(3000)
  })

  it('workTimeout by env', async function () {
    const workTimeout = '100'
    process.env['WORKTIMEOUT'] = workTimeout
    const configuration = new Configuration()
    await configuration.init()
    return expect(configuration.workTimeout).to.be.equal(+workTimeout)
  })

  it('getOwnerKey by env', async function () {
    const ownerKey = 'OWNERKEY'
    process.env['OWNERKEY'] = ownerKey
    const configuration = new Configuration()
    await configuration.init()
    return expect(configuration.getOwnerKey()).to.be.equal(ownerKey)
  })

  it('getEthereumApi by default', async function () {
    delete process.env['ETHEREUM_API']
    const configuration = new Configuration()
    await configuration.init()
    return expect(configuration.getEthereumApi()).to.be.equal('http://localhost:8545')
  })

  it('getEthereumApi by env', async function () {
    const ethereumApi = 'ETHEREUMAPI'
    process.env['ETHEREUM_API'] = ethereumApi
    const configuration = new Configuration()
    await configuration.init()
    return expect(configuration.getEthereumApi()).to.be.equal(ethereumApi)
  })

  it('getProblemUri by defult', async function () {
    delete process.env['PROBLEM_URL']
    const configuration = new Configuration()
    await configuration.init()
    return expect(configuration.getProblemUri()).to.be.equal('http://localhost:6660/problem')
  })

  it('getProblemUri by env', async function () {
    const problemUrl = 'http://PROBLEM_URL.com'
    process.env['PROBLEM_URL'] = problemUrl
    const configuration = new Configuration()
    await configuration.init()
    return expect(configuration.getProblemUri()).to.be.equal(problemUrl)
  })

  it('getDatabaseUrl', async function () {
    const databaseUrl = 'sqlite://./db.db'
    process.env['DB_CONNECTION'] = databaseUrl
    const configuration = new Configuration()
    await configuration.init()
    return expect(configuration.getDatabaseUrl()).to.be.equal(databaseUrl)
  })

  it('getWebInterfacePort by default', async function () {
    delete process.env['WEB_INTERFACE_PORT']
    const configuration = new Configuration()
    await configuration.init()
    return expect(configuration.getWebInterfacePort()).to.be.equal(80)
  })

  it('getWebInterfacePort by env', async function () {
    const webInterfacePort = '8888'
    process.env['WEB_INTERFACE_PORT'] = webInterfacePort
    const configuration = new Configuration()
    await configuration.init()
    return expect(configuration.getWebInterfacePort()).to.be.equal(+webInterfacePort)
  })

  it('isSeller should return true', async function () {
    const configuration = new Configuration()
    await configuration.init()
    configuration.setSeller()
    return expect(configuration.isSeller).to.be.true
  })

  it('isSeller should return false', async function () {
    const configuration = new Configuration()
    await configuration.init()
    return expect(configuration.isSeller).to.be.false
  })

  it('isSeller should return true when set ROLE=SELLER', async function () {
    process.env['ROLE'] = 'SELLER'
    const configuration = new Configuration()
    await configuration.init()
    return expect(configuration.isSeller).to.be.true
  })

  it('getPrice should be bigger then zero', async function () {
    const configuration = new Configuration()
    await configuration.init()
    return expect(configuration.price.toNumber()).to.be.above(0)
  })

  it('getDomainName by defult', async function () {
    delete process.env['DOMAIN_NAME']
    const configuration = new Configuration()
    await configuration.init()
    return expect(configuration.getDomainName()).to.be.equal('onder.io')
  })

  it('getDomainName by env', async function () {
    const domainName = 'generator.io'
    process.env['DOMAIN_NAME'] = domainName
    const configuration = new Configuration()
    await configuration.init()
    return expect(configuration.getDomainName()).to.be.equal(domainName)
  })

  describe('getMeterConfigurations`', async function () {

    it('Check load meterConfigurations by default', async function () {
      process.env['ACCOUNT'] = 'account'
      process.env['INSTANCE'] = 'COUNTER'
      const configuration = new Configuration()
      await configuration.init()
      expect(configuration.meterConfiguration.length).to.be.equal(1)
      expect(configuration.meterConfiguration[0].kind).to.be.equal(ConnectionKind.Zero)
    })

    it('Check load meterConfigurations from test.meter.yml', async function () {
      process.env['ACCOUNT'] = undefined
      process.env['INSTANCE'] = 'COUNTER'
      process.env['COUNTER_CONFIG_PATH'] = __dirname + '/test.meter.yml'
      const configuration = new Configuration()
      await configuration.init()
      const meterConfigs = configuration.meterConfiguration

      const meterZero = meterConfigs.filter((config) => config.kind === ConnectionKind.Zero)
      const meterRandom = meterConfigs.filter((config) => config.kind === ConnectionKind.Random)
      const meterFile = meterConfigs.filter((config): config is IMeterConfigurationFile => config.kind === ConnectionKind.File)
      const meterEnergomera = meterConfigs.filter((config): config is IMeterConfigurationEnergomera => config.kind === ConnectionKind.Energomera)
      // FIXME ONDER ALPHA
      // const meterOnderAlphaChild = meterConfigs.filter((config): config is IMeterConfigurationOnderAlphaChild => config.kind === ConnectionKind.OnderAlphaChild)

      expect(meterZero.length).to.be.equal(2)
      expect(meterFile.length).to.be.equal(1)
      expect(meterRandom.length).to.be.equal(2)
      expect(meterEnergomera.length).to.be.equal(1)
      // FIXME ONDER ALPHA
      // expect(meterOnderAlphaChild.length).to.be.equal(10)

      meterFile.forEach(config => {
        expect(config.column).to.be.equal('column1')
        expect(config.account).to.be.equal('file1')
        expect(config.path).to.be.equal('./path/data.cvs')
      })

      meterRandom.forEach(config => {
        expect(config.account).to.be.equal('random')
      })

      meterEnergomera.forEach(config => {
        expect(config.account).to.be.equal('energomera1')
        expect(config.port).to.be.equal('/dev/ttyUSB0')
      })

      // FIXME ONDER ALPHA
      // meterOnderAlphaChild.forEach(config => {
      //   expect(config.account).to.be.not.equal(undefined)
      //   expect(config.port).to.be.equal('/dev/ttyAMA0')
      // })

    })

  })

})
