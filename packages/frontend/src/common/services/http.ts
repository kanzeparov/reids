import Axios, { AxiosInstance } from 'axios'
const config = require('../../config.json')

export interface IHeaders {
  [key: string]: string
}

export default class Http {
  private readonly developMode: boolean = process.env.NODE_ENV === 'development'
  private readonly http: AxiosInstance
  constructor (headers: IHeaders = {}) {
    this.http = Axios.create({
      baseURL: this.developMode ? config.baseUrl.dev : config.baseUrl.prod,
      timeout: 5000,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        ...headers
      }
    })
  }
  public request = async (method: string, url: string, params = {}, headers: IHeaders = {}) => {
    try {
      const { data } = await this.http.request({
        method,
        url,
        headers: {
          ...headers
        },
        data: {
          ...params
        }
      })
      return data
    } catch (e) {
      return undefined
    }
  }
}
