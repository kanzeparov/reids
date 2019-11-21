import { IPricingProgram } from './IPricingProgram'
import { BigNumber } from 'bignumber.js'
import { PricingProgramContainer } from './PricingProgramContainer'

class FakeProgram implements IPricingProgram {
  async currentPrice (): Promise<BigNumber> {
    return new BigNumber(0)
  }
}

describe('#append', () => {
  test('add to container', () => {
    const container = new PricingProgramContainer()
    const result = container.append(FakeProgram)
    expect(result).toBeInstanceOf(PricingProgramContainer)
    expect(result).toBe(container)
    expect(container.get('fake')).toBe(FakeProgram)
  })
})

describe('#build', () => {
  test('returns initialised program', () => {
    const container = new PricingProgramContainer()
    container.append(FakeProgram)
    const result = container.build('fake', undefined)
    expect(result).toBeInstanceOf(FakeProgram)
  })

  test('throw if not found', () => {
    const container = new PricingProgramContainer()
    expect(() => {
      container.build('fake', undefined)
    }).toThrow()
  })
})
