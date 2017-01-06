<template>
  <div id="app">
    <header>
      <nav class="navbar navbar-dark navbar-fixed-top p-y-1">
        <div class="container">

          <!-- Reserve Name -->
          <a class="navbar-brand" href="http://www.blueoakranchreserve.org/" target="_blank"><span class="hidden-sm-down">Blue Oak Ranch Reserve </span><i class="fa fa-external-link" aria-hidden="true"></i></a>

          <!-- Nav Toolbar -->
          <div class="btn-toolbar pull-right" role="toolbar" aria-label="Navigation toolbar">

            <!-- Alert Badge -->
            <div class="btn-group" role="group" aria-hidden="true">
              <button type="button" class="btn btn-outline-secondary" style="border-color: rgba(0, 0, 0, 0); color: #fff;">
                <i class="fa fa-exclamation-triangle fa-lg" aria-hidden="true"></i>
                <span class="tag tag-pill tag-danger" style="vertical-align: top">5</span>
              </button>
            </div>

            <!-- Units Dropdown -->
            <div class="btn-group" role="group" aria-label="Units dropdown">
              <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="hidden-xs-down">Units: </span>Metric
              </button>
              <div class="dropdown-menu">
                <a class="dropdown-item" href="#">English</a>
                <a class="dropdown-item" href="#">Metric</a>
              </div>
            </div>
          </div>

        </div>
      </nav>
    </header>

    <section id="banner">
      <div class="container">
        <div class="row">

          <!-- Profile Image -->
          <div class="col-sm-12 col-lg-4 flex-col">
            <div class="flex-1">
              <img class="img-rounded img-profile pull-lg-right" src="./assets/images/blue-oak-ws.jpg">
            </div>
          </div>
          
          <!-- Profile Info -->
          <div class="col-sm-12 col-lg-8 flex-col">
            <div class="flex-1 flex-col">
              <div class="flex-1-cell flex-col cell-align-bottom" style="border-left: 1px solid #e1e1e1; padding-left: 1rem;">
                <p>5:45 PM PST <em>(UTC -8 hours)</em></p>
                <h1>Blue Oak Ranch <small class="text-muted">Weather Station</small></h1>
                <!-- TODO: Fix coordinates and map -->
                <p>Coordinates: 37.381666°, -121.73638° <i class="fa fa-map-marker" aria-hidden="true"></i><br />
                Elevation: 575 m</p>

                <!-- Links -->
                <ul class="nav nav-inline">
                  <li class="nav-item">
                    <a class="nav-link" href="http://www.wrcc.dri.edu/cgi-bin/rawMAIN.pl?caucbo" target="_blank"><i class="fa fa-photo" aria-hidden="true"></i> Photos</a>
                  </li>

                  <li class="nav-item">
                    <a class="nav-link" href="http://sensor.berkeley.edu/index_BORR.html" target="_blank"><i class="fa fa-external-link" aria-hidden="true"></i> Sensor database</a>
                  </li>

                  <li class="nav-item">
                    <a class="nav-link" href="mailto:collin@berkeley.edu"><i class="fa fa-envelope-o" aria-hidden="true"></i> Contact weather station team</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section id="tiles">
      <div class="container">

        <div class="row row-md">
          <map-tile :lat="37.381666" :lng="-121.73638" title="Blue Oak Ranch Weather Station"></map-tile>
          <air-temp-tile></air-temp-tile>
          <notification-tile></notification-tile>
        </div>

        <div class="row row-md">
          <wind-rose-tile></wind-rose-tile>
          <wind-speed-tile></wind-speed-tile>
          <humidity-tile></humidity-tile>
        </div>

        <div class="row row-md">
          <solar-rad-tile></solar-rad-tile>
          <precip-tile></precip-tile>
        </div>

        <div class="row row-md">
          <pressure-tile></pressure-tile>
          <cumulative-rain-tile></cumulative-rain-tile>
        </div>

        <div class="row row-sm">
          <forecast-tile></forecast-tile>
        </div>

        <div class="row">
          <download-tile></download-tile>
        </div>

      </div>
    </section>

    <section id="timeMachine">
      <time-machine></time-machine>
    </section>

    <footer>
      <div class="container-fluid">
        <div class="row">

          <div class="col-xs-12">
            <div class="text-xs-center">
              <small>Problems viewing this page? Email&nbsp;<a href="mailto:collin@berkeley.edu">collin@berkeley.edu</a></small>
            </div>
          </div>

        </div>
      </div>
    </footer>

  </div>
