import { ConstantPriceProgram } from './ConstantPriceProgram'
import { BigNumber } from 'bignumber.js'

describe('constructor', () => {
  test('set price', async () => {
    const price = '13'
    const program = new ConstantPriceProgram({ price })
    expect(program.price).toEqual(new BigNumber(price))
  })
})

describe('#currentPrice', () => {
  test('return price', async () => {
    const price = '77'
    const program = new ConstantPriceProgram({ price })
    const currentPrice = await program.currentPrice()
    expect(currentPrice).toEqual(new BigNumber(price))
  })
})
