import { Request } from 'express'

export interface WifiConfig {
  ssid: string
  password: string
  encryption: string
}

export const mapWifiConfig = (req: Request): WifiConfig => {
  let ssid
  let password
  let encryption

  try {
    const body = req.body
    ssid = body.ssid
    password = body.password
    encryption = body.encryption
  } catch (e) {
    throw new Error('Invalid format')
  }
  return { ssid, password, encryption }
}

export default {
  mapWifiConfig
}
