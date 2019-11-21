import * as JsonRPC from 'json-rpc-ws'
import { WebsocketServer } from './WebsocketServer'

describe('constructor', () => {
  test('jsonrpcws server by default', () => {
    const rpc = new WebsocketServer('host', 4242)
    expect(rpc.host).toBe('host')
    expect(rpc.port).toBe(4242)
    expect(rpc.server).toBeInstanceOf(JsonRPC.Server)
  })
})

test('expose', () => {
  const expose = jest.fn()
  jest.spyOn(JsonRPC, 'createServer').mockImplementation(() => {
    return { expose }
  })
  const rpc = new WebsocketServer('host', 4242)
  const handler = jest.fn()
  rpc.expose('method', handler)
  expect(expose).toBeCalledWith('method', handler)
})

test('start', async () => {
  const start = jest.fn((opts, callback) => {
    callback()
  })
  jest.spyOn(JsonRPC, 'createServer').mockImplementation(() => {
    return { start }
  })
  const rpc = new WebsocketServer('host', 4242)
  await rpc.start()
  expect(start).toBeCalled()
})

test('stop', async () => {
  const stop = jest.fn()
  jest.spyOn(JsonRPC, 'createServer').mockImplementation(() => {
    return {
      server: {},
      stop: stop
    }
  })
  const rpc = new WebsocketServer('host', 4242)
  await rpc.stop()
  expect(stop).toBeCalled()
})