</template>

<script>
// TODO: Import these from tiles.vue?
// TODO: Move navbar and profile into components
// TODO: Refactor styles for components
// TODO: Add page footer

import AirTempTile from './components/tiles/AirTempTile'
import CumulativeRainTile from './components/tiles/CumulativeRainTile'
import DownloadTile from './components/tiles/DownloadTile'
import ForecastTile from './components/tiles/ForecastTile'
import HumidityTile from './components/tiles/HumidityTile'
import MapTile from './components/tiles/MapTile'
import NotificationTile from './components/tiles/NotificationTile'
import PrecipTile from './components/tiles/PrecipTile'
import PressureTile from './components/tiles/PressureTile'
import SolarRadTile from './components/tiles/SolarRadTile'
import TimeMachine from './components/TimeMachine'
import WindRoseTile from './components/tiles/WindRoseTile'
import WindSpeedTile from './components/tiles/WindSpeedTile'

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
  components: {
    AirTempTile,
    CumulativeRainTile,
    DownloadTile,
    ForecastTile,
    HumidityTile,
    MapTile,
    NotificationTile,
    PrecipTile,
    PressureTile,
    SolarRadTile,
    TimeMachine,
    WindRoseTile,
    WindSpeedTile
  },

  mounted () {
    const stationService = app.service('/stations')
    const stations = stationService.find({})

    console.log('STATIONS', stations)

    const datastreamService = app.service('/datastreams')
    const datastreams = datastreamService.find({})

    console.log('DATASTREAMS', datastreams)
  }
}
</script>

<style>
body {
  background-color: #fff;
}

.bg-darken {
  background-color: rgba(0, 0, 0, 0.1);
}
.bg-lighten {
  background-color: rgba(255, 255, 255, 0.1);
}

.cell-border-bottom {
  border-bottom: 1px solid #eceeef;
}
.cell-border-top {
  border-top: 1px solid #eceeef;
}
.cell-align-middle {
  justify-content: center;
}
.cell-align-bottom {
  justify-content: flex-end;
}

.flex-col {
  display: flex;
  flex-direction: column;
}
.flex-row {
  display: flex;
  flex-direction: row;
}
.flex-1 {
  flex: 1 0 auto;
  margin-bottom: 1rem;
}
.flex-1-cell {
  flex: 1 0 auto;
}
.flex-2-cell {
  flex: 2 0 auto;
}
.flex-3-cell {
  flex: 3 0 auto;
}
.flex-4-cell {
  flex: 4 0 auto;
}

.img-profile {
  width: 240px;
  height: 240px;
}

.text-inverse {
  color: #fff;  
}
.text-thin {
  font-weight: 300;
}

.tile {
  border: 1px solid #e1e1e1;
  border-radius: 0.3rem;
  overflow: hidden;
}
.tile table {
  margin-bottom: 0;
}
.tile h1,
.tile h2,
.tile h3,
.tile .h1,
.tile .h2,
.tile .h3 {
  /* OPTIONAL */
  /*text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.2);*/
}
.tile .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}

header .navbar {
  background-color: rgba(80, 139, 191, 0.96);
  border-bottom: 1px solid rgb(80, 139, 191)
}

footer {
  background-color: #eee;
  padding: 1rem 0;
}

#banner {
  background-color: #fff;
  border-bottom: 1px solid #e1e1e1;
  padding: 6rem 0 1rem 0;
}

#tiles {
  background-color: #eee;  
  border-top: 1px solid #f1f1f1;
  padding-top: 1rem;
}
#tiles .row-md .col {
  height: 22rem !important;
}
#tiles .row-sm .col {
  height: 12rem !important;
}

#timeMachine {
  background-color: #fff;
  border-top: 1px solid #f1f1f1;
  padding: 2rem 0;
}
#timeMachine .row {
  margin-bottom: 3rem;
}
#timeMachine .col {
  /*height: 22rem !important;*/
}
#timeMachine .flex-1 {
  border: 1px solid #e1e1e1;
}
</style>
