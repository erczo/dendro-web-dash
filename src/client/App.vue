<template>
  <div id="app">
    <header class="fixed-top">
      <nav class="navbar navbar-toggleable-md navbar-inverse" style="position: relative;">

        <a class="navbar-brand hidden-md-down" :href="orgNavbarHref">
          {{ orgTitle }}
        </a>

        <!-- Collapsible Nav Items -->
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarToggler">
          <ul class="navbar-nav text-uppercase">
            <li class="nav-item" :class="$route.name === 'home' ? 'active' : ''">
              <router-link class="nav-link" :to="{name: 'home'}"><i class="fa fa-fw fa-map-marker" aria-hidden="true"></i> Stations</router-link>
            </li>
            <li class="nav-item" :class="$route.name === 'download' ? 'active' : ''" v-if="downloadState.fields && downloadState.fields.length > 0">
              <router-link class="nav-link" :to="{name: 'download'}"><i class="fa fa-fw fa-arrow-circle-down" aria-hidden="true"></i> Download</router-link>
            </li>
          </ul>
        </div>

        <!-- Nav Toolbar Buttons -->
        <div class="btn-toolbar" role="toolbar" aria-label="Navigation toolbar" style="position: absolute; right: 1rem; top: 0.5rem;">

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
          <div class="btn-group" role="group" aria-label="Units dropdown" v-if="showsUnits">
            <button id="unitsNavButton" type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span class="hidden-sm-down">Units: </span>
                <span v-if="units === 'imp'">English</span>
                <span v-if="units === 'met'">Metric</span>
              </span>
            </button>
            <div class="dropdown-menu">
              <a class="dropdown-item" role="button" @click.prevent="setUnits('imp', 'unitsNavButton')"><i class="fa fa-check" :class="[units === 'imp' ? '' : 'invisible']" aria-hidden="true"></i> English</a>
              <a class="dropdown-item" role="button" @click.prevent="setUnits('met', 'unitsNavButton')"><i class="fa fa-check" :class="[units === 'met' ? '' : 'invisible']" aria-hidden="true"></i> Metric</a>
            </div>
          </div>
        </div>
      </nav>

      <!--  Scroll Header -->
      <section id="scrollHeader" v-if="scrollHeader">
        <div class="container-fluid py-2 border-bottom">
          <div class="row text-muted">
            <div class="col-6">{{ scrollHeader.title }}</div>
            <div class="col-6 text-right">
              <a role="button" @click.prevent="scrollToTop">
                <i class="fa fa-chevron-up" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </div>
      </section>
    </header>

    <!-- Component matched by the route will render here -->
    <router-view
      :download-store="downloadStore"
      :client-time="clientTime" :is-retina="isRetina" :units="units"
      @update-header="updateHeader"></router-view>

    <footer class="bg-faded py-4" v-if="showsFooter">
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
// TODO: Update page footer - don't hardcode email?
// TODO: Move localforage config to a module
import localforage from 'localforage'
import $ from 'jquery'

import DownloadStore from './stores/DownloadStore'

const HIDES_FOOTER_REGEX = /(home)|(startDownload)/
const HIDES_UNITS_REGEX = /(startDownload)/

const config = window.CLIENT_CONFIG

localforage.config({
  name: 'dendroWebDash'
})

