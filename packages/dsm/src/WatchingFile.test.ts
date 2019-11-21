import * as tempy from 'tempy'
import * as fs from 'fs'
import { WatchingFile } from './WatchingFile'
import { EventEmitter } from 'events'
import * as path from 'path'
import { Observable } from 'rxjs'

let filename: string
let closeMock: jest.Mock<any>
let watcher: EventEmitter & { close: () => void }
let observer: Observable<string>

beforeEach(() => {
  filename = tempy.file()
  closeMock = jest.fn()
  watcher = new (class Watcher extends EventEmitter {
    close () {
      closeMock()
    }
  })()
  const watch = jest.fn(() => watcher)
  observer = new WatchingFile(filename, watch)
})

describe('constructor', () => {
  test('set ::filename', () => {
    const watcher = new WatchingFile(filename)
    expect(watcher.filename).toBe(filename)
  })

  test('set ::watch to fs.watcher by default', () => {
    const watcher = new WatchingFile(filename)
    expect(watcher.watch).toBe(fs.watch)
  })

  test('set ::watch', () => {
    const mock = jest.fn()
    const watcher = new WatchingFile(filename, mock)
    expect(watcher.watch).toBe(mock)
  })
})

test('emit on first run', () => {
  const nextMock = jest.fn()
  observer.subscribe(nextMock)
  expect(nextMock).toBeCalledTimes(1)
  expect(nextMock).toBeCalledWith(filename)
})

test('emit on file change', () => {
  const nextMock = jest.fn()
  observer.subscribe(nextMock)
  watcher.emit('change', 'event', path.basename(filename)) // Update file
  watcher.emit('change', 'event', path.dirname(filename)) // Update something else
  expect(nextMock).toBeCalledTimes(2) // Invoke just when file updates
  expect(nextMock).toBeCalledWith(filename)
})

test('close subscription on error', () => {
  const nextMock = jest.fn()
  const errorMock = jest.fn()

  const subscription = observer.subscribe(nextMock, errorMock)
  expect(subscription.closed).toBeFalsy()
  watcher.emit('error', new Error('Some fake error'))
  expect(subscription.closed).toBeTruthy()
  expect(nextMock).toBeCalledTimes(1)
  expect(closeMock).toBeCalledTimes(1)
  expect(errorMock).toBeCalledTimes(1)
})

test('complete on close', () => {
  const nextMock = jest.fn()
  const errorMock = jest.fn()
  const completeMock = jest.fn()

  const subscription = observer.subscribe(nextMock, errorMock, completeMock)
  expect(subscription.closed).toBeFalsy()
  watcher.emit('close')
  expect(subscription.closed).toBeTruthy()
  expect(nextMock).toBeCalledTimes(1)
  expect(closeMock).toBeCalledTimes(1)
  expect(errorMock).toBeCalledTimes(0)
  expect(completeMock).toBeCalledTimes(1)
})
