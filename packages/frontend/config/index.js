"use strict";
const path = require('path');

module.exports = {
  dev: {
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {},
    host: 'localhost',
    port: process.env.WEBPACK_DEV_SERVER_PORT || 8080,
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false,
    useEslint: true,
    showEslintErrorsInOverlay: false,
    devtool: 'cheap-module-eval-source-map',
    cacheBusting: true,
    cssSourceMap: true,
  },

  build: {
    index: {
      hardware: path.resolve(__dirname, '../hardware/index.html'),
      consumer: path.resolve(__dirname, '../consumer/index.html'),
      operator: path.resolve(__dirname, '../operator/index.html'),
    },
    assetsRoot: {
      hardware: path.resolve(__dirname, '../hardware'),
      consumer: path.resolve(__dirname, '../consumer'),
      operator: path.resolve(__dirname, '../operator'),
    },
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: true,
    devtool: '#source-map',
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    bundleAnalyzerReport: process.env.npm_config_report,
  },
};
