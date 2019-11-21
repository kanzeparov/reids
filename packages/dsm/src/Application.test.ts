import { Application } from './Application'
import { Endpoint } from './Endpoint'
import { ConstantPriceProgram } from './programs/constant_price'
import { IPricingProgram } from './IPricingProgram'

const SETTINGS = {
  host: 'localhost',
  port: 8080,
  apiHost: 'localhost',
  apiPort: 8090,
  plugin: 'constant-price',
  pluginOptions: {
    price: '42'
  },
  pluginDataCheckingRate: 10,
  pathToConfig: 'config.json'
}

describe('build', () => {
  test('return Application instance', async () => {
    const application = Application.build(SETTINGS)
    expect(application.state).toBe(Application.State.STOPPED)
    expect(application.endpoint.state).toEqual(Endpoint.State.STOPPED)
    expect(application.plugin).toBeInstanceOf(ConstantPriceProgram)
  })
})

describe('start', () => {
  test('empty', async () => {
    await expect(Application.start(Application.EMPTY)).rejects.toBeTruthy()
  })

  test('started', async () => {
    const application: Application.Started = {
      state: Application.State.STARTED,
      endpoint: jest.fn<Endpoint>()(),
      plugin: jest.fn<IPricingProgram>()()
    }
    const result = await Application.start(application)
    expect(result).toBe(application)
  })

  test('stopped', async () => {
    const application: Application.Stopped = {
      state: Application.State.STOPPED,
      endpoint: jest.fn<Endpoint>()(),
      plugin: jest.fn<IPricingProgram>()()
    }
    const expectedEndpoint = jest.fn()
    const endpointStartSpy = jest.spyOn(Endpoint, 'start').mockImplementation(async () => {
      return expectedEndpoint
    })
    const result = await Application.start(application)
    expect(endpointStartSpy).toBeCalledWith(application.endpoint)
    expect(result.state).toBe(Application.State.STARTED)
    expect(result.endpoint).toBe(expectedEndpoint)
  })
})

describe('stop', () => {
  test('empty', async () => {
    const application = Application.EMPTY
    const result = await Application.stop(application)
    expect(result).toBe(application)
  })

  test('started', async () => {
    const application: Application.Started = {
      state: Application.State.STARTED,
      endpoint: jest.fn<Endpoint>()(),
      plugin: jest.fn<IPricingProgram>()()
    }
    const expectedEndpoint = jest.fn()
    const endpointStartSpy = jest.spyOn(Endpoint, 'stop').mockImplementation(async () => {
      return expectedEndpoint
    })
    const result = await Application.stop(application)
    expect(result.state).toBe(Application.State.STOPPED)
    const stopped = result as Application.Stopped
    expect(stopped.plugin).toBe(application.plugin)
    expect(stopped.endpoint).toBe(expectedEndpoint)
    expect(endpointStartSpy).toBeCalled()
  })

  test('stopped', async () => {
    const application: Application.Stopped = {
      state: Application.State.STOPPED,
      endpoint: jest.fn<Endpoint>()(),
      plugin: jest.fn<IPricingProgram>()()
    }
    const result = await Application.stop(application)
    expect(result).toBe(application)
  })
})
