<template>
  <div class="component">
    <section class="py-3" v-if="stationError">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h1>{{ stationError }}</h1>
          </div>
        </div>
      </div>
    </section>

    <section class="py-3" v-if="stationLoading">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h1>Loading...</h1>
          </div>
        </div>
      </div>
    </section>

    <section id="banner" class="pt-3" v-if="station">
      <div class="container">
        <div class="row align-items-end">
          <div class="col-12 col-lg-4 pb-3" v-if="station.media">
            <lightbox :is-retina="isRetina" :media="station.media" :options="lightboxOptions"></lightbox>
            <photo-collage :is-retina="isRetina" :media="station.media" v-if="station.media" @select="showLightbox"></photo-collage>
          </div>

          <div class="col-12 col-lg-8 pb-3">
            <station-info :client-date="clientDate" :contact-orgs="contactOrgs" :contact-persons="contactPersons" :station="station" :unit-abbrs="unitAbbrs" :units="units" @select-marker="showMap"></station-info>
          </div>
        </div>
      </div>
    </section>

    <section id="tiles" class="bg-faded border-bottom border-top py-3" v-if="station">
      <div class="container">
        <div class="row row-md">
          <div class="col-12 col-lg-4 component" v-if="station.geo && station.geo.coordinates && station.geo.coordinates.length > 1">
            <map-tile :coordinates="station.geo.coordinates" :title="station.name" @select-marker="showMap"></map-tile>
          </div>

          <div class="col-12 col-lg-4 component">
            <air-temp-tile :current="currentReadings" :seasonal="seasonalReadings" :units="units"></air-temp-tile>
          </div>

          <notification-tile></notification-tile>
        </div>

        <div class="row row-md">
          <wind-rose-tile></wind-rose-tile>

          <div class="col-12 col-lg-4 component">
            <wind-speed-tile :current="currentReadings" :seasonal="seasonalReadings" :unit-abbrs="unitAbbrs" :units="units"></wind-speed-tile>
          </div>

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

    <section id="timeMachine" class="py-4" v-if="station">
      <time-machine></time-machine>
    </section>
  </div>
</template>

<script>
import Lightbox from './Lightbox'
import PhotoCollage from './PhotoCollage'
import StationInfo from './StationInfo'

// TODO: Move these to Tiles.vue?
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

import {DataLoader} from '../lib/dataloader'
import StationSources from '../sources/StationSources'

const dataLoader = new DataLoader(StationSources)

export default {
  components: {
    Lightbox,
    PhotoCollage,
    StationInfo,

    // Dashboard tiles
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

  props: {
    clientDate: Date,
    isRetina: Boolean,
    units: String
  },

  data () {
    return {
      slug: null,
      station: null,
      stationError: null,
      stationLoading: false,
      contactOrgs: null,
      contactPersons: null,
      datastreams: null,
      currentReadings: null,
      seasonalReadings: null,
      lightboxOptions: null,
      unitAbbrs: null
    }
  },

  created () {
    this.slug = this.$route.params.slug
    dataLoader.load(this).then(() => {
      console.log('VM', this)
    })
  },

  methods: {
    fetchDatapoints () {
      this.currentReadings = null
      dataLoader.load(this)
    },
    fetchStation () {
      this.station = this.stationError = this.contactOrgIds = this.contactOrgs = this.contactPersonIds = this.contactPersons = this.datastreams = this.currentReadings = null
      this.slug = this.$route.params.slug
      dataLoader.load(this)
    },
    showLightbox (index) {
      this.lightboxOptions = {
        index
      }
    },
    showMap (coordinates) {
      // TODO: Figure out where map links should take us - hardcoded to Google
      window.open(`https://www.google.com/maps?q=${coordinates[1]},${coordinates[0]}`, '_blank')
    }
  },

  watch: {
    $route: 'fetchStation',
    clientDate (newDate) {
      // Update datapoints every 2.7 minutes
      // TODO: Make this configurable!
      if (newDate - this.currentReadingsFetchedAt > 162000) this.fetchDatapoints()
    },
    units () {
      this.fetchDatapoints()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.row .component {
  padding-bottom: 1rem;
}
.row-md .component {
  height: 22rem !important;
}
.row-sm .component {
  height: 12rem !important;
}
</style>
