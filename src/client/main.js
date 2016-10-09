/**
 * Web dashboard client entry point.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module client/main
 */

import 'bootstrap/css/bootstrap.css'
import 'bootstrap/js/bootstrap.js'
import 'font-awesome/css/font-awesome.css'
import 'weather-icons/css/weather-icons.min.css'
import 'weather-icons/css/weather-icons-wind.min.css'

import Vue from 'vue'
import App from './App'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  // SEE: http://vuejs.org/guide/render-function#createElement-Arguments
  render: createElement => createElement(App)
})
