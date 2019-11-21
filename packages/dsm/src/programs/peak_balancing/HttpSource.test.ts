import { HttpSource } from './HttpSource'
import axios from 'axios'
import { BigNumber } from 'bignumber.js'

describe('constructor', () => {
  test('set address', async () => {
    const address = 'http://example.com'
    const program = new HttpSource(address)
    expect(program.address).toBe(address)
  })
})

describe('#consumption', () => {
  test('return consumption data from API', async () => {
    const DATA = [
      { time: 1543676225, value: '52.235' },
      { time: 1543676825, value: '38.422' }
    ]
    const getSpy = jest.spyOn(axios, 'get').mockImplementation(() => {
      return {
        data: DATA
      }
    })
    const address = 'http://example.com'
    const program = new HttpSource(address)
    const result = await program.consumption()
    result.forEach((element, index) => {
      expect(element.time).toEqual(DATA[index].time)
      expect(element.value).toEqual(new BigNumber(DATA[index].value))
    })
    expect(getSpy).toBeCalled()
    getSpy.mockRestore()
  })
})