export default {
  data () {
    return {
      downloadState: this.downloadStore.reactiveState,

      clientTime: (new Date()).getTime(),
      isRetina: false, // Keepin' it simple; it's either retina or not
      scrollHeader: null,
      units: null
    }
  },

  beforeCreate () {
    this.downloadStore = new DownloadStore()
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

        if (this.clientTimeTid) clearInterval(this.clientTimeTid)
      })
    }

    /*
      Maintain a single reactive source of time updated approximately every minute. Strive for parity with the
      user's system clock.
     */
    this.clientTimeTid = setInterval(() => {
      const time = (new Date()).getTime()
      const minutes = Math.floor(time / 60000)
      if (this.minutes === minutes) return

      this.minutes = minutes
      this.clientTime = time
    }, 17000)
  },

  mounted () {
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
      Fade in/out informative header when scrolling.
     */
    $(window).scroll(() => {
      if ($(document).scrollTop() > 120) {
        $('#scrollHeader').addClass('scrolled')
      } else {
        $('#scrollHeader').removeClass('scrolled')
      }
    })
  },

  // TODO: Probably don't need this since App will never unload
  // beforeDestroy () {
  //   if (this.clientTimeTid) clearInterval(this.clientTimeTid)
  // },

  computed: {
    orgNavbarHref () {
      return config.orgNavbarHref || '/'
    },
    orgTitle () {
      return config.orgSlug ? config.orgSlug.toUpperCase() : 'Dendra'
    },
    showsFooter () {
      return !HIDES_FOOTER_REGEX.test(this.$route.name)
    },
    showsUnits () {
      return !HIDES_UNITS_REGEX.test(this.$route.name)
    }
  },

  methods: {
    scrollToTop () {
      $(this.$el).velocity('scroll', {
        duration: 500,
        easing: 'swing',
        offset: -58
      })
    },
    setUnits (units, toggleId) {
      this.units = units
      if (toggleId) {
        let el = $(`#${toggleId}`)
        if (el.parent().hasClass('show')) el.dropdown('toggle')
      }
    },
    updateHeader (update) {
      if (typeof update === 'object') {
        this.scrollHeader = Object.assign({}, this.scrollHeader, update)
      } else {
        this.scrollHeader = null
      }
    }
  },

  watch: {
    $route: function () {
      this.scrollHeader = null
    },
    units: function (newUnits) {
      localforage.setItem('units', newUnits)
    }
  }
}
</script>

<style>
body {
  background-color: #fff;
}

header .navbar {
  /*Using #2788dc which is a slightly darker variant of #5ca1dc*/
  background-color: rgba(39, 136, 220, 0.96);
  /*border-bottom: 1px solid rgb(80, 139, 191)*/
}

#scrollHeader {
  background-color: rgba(236, 238, 239, 0.96);
  transition: all 0.4s ease;
  opacity: 0;
}
#scrollHeader.scrolled {
  opacity: 1;
}

.bg-darken { background-color: rgba(0, 0, 0, 0.1); }
.bg-lighten { background-color: rgba(255, 255, 255, 0.1); }
.bg-none { background: none; }

.border-bottom { border-bottom: 1px solid rgba(0, 0, 0, 0.1); }
.border-left { border-left: 1px solid rgba(0, 0, 0, 0.1); }
.border-right { border-right: 1px solid rgba(0, 0, 0, 0.1); }
.border-top { border-top: 1px solid rgba(0, 0, 0, 0.1); }

.flex-1 { flex: 1 0 auto; }
.flex-2 { flex: 2 0 auto; }
.flex-3 { flex: 3 0 auto; }
.flex-4 { flex: 4 0 auto; }

.img-darken {
  filter: brightness(.7);
  -webkit-filter: brightness(.7);
}

.noselect {
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
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

/*Extra small devices (portrait phones, less than 576px)*/
/*No media query since this is the default in Bootstrap*/
.o-hidden {
  overflow: hidden;
}
.o-scroll {
  overflow: scroll;
}
.p-fixed {
  padding-top: 56px;
}

.vh-100 {
  height: 100vh;
}

/*Small devices (landscape phones, 576px and up)*/
@media (min-width: 576px) {
  .o-sm-scroll {
    overflow: scroll;
  }
  .p-sm-fixed {
    padding-top: 56px;
  }
  .vh-sm-100 {
    height: 100vh;
  }
}

/*Medium devices (tablets, 768px and up)*/
@media (min-width: 768px) {
  .o-md-scroll {
    overflow: scroll;
  }
  .p-md-fixed {
    padding-top: 56px;
  }
  .vh-md-100 {
    height: 100vh;
  }
}

/*Large devices (desktops, 992px and up)*/
@media (min-width: 992px) {
  .o-lg-scroll {
    overflow: scroll;
  }
  .p-lg-fixed {
    padding-top: 56px;
  }
  .vh-lg-100 {
    height: 100vh;
  }
}

/*Extra large devices (large desktops, 1200px and up)*/
@media (min-width: 1200px) {
  .o-xl-scroll {
    overflow: scroll;
  }
  .p-xl-fixed {
    padding-top: 56px;
  }
  .vh-xl-100 {
    height: 100vh;
  }
}
</style>
