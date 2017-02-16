<template>
  <div id="app">
    <header>
      <nav class="navbar navbar-inverse fixed-top">
        <div class="container">

          <!-- TODO: Remove this -->
          <!-- Reserve Name -->
          <!-- <a class="navbar-brand" href="http://www.blueoakranchreserve.org/" target="_blank"><span class="hidden-sm-down">Blue Oak Ranch Reserve </span><i class="fa fa-external-link" aria-hidden="true"></i></a> -->

          <a class="navbar-brand" href="/">
            <!-- TODO: We need a logo! -->
            <i class="fa fa-sun-o" aria-hidden="true"></i> <span class="hidden-sm-down">Dendro</span>
          </a>

          <!-- Nav Toolbar -->
          <div class="btn-toolbar float-right" role="toolbar" aria-label="Navigation toolbar">

            <!-- Alert Badge -->
            <!-- TODO: Finish this - alerts and notifications -->
<!--
            <div class="btn-group mr-1" role="group" aria-hidden="true">
              <button type="button" class="btn btn-outline-secondary border-0 text-white">
                <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                <span class="badge badge-pill badge-danger" style="vertical-align: top">5</span>
              </button>
            </div>
 -->
            <!-- Units Dropdown -->
            <div class="btn-group" role="group" aria-label="Units dropdown">
              <button id="unitsNavButton" type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="hidden-sm-down">Units: </span>
                  <span v-if="units === 'imp'">English</span>
                  <span v-if="units === 'met'">Metric</span>
                </span>
              </button>
              <div class="dropdown-menu">
                <a class="dropdown-item" role="button" @click.prevent="setUnits('imp', 'unitsNavButton')"><i class="fa fa-check" v-bind:class="[units === 'imp' ? '' : 'invisible']" aria-hidden="true"></i> English</a>
                <a class="dropdown-item" role="button" @click.prevent="setUnits('met', 'unitsNavButton')"><i class="fa fa-check" v-bind:class="[units === 'met' ? '' : 'invisible']" aria-hidden="true"></i> Metric</a>
              </div>
            </div>
          </div>

        </div>
      </nav>
    </header>

    <!-- Component matched by the route will render here -->
    <router-view :client-time="clientTime" :is-retina="isRetina" :units="units"></router-view>

    <footer class="bg-faded border-top py-4">
      <div class="container-fluid">
        <div class="row">

          <div class="col-12">
            <div class="text-center">
              <small>Problems viewing this page? Email&nbsp;<a href="mailto:collin@berkeley.edu">collin@berkeley.edu</a></small>
            </div>
          </div>

        </div>
      </div>
    </footer>
  </div>
</template>

<script>
// TODO: Move navbar into a component
// TODO: Update page footer
// TODO: Move localforage config to a module
import localforage from 'localforage'
import $ from 'jquery'

localforage.config({
  name: 'dendroWebDash'
})

export default {
  data () {
    return {
      clientTime: new Date(),
      isRetina: false, // Keepin' it simple; it's either retina or not
      units: null
    }
  },

  created () {
    /*
      Handle photos on HiDPI (High Dots Per Inch) displays; i.e. retina.

      We do this by creating MediaQueryLists to observe changes to pixel density, and the listener sets
      this.isRetina for use in downstream components.
     */

    // Query for WebKit-based browsers, the standard way, and dppx fallback
    this.retinaMql = window.matchMedia('screen and (-webkit-min-device-pixel-ratio: 2), screen and (min-resolution: 2dppx), screen and (min-resolution: 192dpi)')
    // Query for older Firefox browsers (prior to Firefox 16)
    // HACK: Mozilla is weird; needs its own listener for this
    this.retinaMqlMoz = window.matchMedia('screen and (min--moz-device-pixel-ratio: 2)')
    this.retinaMqlListener = e => {
      this.isRetina = e.matches
    }

    this.isRetina = this.retinaMql.matches || this.retinaMqlMoz.matches
    this.retinaMql.addListener(this.retinaMqlListener)
    this.retinaMqlMoz.addListener(this.retinaMqlListener)

    // Handle HMR so we can debug
    // SEE: https://webpack.github.io/docs/hot-module-replacement.html
    if (module.hot) {
      module.hot.dispose(() => {
        this.retinaMql.removeListener(this.retinaMqlListener)
        this.retinaMqlMoz.removeListener(this.retinaMqlListener)
      })
    }

    /*
      Obtain our initial preferences from local storage.
     */
    localforage.getItem('units', (err, value) => {
      if (!err && typeof value === 'string') {
        this.units = value
      } else {
        this.units = 'met' // Default
      }
    })

    /*
      Maintain a single reactive source of time updated approximately every minute. Strive for parity with the
      user's system clock.
     */
    setInterval(() => {
      const now = new Date()
      const minutes = Math.floor(now.getTime() / 60000)
      if (this.minutes === minutes) return

      this.minutes = minutes
      this.clientTime = now
    }, 17000)
  },

  methods: {
    setUnits (units, toggleId) {
      this.units = units
      if (toggleId) {
        let el = $(`#${toggleId}`)
        if (el.parent().hasClass('show')) el.dropdown('toggle')
      }
    }
  },

  watch: {
    units: function (newUnits) {
      localforage.setItem('units', newUnits)
    }
  }
}
</script>

<style>
body {
  background-color: #fff;
  padding-top: 55px;
}

header .navbar {
  background-color: rgba(80, 139, 191, 0.96);
  border-bottom: 1px solid rgb(80, 139, 191)
}

.bg-darken { background-color: rgba(0, 0, 0, 0.1); }
.bg-lighten { background-color: rgba(255, 255, 255, 0.1); }

.border-bottom { border-bottom: 1px solid #f1f1f1; }
.border-top { border-top: 1px solid #f1f1f1; }

.flex-1 { flex: 1 0 auto; }
.flex-2 { flex: 2 0 auto; }
.flex-3 { flex: 3 0 auto; }
.flex-4 { flex: 4 0 auto; }

.img-darken {
  filter: brightness(.7);
  -webkit-filter: brightness(.7);
}

.not-implemented {
  opacity: 0.3;
}

.photo-thumb { width: 60px; height: 60px; }
.photo-small { width: 240px; height: 240px; }
.photo-medium { width: 480px; height: 480px; }
.photo-large { width: 1080px; height: 1080px; }

.text-inverse { color: #fff;   }
.text-thin { font-weight: 300; }

.tile {
  overflow: hidden;
}
.tile table {
  margin-bottom: 0;
}
.tile .border-bottom {
  border-bottom: 1px solid #eceeef;
}
.tile .border-top {
  border-top: 1px solid #eceeef;
}
.tile .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}
</style>
