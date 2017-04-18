<template>
  <div class="component p-fixed">
    <section>
      <div class="container-fluid">
        <div class="row py-2 border-bottom">
          <div class="col-12 text-muted">Weather Station Dashboard</div>
        </div>
      </div>
    </section>

    <section class="py-3" v-if="stationError">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12">
            <h2>Oops!</h2>
            <p>{{ stationError }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-3" v-if="stationLoading">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12 text-center text-muted">
            <i class="fa fa-spinner fa-pulse fa-3x fa-fw" aria-hidden="true"></i>
          </div>
        </div>
      </div>
    </section>

    <section class="py-3" v-if="station">
      <div class="container-fluid">
        <div class="row">
          <div class="col-md col-md-auto" v-if="station.media && !isMediaError">
            <lightbox :is-retina="isRetina" :media="station.media" :options="lightboxOptions"></lightbox>
            <photo-collage
              :is-retina="isRetina" :media="station.media"
              @error="collageError" @select="showLightbox"></photo-collage>
          </div>

          <div class="col-md">
            <station-info
              :contact-orgs="state.contactOrgs" :contact-persons="state.contactPersons"
              :station="station"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"
              @select-download="downloadData" @select-marker="showMap"></station-info>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-faded py-3" v-if="station">
      <div class="container-fluid">
        <div class="row row-md">
          <div class="col-12 col-lg-4 pb-3" v-if="coordinates">
            <map-tile
              :coordinates="coordinates" :title="station.name"
              @select-marker="showMap"></map-tile>
          </div>

          <div class="col-12 col-lg-4 pb-3">
            <air-temp-tile
              :current="datasets.current" :seasonal="datasets.seasonal"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"></air-temp-tile>
          </div>

          <div class="col-12 col-lg-4 pb-3">
            <notification-tile
              :data-loading="dataLoading"
              :datastreams="store.plainState.datastreams"
              :timestamps="store.plainState.timestamps"
              :station-time="stationTime" :system-time="state.systemTime"></notification-tile>
          </div>
        </div>

        <div class="row row-md">
          <div class="col-12 col-lg-4 pb-3">
            <wind-rose-tile
              :series-config="seriesConfig"
              :air-speed="datasets.airSpeed" :air-speed-cursor="airSpeedCursor"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"
              @series-added="seriesAdded"></wind-rose-tile>
          </div>

          <div class="col-12 col-lg-4 pb-3">
            <wind-speed-tile
              :current="datasets.current" :seasonal="datasets.seasonal"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"></wind-speed-tile>
          </div>

          <div class="col-12 col-lg-4 pb-3">
            <humidity-tile
              :current="datasets.current" :seasonal="datasets.seasonal"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"></humidity-tile>
          </div>
        </div>

        <div class="row row-md">
          <div class="col-12 col-lg-6 pb-3">
            <solar-rad-tile
              :current="datasets.current"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"></solar-rad-tile>
          </div>

          <div class="col-12 col-lg-6 pb-3">
            <precip-tile
              :current="datasets.current" :yesterday="datasets.yesterday"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"></precip-tile>
          </div>
        </div>

        <div class="row row-md">
          <div class="col-12 col-lg-6 pb-3">
            <air-pres-tile
              :coordinates="coordinates"
              :current="datasets.current"
              :series-config="seriesConfig"
              :air-pres="datasets.airPres" :air-pres-cursor="airPresCursor"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"
              @series-added="seriesAdded"></air-pres-tile>
          </div>

          <div class="col-12 col-lg-6 pb-3">
            <water-year-tile
              :series-config="wySeriesConfig"
              :precip="datasets.wyPrecip" :precip-cursor="wyPrecipCursor"
              :station-time="stationTime" :system-time="state.systemTime"
              :unit-abbrs="state.unitAbbrs" :units="units"
              @series-added="seriesAdded"></water-year-tile>
          </div>
        </div>

        <div class="row row-sm">
          <div class="col-12">
            <forecast-tile class="not-implemented"></forecast-tile>
          </div>
        </div>
<!--
        <div class="row">
          <download-tile></download-tile>
        </div>
 -->
      </div>
    </section>

    <section class="py-3" v-if="station">
      <time-machine
        :series-config="seriesConfig"
        :air-speed="datasets.airSpeed" :air-speed-cursor="airSpeedCursor"
        :air-temp="datasets.airTemp" :air-temp-cursor="airTempCursor"
        :soil-temp="datasets.soilTemp" :soil-temp-cursor="soilTempCursor"
        :solar-rad="datasets.solarRad" :solar-rad-cursor="solarRadCursor"
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
import AirPresTile from './tiles/AirPresTile'
import AirTempTile from './tiles/AirTempTile'
import DownloadTile from './tiles/DownloadTile'
import ForecastTile from './tiles/ForecastTile'
import HumidityTile from './tiles/HumidityTile'
import MapTile from './tiles/MapTile'
import NotificationTile from './tiles/NotificationTile'
import PrecipTile from './tiles/PrecipTile'
import SolarRadTile from './tiles/SolarRadTile'
import TimeMachine from './TimeMachine'
import WaterYearTile from './tiles/WaterYearTile'
import WindRoseTile from './tiles/WindRoseTile'
import WindSpeedTile from './tiles/WindSpeedTile'

import {DataLoader} from '../lib/dataloader'
import StationSources from '../sources/StationSources'
import SystemTimeSources from '../sources/SystemTimeSources'
import VocabularySources from '../sources/VocabularySources'

import StationStore from '../stores/StationStore'

let dataLoader

export default {
  components: {
    Lightbox,
    PhotoCollage,
    StationInfo,

    // Dashboard tiles
    AirPresTile,
    AirTempTile,
    DownloadTile,
    ForecastTile,
    HumidityTile,
    MapTile,
    NotificationTile,
    PrecipTile,
    SolarRadTile,
    TimeMachine,
    WaterYearTile,
    WindRoseTile,
    WindSpeedTile
  },

  props: {
    // Download 'cart'
    downloadStore: Object,

    // Misc
    clientTime: Number,
    isRetina: Boolean,
    units: String
  },

  data () {
    return {
      // DataLoader state
      dataLoading: false,

      state: this.store.reactiveState,

      slug: null,
      stationError: null,
      stationLoading: false,

      // Cursor-based fetching
      airPresCursor: null,
      airSpeedCursor: null,
      airTempCursor: null,
      soilTempCursor: null,
      solarRadCursor: null,
      wyPrecipCursor: null,

      // Misc
      isMediaError: false,
      lightboxOptions: null
    }
  },

  beforeCreate () {
    this.store = new StationStore()
  },

  created () {
    this.slug = this.$route.params.slug

    dataLoader = new DataLoader(this, Object.assign({}, StationSources, SystemTimeSources, VocabularySources))
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
    station () {
      return this.state.station
    },
    stationTime () {
      if (this.state.systemTime && this.state.station) {
        const offset = this.state.station.utc_offset
        return this.state.systemTime + (typeof offset === 'number' ? offset * 1000 : 0)
      }
    },
    seriesConfig () {
      const startOfDay = moment(this.stationTime).utc().startOf('d')
      return {
        // NOTE: Hardcoded to 14 days!
        start: startOfDay.clone().subtract(13, 'd').valueOf(),
        end: startOfDay.clone().add(1, 'd').valueOf()
      }
    },
    wySeriesConfig () {
      const startOfWY = moment(this.stationTime).utc().startOf('M').subtract(9, 'M').startOf('y').add(9, 'M')
      return {
        // NOTE: Hardcoded to 2 years!
        start: startOfWY.clone().subtract(12, 'M').startOf('M').valueOf(),
        end: startOfWY.clone().add(12, 'M').startOf('M').valueOf()
      }
    }
  },

  methods: {
    collageError () {
      this.isMediaError = true
    },
    downloadData () {
      this.downloadStore.initFields()
      this.downloadStore.addFieldsForStationDatastreams(this.state.station, this.store.plainState.datastreams)
      this.downloadStore.setPreset(this.downloadStore.presets.recentTwoWeeks)

      this.$router.push({name: 'download'})
    },
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
      logger.log('Station:methods.seriesAdded::datasetKey', datasetKey)
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
      // Update datapoints every 5.4 minutes
      // TODO: Make this configurable
      if (newTime - this.currentStatsFetchedAt > 324000) {
        dataLoader.clear(source => {
          return /^\w*(Series|Stats|systemTime)$/.test(source)
        }).load().then(() => {
          logger.log('Station:watch.clientTime::vm', this)
        })
      }
    },
    'state.station': function (newStation) {
      if (newStation) {
        this.$emit('update-header', {
          title: newStation.name
        })
      }
    },
    units () {
      dataLoader.clear(source => {
        return /^\w*(Series|Stats|systemTime)$/.test(source)
      }).load().then(() => {
        logger.log('Station:watch.units::vm', this)
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.row-md .component {
  height: 24rem !important;
}
.row-sm .component {
  height: 14rem !important;
}
</style>
