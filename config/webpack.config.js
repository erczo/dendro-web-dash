const path = require('path')
const file = path.resolve(__dirname, `webpack.${process.env.NODE_ENV || 'development'}.config`)

console.log('Using webpack config %s', file)
module.exports = require(file)
