/**
 * Utility class for simple logging that can be configured and disabled.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/logger
 */

const config = window.CLIENT_CONFIG

class Logger {
  constructor (options) {
    this.methods = options.methods
    this.name = options.name
    this.enabled = options.enabled // Must be done after methods is set

    if (options.global) options.global.logger = this
  }

  _nada () {} // Log methods re-routed here when disabled

  get enabled () { return this._enabled }
  set enabled (newEnabled) {
    this._enabled = newEnabled

    Object.keys(this.methods).forEach(key => {
      this[key] = newEnabled ? this.methods[key] : this._nada
    })
  }
}

export default new Logger({
  enabled: config.loggerEnabled,
  global: window,
  methods: {
    error: console.error,
    info: console.info,
    log: console.log,
    time: console.time,
    timeEnd: console.timeEnd,
    warn: console.warn
  },
  name: 'dendroWebDash'
})
