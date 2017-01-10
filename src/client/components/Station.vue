<template>
  <div class="component">
    <section id="banner">
      <div class="container">
        <div class="row align-items-end">

          <!-- Profile Image -->
          <div class="col-12 col-lg-4" style="padding-bottom: 0.5rem;">
            <!-- TODO: What's the plan for assets/photos? -->
            <img class="img-profile rounded float-lg-right" src="../assets/images/blue-oak-ws.jpg">
          </div>
          
          <!-- Profile Info -->
          <div class="col-12 col-lg-8" style="padding-bottom: 0.5rem;">
            <p>5:45 PM PST <em>(UTC -8 hours)</em></p>
            <h1>Blue Oak Ranch <small class="text-muted">Weather Station</small></h1>
            <!-- TODO: Fix coordinates and map -->
            <p>Coordinates: 37.381666°, -121.73638° <i class="fa fa-map-marker" aria-hidden="true"></i><br />
            Elevation: 575 m</p>

            <!-- Links -->
            <ul class="nav">
              <li class="nav-item">
                <a class="nav-link" href="http://sensor.berkeley.edu/index_BORR.html" target="_blank"><i class="fa fa-external-link" aria-hidden="true"></i> Sensor database</a>
              </li>

              <li class="nav-item">
                <a class="nav-link" href="http://sensor.berkeley.edu/index_BORR.html" target="_blank"><i class="fa fa-external-link" aria-hidden="true"></i> Reserve website</a>
              </li>

              <li class="nav-item">
                <a class="nav-link" href="mailto:collin@berkeley.edu"><i class="fa fa-envelope-o" aria-hidden="true"></i> Contact weather station team</a>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>

    <section id="tiles">
      <div class="container">

        <div class="row row-md">
          <map-tile :lat="37.381666" :lng="-121.73638" :title="stationTitle"></map-tile>
          <air-temp-tile :degrees="13"></air-temp-tile>
          <notification-tile></notification-tile>
        </div>

        <div class="row row-md">
          <wind-rose-tile></wind-rose-tile>
          <wind-speed-tile></wind-speed-tile>
          <humidity-tile></humidity-tile>
        </div>

        <div class="row row-md">
          <solar-rad-tile></solar-rad-tile>
          <precipitation-tile></precipitation-tile>
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
  </div>
</template>

<script>
// TODO: Finish
// TODO: Make colors props?

import AirTempTile from './tiles/AirTempTile'
import CumulativeRainTile from './tiles/CumulativeRainTile'
import DownloadTile from './tiles/DownloadTile'
import ForecastTile from './tiles/ForecastTile'
import HumidityTile from './tiles/HumidityTile'
import MapTile from './tiles/MapTile'
import NotificationTile from './tiles/NotificationTile'
import PrecipitationTile from './tiles/PrecipitationTile'
import PressureTile from './tiles/PressureTile'
import SolarRadTile from './tiles/SolarRadTile'
import TimeMachine from './TimeMachine'
import WindRoseTile from './tiles/WindRoseTile'
import WindSpeedTile from './tiles/WindSpeedTile'

import services from '../services'

export default {
  components: {
    AirTempTile,
    CumulativeRainTile,
    DownloadTile,
    ForecastTile,
    HumidityTile,
    MapTile,
    NotificationTile,
    PrecipitationTile,
    PressureTile,
    SolarRadTile,
    TimeMachine,
    WindRoseTile,
    WindSpeedTile
  },

  data () {
    return {
      stationTitle: 'Blue Oak Ranch Weather Station'
    }
  },

  mounted () {
    const datastreams = services.datastream.find({})
    console.log('DATASTREAMS', datastreams)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#banner {
  background-color: #fff;
  border-bottom: 1px solid #e1e1e1;
  padding: 5rem 0 1rem 0;
}

#tiles {
  background-color: #eee;  
  border-top: 1px solid #f1f1f1;
  padding-top: 1rem;
  padding-bottom: 1rem;
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

.row-md .component {
  height: 22rem !important;
  padding-bottom: 1rem;
}
.row-sm .component {
  height: 12rem !important;
  padding-bottom: 1rem;
}
</style>
