import { WebsocketServer } from './WebsocketServer'
import { WebsocketRPC } from './WebsocketRPC'
import { IPriceSource } from './IPriceSource'
import { BigNumber } from 'bignumber.js'

describe('constructor', () => {
  test('set server and priceSource', () => {
    const server = jest.fn<WebsocketServer>(() => {
      return {
        expose: jest.fn()
      }
    })()
    const priceSource = jest.fn<IPriceSource>()()
    const rpc = new WebsocketRPC(server, priceSource)
    expect(rpc.server).toBe(server)
    expect(rpc.priceSource).toBe(priceSource)
  })

  test('set server and priceSource', () => {
    const exposeFunction = jest.fn()
    const server = jest.fn<WebsocketServer>(() => {
      return {
        expose: exposeFunction
      }
    })()
    const priceSource = jest.fn<IPriceSource>()()
    const rpc = new WebsocketRPC(server, priceSource)
    expect(exposeFunction).toBeCalledWith('getPrice', rpc.handleGetPrice)
  })
})

describe('#handleGetPrice', () => {
  test('reply with price', async () => {
    const CURRENT_PRICE = new BigNumber(42)
    const server = jest.fn<WebsocketServer>(() => {
      return {
        expose: jest.fn()
      }
    })()
    const currentPrice = jest.fn(async () => {
      return CURRENT_PRICE
    })
    const priceSource = jest.fn<IPriceSource>(() => {
      return {
        currentPrice
      }
    })()
    const rpc = new WebsocketRPC(server, priceSource)
    const reply = jest.fn()
    await rpc.handleGetPrice([], reply)
    expect(reply).toBeCalledWith(null, [CURRENT_PRICE.toString()])
  })
})
