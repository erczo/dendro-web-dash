<template>
  <div id="app">
    <header>
      <nav class="navbar navbar-dark navbar-fixed-top p-y-1">
        <div class="container-fluid">

          <!-- Reserve Name -->
          <a class="navbar-brand" href="#"><span class="hidden-sm-down">Blue Oak Ranch Reserve </span><i class="fa fa-external-link" aria-hidden="true"></i></a>

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
      <div class="container-fluid">
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
              <div class="flex-1-cell flex-col cell-align-bottom">
                <p>5:45 PM PST UTC -8 hours</p>
                <h1 class="display-4">Blue Oak Ranch <small class="text-muted">Weather Station</small></h1>
                <p>Coordinates: 39.718390°, -123.652883° <i class="fa fa-map-marker" aria-hidden="true"></i><br />
                Elevation: 575 m</p>

                <!-- Links -->
                <ul class="nav nav-inline">
                  <li class="nav-item">
                    <a class="nav-link" href="#"><i class="fa fa-photo" aria-hidden="true"></i> Photos</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#"><i class="fa fa-external-link" aria-hidden="true"></i> Website</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#"><i class="fa fa-envelope-o" aria-hidden="true"></i> Contact</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section id="tiles">
      <div class="container-fluid">

        <div class="row row-md">
          <map-tile :lat="39.718" :lng="-123.652" title="Blue Oak Ranch Weather Station"></map-tile>
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
      <div class="container">

        <div class="row">
          <div class="col col-sm-12 col-lg-12 flex-col">
            <div class="flex-1 flex-col cell-align-middle text-xs-center"><h1>Air Temperature</h1></div>
          </div>
        </div>

        <div class="row">
          <div class="col col-sm-12 col-lg-12 flex-col">
            <div class="flex-1 flex-col cell-align-middle text-xs-center"><h1>Soil Temperature</h1></div>
          </div>
        </div>

        <div class="row">
          <div class="col col-sm-12 col-lg-12 flex-col">
            <div class="flex-1 flex-col cell-align-middle text-xs-center"><h1>Wind Speed</h1></div>
          </div>
        </div>

        <div class="row">
          <div class="col col-sm-12 col-lg-12 flex-col">
            <div class="flex-1 flex-col cell-align-middle text-xs-center"><h1>Solar Radiation</h1></div>
          </div>
        </div>

      </div>
    </section>

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
import WindRoseTile from './components/tiles/WindRoseTile'
import WindSpeedTile from './components/tiles/WindSpeedTile'

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
    WindRoseTile,
    WindSpeedTile
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
  width: 300px;
  height: 300px;
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
.tile .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}

header .navbar {
  background-color: rgba(80, 139, 191, 0.96);
  border-bottom: 1px solid rgb(80, 139, 191)
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
  height: 24rem !important;
}
#tiles .row-sm .col {
  height: 12rem !important;
}

#timeMachine {
  background-color: #fff;
  border-top: 1px solid #f1f1f1;
  padding-top: 1rem;
}
#timeMachine .col {
  height: 22rem !important;
}
#timeMachine .flex-1 {
  border: 1px solid #e1e1e1;
}
</style>
