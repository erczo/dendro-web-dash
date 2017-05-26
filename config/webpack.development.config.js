const path = require('path')
const webpack = require('webpack')
const clientRoot = path.resolve(__dirname, '../src/client')
const nodeModules = path.resolve(__dirname, '../node_modules')
const fontAwesome = path.join(nodeModules, 'font-awesome')
const webModules = path.resolve(__dirname, '../web_modules')
const weatherIcons = path.join(webModules, 'weather-icons')
const bootstrap = path.join(webModules, 'dendro-bootstrap', 'dist')
// const ExtractTextPlugin = require('extract-text-webpack-plugin')

const config = {
  context: clientRoot,
  entry: [
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
    './main.js'
  ],
  output: {
    path: path.resolve(__dirname, '../dist/public/client'),
    publicPath: '/client/',
    filename: '[name].js'
  },
  resolve: {
    alias: {
      bootstrap: bootstrap,
      jquery: 'jquery/src/jquery',
      tether: 'tether/dist/js/tether',
      'weather-icons': weatherIcons
    },
    extensions: ['.js', '.vue']
  },
  module: {
    noParse: /node_modules\/localforage\/dist\/localforage.js/,
    rules: [
      {
        test: /\.vue$/,
        enforce: 'pre',
        loader: 'eslint-loader',
        include: clientRoot
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'eslint-loader',
        include: clientRoot
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: clientRoot
        // NOTE: Vue loader doesn't respect the presets here, so we must resort to .babelrc
        // query: {
        //   presets: ['es2015'],
        //   // The 'transform-runtime' plugin tells babel to require the runtime
        //   // instead of inlining it
        //   plugins: ['transform-runtime']
        // }
      },
      // Embed stylesheets into a webpack javascript bundle
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(gif|jpe?g|png|svg)(\?.*)?$/,
        loader: 'url-loader',
        include: [clientRoot, fontAwesome, weatherIcons],
        query: {
          limit: 10000,
          name: 'assets/images/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(eot|ttf|woff(2)?)(\?.*)?$/,
        loader: 'url-loader',
        include: [clientRoot, fontAwesome, weatherIcons],
        query: {
          limit: 10000,
          name: 'assets/fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        eslint: {
          formatter: require('eslint-friendly-formatter')
        }
      }
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      Tether: 'tether',
      'window.jQuery': 'jquery',
      'window.Tether': 'tether'
    })
    // new ExtractTextPlugin('assets/styles/[name].[contenthash].css')
  ]
  // eslint: {
  //   formatter: require('eslint-friendly-formatter')
  // }
}

module.exports = config
