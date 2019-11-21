import { Endpoint } from './Endpoint'
import { ApiEndpoint } from './ApiEndpoint'
import { IPricingProgram } from './IPricingProgram'
import { BigNumber } from 'bignumber.js'
import { PricingProgramContainer } from './PricingProgramContainer'
import { ProgramController } from './ProgramController'
import { ConstantPriceProgram } from './programs/constant_price'
import { PeakBalancingProgram } from './programs/peak_balancing'
import { ProgramService } from './ProgramService'
import { WebsocketServer } from './WebsocketServer'
import { WebsocketRPC } from './WebsocketRPC'

const HOST = 'localhost'
const PORT = 1234
const APIHOST = 'localhost'
const APIPORT = 8090
const pricingProgramContainer = new PricingProgramContainer()
  .append(ConstantPriceProgram)
  .append(PeakBalancingProgram)

class FakeProgram implements IPricingProgram {
  async currentPrice (): Promise<BigNumber> {
    return new BigNumber(0)
  }
}

describe('#build', () => {
  test('return stopped', async () => {
    const priceSource = new FakeProgram()
    const pathToConfig = 'config.json'
    const result = Endpoint.build(HOST, PORT, APIHOST, APIPORT, pathToConfig, priceSource, pricingProgramContainer)
    expect(result.priceSource).toBe(priceSource)
    expect(result.state).toBe(Endpoint.State.STOPPED)
    expect(result.rpc).toBeInstanceOf(WebsocketRPC)
    expect(result.rpc.server).toBeInstanceOf(WebsocketServer)
    expect(result.rpc.server.host).toBe(HOST)
    expect(result.rpc.server.port).toBe(PORT)
  })
})

describe('#start', () => {
  test('started', async () => {
    const priceSource = new FakeProgram()
    const server = new WebsocketServer(HOST, PORT)
    const rpc = new WebsocketRPC(server, priceSource)
    const pathToConfig = 'config.json'
    const pluginService = new ProgramService(pathToConfig, pricingProgramContainer)
    const pluginController = new ProgramController(pluginService)
    const api = new ApiEndpoint(APIHOST, APIPORT, pluginController)
    const endpoint: Endpoint.Started = {
      state: Endpoint.State.STARTED,
      priceSource: priceSource,
      rpc: rpc,
      api: api
    }
    const result = await Endpoint.start(endpoint)
    expect(result).toBe(endpoint)
  })

  test('stopped', async () => {
    const server = new WebsocketServer(HOST, PORT)
    const priceSource = new FakeProgram()
    const rpc = new WebsocketRPC(server, priceSource)
    const pathToConfig = 'config.json'
    const pluginService = new ProgramService(pathToConfig, pricingProgramContainer)
    const pluginController = new ProgramController(pluginService)
    const api = new ApiEndpoint(APIHOST, APIPORT, pluginController)
    const endpoint: Endpoint.Stopped = {
      state: Endpoint.State.STOPPED,
      priceSource: priceSource,
      rpc: rpc,
      api: api
    }
    const startSpy = jest.spyOn(server, 'start')
    const result = await Endpoint.start(endpoint)
    expect(result.state).toBe(Endpoint.State.STARTED)
    expect(startSpy).toBeCalled()
  })
})

describe('#stop', () => {
  test('stopped', async () => {
    const server = new WebsocketServer(HOST, PORT)
    const priceSource = new FakeProgram()
    const rpc = new WebsocketRPC(server, priceSource)
    const pathToConfig = 'config.json'
    const pluginService = new ProgramService(pathToConfig, pricingProgramContainer)
    const pluginController = new ProgramController(pluginService)
    const api = new ApiEndpoint(APIHOST, APIPORT, pluginController)
    const endpoint: Endpoint.Stopped = {
      state: Endpoint.State.STOPPED,
      priceSource: priceSource,
      rpc: rpc,
      api: api
    }
    const result = await Endpoint.stop(endpoint)
    expect(result).toBe(endpoint)
  })

  test('started', async () => {
    const server = new WebsocketServer(HOST, PORT)
    const priceSource = new FakeProgram()
    const rpc = new WebsocketRPC(server, priceSource)
    const pathToConfig = 'config.json'
    const pluginService = new ProgramService(pathToConfig, pricingProgramContainer)
    const pluginController = new ProgramController(pluginService)
    const api = new ApiEndpoint(APIHOST, APIPORT, pluginController)
    const endpoint: Endpoint.Started = {
      state: Endpoint.State.STARTED,
      priceSource: priceSource,
      rpc: rpc,
      api
    }
    const rpcStopSpy = jest.spyOn(rpc, 'stop')
    const result = await Endpoint.stop(endpoint)
    expect(result.state).toBe(Endpoint.State.STOPPED)
    expect(rpcStopSpy).toBeCalledTimes(1)
  })
})
