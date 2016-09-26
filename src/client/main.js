/**
 * Web dashboard client entry point.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module client/main
 */

import 'bootstrap/css/bootstrap.css'
import 'bootstrap/js/bootstrap.js'

import Vue from 'vue'
import App from './components/App'

/* eslint-disable no-new */
new Vue({
  el: 'body',
  components: { App }
})
