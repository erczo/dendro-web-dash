/**
 * Feathers services; configured and ready to roll.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/utils
 */

import feathers from 'feathers/client'
import socketio from 'feathers-socketio/client'
import hooks from 'feathers-hooks'
import io from 'socket.io-client'

const config = window.CLIENT_CONFIG
const socket = io(config.io.uri, config.io.options)
const app = feathers()
  .configure(hooks())
  .configure(socketio(socket))

export default {
  datapointLookup: app.service('/datapoints/lookup'),
  datastream: app.service('/datastreams'),
  organization: app.service('/organizations'),
  person: app.service('/persons'),
  station: app.service('/stations'),
  systemTime: app.service('/system/time'),
  vocabulary: app.service('/vocabularies')
}
