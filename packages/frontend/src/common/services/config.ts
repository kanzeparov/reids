const config = require('../../config.json')

export default {
  baseURL: process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.prod,
  apiVersion: config.apiVersion
}
