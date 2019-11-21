import * as tempy from 'tempy'
import * as fs from 'fs'
import { Settings } from './Settings'

const CONFIG = {
  host: 'localhost',
  port: 8080,
  plugin: 'constant',
  pluginOptions: {},
  pluginDataCheckingRate: 10
}

describe('#parse', () => {
  const CONTENT = JSON.stringify(CONFIG)

  test('parse config file', async () => {
    const settings = Settings.parse(CONTENT, 'config.json')
    expect(settings.host).toBe(CONFIG.host)
    expect(settings.port).toBe(CONFIG.port)
    expect(settings.plugin).toBe(CONFIG.plugin)
    expect(settings.pluginOptions).toEqual(CONFIG.pluginOptions)
    expect(settings.pluginDataCheckingRate).toBe(CONFIG.pluginDataCheckingRate)
  })
})

describe('#build', () => {
  test('read and parse config file', async () => {
    const filename = tempy.file()
    fs.writeFileSync(filename, JSON.stringify(CONFIG))
    const settings$ = Settings.observe(filename)
    const subscription = settings$.subscribe(settings => {
      expect(settings.host).toBe(CONFIG.host)
      expect(settings.port).toBe(CONFIG.port)
      expect(settings.plugin).toBe(CONFIG.plugin)
      expect(settings.pluginOptions).toEqual(CONFIG.pluginOptions)
      expect(settings.pluginDataCheckingRate).toBe(CONFIG.pluginDataCheckingRate)
      subscription.unsubscribe()
    })
  })
})
