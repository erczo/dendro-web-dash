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
            <photo-collage
              :is-retina="isRetina" :media="station.media" v-if="station.media"
              @select="showLightbox"></photo-collage>
          </div>

          <div class="col-12 col-lg-8 pb-3">
            <station-info
              :contact-orgs="state.contactOrgs" :contact-persons="state.contactPersons"
              :station="station"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"
              @select-marker="showMap"></station-info>
          </div>
        </div>
      </div>
    </section>

    <section id="tiles" class="bg-faded border-bottom border-top py-3" v-if="station">
      <div class="container">
        <div class="row row-md">
          <div class="col-12 col-lg-4 component" v-if="coordinates">
            <map-tile :coordinates="coordinates" :title="station.name" @select-marker="showMap"></map-tile>
          </div>

          <div class="col-12 col-lg-4 component">
            <air-temp-tile
              :current="datasets.current" :seasonal="datasets.seasonal"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"></air-temp-tile>
          </div>

          <notification-tile class="not-implemented"></notification-tile>
        </div>

        <div class="row row-md">
          <wind-rose-tile class="not-implemented"></wind-rose-tile>

          <div class="col-12 col-lg-4 component">
            <wind-speed-tile
              :current="datasets.current" :seasonal="datasets.seasonal"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"></wind-speed-tile>
          </div>

          <div class="col-12 col-lg-4 component">
            <humidity-tile
              :current="datasets.current" :seasonal="datasets.seasonal"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"></humidity-tile>
          </div>
        </div>

        <div class="row row-md">
          <div class="col-12 col-lg-6 component">
            <solar-rad-tile
              :current="datasets.current"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"></solar-rad-tile>
          </div>

          <div class="col-12 col-lg-6 component">
            <precipitation-tile
              :current="datasets.current" :yesterday="datasets.yesterday"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"></precipitation-tile>
          </div>
        </div>

        <div class="row row-md">
          <div class="col-12 col-lg-6 component">
            <pressure-tile
              :coordinates="coordinates"
              :current="datasets.current"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"></pressure-tile>
          </div>

          <div class="col-12 col-lg-6 component">
            <cumulative-rain-tile class="not-implemented"></cumulative-rain-tile>
          </div>
        </div>

        <div class="row row-sm">
          <forecast-tile class="not-implemented"></forecast-tile>
        </div>

        <div class="row">
          <download-tile class="not-implemented"></download-tile>
        </div>
      </div>
    </section>

    <section id="timeMachine" class="py-4" v-if="station">
      <time-machine
        :series-config="seriesConfig"
        :air-temp="datasets.airTemp" :air-temp-cursor="airTempCursor"
        :soil-temp="datasets.soilTemp" :soil-temp-cursor="soilTempCursor"
        :solar-rad="datasets.solarRad" :solar-rad-cursor="solarRadCursor"
        :wind-speed="datasets.windSpeed" :wind-speed-cursor="windSpeedCursor"
        :unit-abbrs="state.unitAbbrs" :units="units"
        @series-added="seriesAdded"></time-machine>
    </section>
  </div>
</template>

<script>
import moment from 'moment'
import logger from '../lib/logger'

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
import StationStore from '../stores/StationStore'

let dataLoader

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
    clientTime: Number,
    isRetina: Boolean,
    units: String
  },

  data () {
    return {
      state: this.store.reactiveState,

      slug: null,
      stationError: null,
      stationLoading: false,

      // Cursor-based fetching
      airTempCursor: null,
      soilTempCursor: null,
      solarRadCursor: null,
      windSpeedCursor: null,

      // Misc
      lightboxOptions: null
    }
  },

  beforeCreate () {
    this.store = new StationStore()
  },

  created () {
    this.slug = this.$route.params.slug

    dataLoader = new DataLoader(this, StationSources)
    dataLoader.clear().load().then(() => {
      logger.log('Station:created::vm', this)
    })
  },

  beforeDestroy () {
    // TODO: Implement
    // dataLoader.cancel()
    dataLoader = null
  },

  computed: {
    coordinates () {
      const station = this.state.station
      if (station && station.geo && station.geo.coordinates && station.geo.coordinates.length > 2) return station.geo.coordinates
    },
    datasets () {
      return this.state.datasets
    },
    seriesConfig () {
      const startOfDay = moment(this.stationTime).utc().startOf('d')
      return {
        // TODO: Hardcoded to 14 days!
        start: startOfDay.clone().subtract(13, 'd').valueOf(),
        end: startOfDay.clone().add(1, 'd').valueOf()
      }
    },
    station () {
      return this.state.station
    },
    stationTime () {
      if (this.state.systemTime && this.state.station) {
        const offset = this.state.station.utc_offset
        return this.state.systemTime + (typeof offset === 'number' ? offset * 1000 : 0)
      }
    }
  },

  methods: {
    fetchStation () {
      this.slug = this.$route.params.slug

      dataLoader.clear(source => {
        return source !== 'unitVocabulary'
      }).load().then(() => {
        logger.log('Station:methods.fetchStation::vm', this)
      })
    },
    seriesAdded (datasetKey) {
      // HACK: Release memory
      this.store.setDataset(datasetKey)
    },
    showLightbox (index) {
      this.lightboxOptions = {
        index
      }
    },
    showMap (coordinates) {
      // TODO: Figure out where map links should take us - hardcoded to Google
      // TODO: Make this configurable
      window.open(`https://www.google.com/maps?q=${coordinates[1]},${coordinates[0]}`, '_blank')
    }
  },

  watch: {
    $route: 'fetchStation',
    clientTime (newTime) {
      // Update datapoints every 2.7 minutes
      // TODO: Make this configurable
      if (newTime - this.currentFetchedAt > 162000) {
        dataLoader.clear(source => {
          return /^\w*(Stats|systemTime)$/.test(source)
        }).load().then(() => {
          logger.log('Station:watch.clientTime::vm', this)
        })
      }
    },
    units () {
      dataLoader.clear(source => {
        return /^\w*(Series|Stats)$/.test(source)
      }).load().then(() => {
        logger.log('Station:watch.units::vm', this)
      })
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
