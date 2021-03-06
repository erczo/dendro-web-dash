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
import 'velocity-animate'

import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App'

import Download from './components/Download'
import Home from './components/Home'
import StartDownload from './components/StartDownload'
import Station from './components/Station'

/*
  Register global filters.
 */

Vue.filter('placeholder', (value, text = '-') => {
  // TODO: This should handle a variety of cases
  return (typeof value === 'undefined') || (value === null) ? text : value
})

Vue.filter('pluralize', (value, ...args) => {
  return args.length > 1 ? (args[value % 10 - 1] || args[args.length - 1]) : (args[0] + (value === 1 ? '' : 's'))
})

// TODO: Remove this - deprecated
// Vue.filter('round', (value, digits, keep) => {
//   if (typeof value !== 'number') return value
//   var fixed = value.toFixed(digits)
//   return keep ? fixed : +fixed
// })

/*
  Configure routes.
 */

Vue.use(VueRouter)
const router = new VueRouter({
  // TODO: Enable history mode
  // SEE: https://router.vuejs.org/en/essentials/history-mode.html
  // SEE: https://router.vuejs.org/en/advanced/scroll-behavior.html
  // mode: 'history',
  routes: [
    {path: '/download', name: 'download', component: Download},
    {path: '/download/start', name: 'startDownload', component: StartDownload},
    {path: '/stations/:slug', name: 'station', component: Station},
    {path: '/:slug', redirect: '/stations/:slug'},
    {path: '/', name: 'home', component: Home},
    {path: '*', redirect: '/'}
  ]
})

/* eslint-disable no-new */
new Vue({
  router,

  // SEE: http://vuejs.org/guide/render-function#createElement-Arguments
  render: createElement => createElement(App),

  filters: {
    placeholder (value) {
      return value === void (0) ? '-' : value
    }
  }
}).$mount('#app')
