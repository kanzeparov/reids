import { PeakBalancingProgram } from './PeakBalancingProgram'
import { Periods } from './Periods'
import { HttpSource } from './HttpSource'
import { BigNumber } from 'bignumber.js'
import * as moment from 'moment'

const ARGS = {
  consumptionListenerPort: 1234,
  Wmax: '10',
  baseCost: '10',
  minCost: '10',
  maxCost: '56',
  peakTime: [
    {
      from: '18:00',
      to: '23:00'
    }, {
      from: '07:00',
      to: '13:00'
    }
  ],
  semiPeakTime: [
    {
      from: '13:00',
      to: '18:00'
    }
  ],
  nightTime: [
    {
      from: '00:00',
      to: '07:00'
    },
    {
      from: '23:00',
      to: '00:00'
    }
  ],
  source: {
    http: 'http://example.com'
  }
}

function timestamp (hh: number, mm: number) {
  return moment().utc().hour(hh).minute(mm).second(0).millisecond(0)
}

describe('constructor', () => {
  test('set properties', () => {
    const program = new PeakBalancingProgram(ARGS)
    expect(program.periods).toEqual(new Periods(ARGS.peakTime, ARGS.semiPeakTime, ARGS.nightTime))
    expect(program.source).toBeInstanceOf(HttpSource)
    expect(program.source.address).toBe(ARGS.source.http)
    expect(program.minCost).toEqual(new BigNumber(ARGS.minCost))
    expect(program.maxCost).toEqual(new BigNumber(ARGS.maxCost))
    expect(program.Wmax).toEqual(new BigNumber(ARGS.Wmax))
    expect(program.basePrice).toEqual(new BigNumber(ARGS.baseCost))
  })
})

describe('#offPeakPrice', () => {
  test('equal to base price', async () => {
    const program = new PeakBalancingProgram(ARGS)
    const price = await program.offPeakPrice()
    expect(price).toEqual(program.basePrice)
  })
})

describe('#midPeakPrice', () => {
  test('according to calculation', async () => {
    const program = new PeakBalancingProgram(ARGS)
    program.averageConsumption = jest.fn(async () => new BigNumber(10))
    const price = await program.midPeakPrice()
    expect(price).toEqual(new BigNumber(20))
  })

  test('base price if no average consumption', async () => {
    const program = new PeakBalancingProgram(ARGS)
    program.averageConsumption = jest.fn(() => {
      throw new Error('Not Available')
    })
    const price = await program.midPeakPrice()
    expect(price).toEqual(program.basePrice)
  })
})

describe('#peakPrice', () => {
  test('according to calculation', async () => {
    const program = new PeakBalancingProgram(ARGS)
    program.averageConsumption = jest.fn(async () => new BigNumber(10))
    const price = await program.peakPrice()
    expect(price).toEqual(new BigNumber(40))
  })

  test('base price if no average consumption', async () => {
    const program = new PeakBalancingProgram(ARGS)
    program.averageConsumption = jest.fn(() => {
      throw new Error('Not Available')
    })
    const price = await program.peakPrice()
    expect(price).toEqual(program.basePrice)
  })
})

describe('#clearPrice', () => {
  test('on peak', async () => {
    const program = new PeakBalancingProgram(ARGS)
    const expectedPrice = new BigNumber(10)
    program.peakPrice = jest.fn(() => Promise.resolve(expectedPrice))
    const clearPrice = await program.clearPrice(timestamp(19, 0).toDate())
    expect(clearPrice).toEqual(expectedPrice)
    expect(program.peakPrice).toBeCalled()
  })
  test('on mid-peak', async () => {
    const program = new PeakBalancingProgram(ARGS)
    const expectedPrice = new BigNumber(10)
    program.midPeakPrice = jest.fn(() => Promise.resolve(expectedPrice))
    const clearPrice = await program.clearPrice(timestamp(14, 0).toDate())
    expect(clearPrice).toEqual(expectedPrice)
    expect(program.midPeakPrice).toBeCalled()
  })
  test('off peak', async () => {
    const program = new PeakBalancingProgram(ARGS)
    const expectedPrice = new BigNumber(10)
    program.offPeakPrice = jest.fn(() => Promise.resolve(expectedPrice))
    const clearPrice = await program.clearPrice(timestamp(1, 0).toDate())
    expect(clearPrice).toEqual(expectedPrice)
    expect(program.offPeakPrice).toBeCalled()
  })
})

describe('#keepPriceInMinMaxRange', () => {
  const program = new PeakBalancingProgram(ARGS)
  const min = program.minCost
  const max = program.maxCost

  test('max price if current gt max', async () => {
    const input = max.plus(1)
    const result = await program.keepPriceInMinMaxRange(input)
    expect(result).toEqual(max)
  })

  test('min price if current lt min', async () => {
    const input = min.minus(1)
    const result = await program.keepPriceInMinMaxRange(input)
    expect(result).toEqual(min)
  })

  test('price if in range', async () => {
    const input = min.plus(1)
    expect(input.lt(max)).toBeTruthy()
    const result = await program.keepPriceInMinMaxRange(input)
    expect(result).toEqual(input)
  })
})

describe('#currentPrice', () => {
  test('get clear price', async () => {
    const program = new PeakBalancingProgram(ARGS)
    const clearPrice = new BigNumber(20)
    program.clearPrice = jest.fn(() => Promise.resolve(clearPrice))
    const inrangeSpy = jest.spyOn(program, 'keepPriceInMinMaxRange')
    const currentPrice = await program.currentPrice()
    expect(currentPrice).toEqual(clearPrice)
    expect(program.clearPrice).toBeCalled()
    expect(inrangeSpy).toBeCalled()
  })
})

describe('#averageConsumption', () => {
  test('gets from http', async () => {
    const program = new PeakBalancingProgram(ARGS)
    const DATA = [
      { time: Date.now() - (10 * 1000), value: new BigNumber('10') },
      { time: Date.now(), value: new BigNumber('30') }
    ]
    const responseSpy = jest.spyOn(program.source, 'consumption').mockImplementation(() => {
      return DATA
    })
    const result = await program.averageConsumption()
    expect(result).toEqual(new BigNumber(20))
    expect(responseSpy).toBeCalled()
  })
})
