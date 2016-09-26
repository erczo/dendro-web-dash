const path = require('path')

module.exports = (app) => {
  let file = process.env.WEB_DASH_CONFIG_FILE || path.resolve(__dirname, app.get('env'))

  console.log('Using server config %s', file)
  return require(file)
}
