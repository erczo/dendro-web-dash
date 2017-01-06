'use strict';

/**
 * Web dashboard Express server.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module server/main
 */

const path = require('path');
const express = require('express');

const app = express();

// TODO: Replace logger with winston
const log = console;

// Configure
const config = require('config');

// Express basics
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'pug');

if (config.webpack) {
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpack = require('webpack');
  const webpackConfig = require('../../config/webpack.config.js');
  const compiler = webpack(webpackConfig);

  app.use(webpackDevMiddleware(compiler, {
    hot: true,
    filename: webpackConfig.output.filename,
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true
    },
    historyApiFallback: true
  }));

  app.use(webpackHotMiddleware(compiler, {
    log: log.info,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000
  }));
} else {
  app.use(express.static(path.resolve(__dirname, '../../dist/public')));
}

// Route requests
app.get('/', (req, res) => res.render('index', {
  config: JSON.stringify(config.client)
}));

const server = app.listen(config.port, config.host, () => {
  const host = server.address().address;
  const port = server.address().port;

  log.info('Express server listening at http://%s:%s', host, port);
});