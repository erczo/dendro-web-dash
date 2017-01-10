import feathers from 'feathers/client'
import socketio from 'feathers-socketio/client'
import hooks from 'feathers-hooks'
import io from 'socket.io-client'

const config = window.CLIENT_CONFIG
const socket = io(config.io.uri, config.io.options)
const app = feathers()
  .configure(hooks())
  .configure(socketio(socket))

// TODO: Remove this!
console.log('SERVICES', Date.now())

export default {
  datastream: app.service('/datastreams'),
  station: app.service('/stations')
}
