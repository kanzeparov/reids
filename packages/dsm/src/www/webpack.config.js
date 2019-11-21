const path = require('path');
const webpack = require('webpack');

const DSM_URL = process.env.DSM_URL

module.exports = {
  mode: 'development',
  context: path.join(__dirname, 'components'),
  entry: {
    main: './main.tsx'
  },
  output: {
    path: path.join(__dirname, './'),
    filename: '[name].bundle.js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  module: {
    rules: [
      {test: /\.tsx?$/, loader: "awesome-typescript-loader"},
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {enforce: "pre", test: /\.js$/, loader: "source-map-loader"}
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.DSM_URL': `"${DSM_URL}"`
    }),
  ]
}

