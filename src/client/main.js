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
import VueRouter from 'vue-router'
import App from './App'

import Home from './components/Home'
import Station from './components/Station'

Vue.use(VueRouter)

const router = new VueRouter({
  // TODO: Enable history mode
  // SEE: https://router.vuejs.org/en/essentials/history-mode.html
  // SEE: https://router.vuejs.org/en/advanced/scroll-behavior.html
  // mode: 'history',
  routes: [
    {path: '/', component: Home},
    {path: '/stations/:slug', component: Station}
    // TODO: Enable NotFound page
    // {path: '*', component: NotFound}
  ]
})

/* eslint-disable no-new */
new Vue({
  router,
  // SEE: http://vuejs.org/guide/render-function#createElement-Arguments
  render: createElement => createElement(App)
}).$mount('#app')
