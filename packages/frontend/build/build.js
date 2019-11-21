'use strict';
require('./check-versions')();

process.env.NODE_ENV = 'production';
process.env.build_env = process.env.BUILD_ENV ? process.env.BUILD_ENV : 'hardware';
process.env.npm_config_platform = process.env.npm_config_platform ? process.env.npm_config_platform : '';
process.env.npm_config_environment = process.env.npm_config_environment ? process.env.npm_config_environment : 'production';

const ora = require('ora');
const rm = require('rimraf');
const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const config = require('../config');
const webpackConfig = require('./webpack.prod.conf');

const spinner = ora('building ' + process.env.build_env + ' for production...');

const packageJson = require('../package.json');
const archiver = require('archiver');
const fs = require('fs');
const format = require('date-fns/format');

spinner.start();

const build = () => {
  rm(path.join(config.build.assetsRoot[process.env.build_env], process.env.npm_config_platform), (err) => {
    if (err) throw err;
    webpack(webpackConfig, (err, stats) => {
      spinner.stop();
      if (err) throw err;
      process.stdout.write(`${stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
      })}\n\n`);

      if (stats.hasErrors()) {
        console.log(chalk.red('  Build failed with errors.\n'));
        process.exit(1);
      }

      console.log(chalk.cyan('  Build complete.\n'));
      console.log(chalk.yellow(
        '  Tip: built files are meant to be served over an HTTP server.\n' +
        '  Opening index.html over file:// won\'t work.\n',
      ));
    });
  });
};

build();
