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
            <station-info :contact-orgs="contactOrgs" :contact-persons="contactPersons" :station="station" :time="systemTime" :unit-abbrs="unitAbbrs" :units="units" @select-marker="showMap"></station-info>
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
            <air-temp-tile :current="current" :seasonal="seasonal" :time="systemTime" :utc-offset="station.utc_offset" :units="units"></air-temp-tile>
          </div>

          <notification-tile class="not-implemented"></notification-tile>
        </div>

        <div class="row row-md">
          <wind-rose-tile class="not-implemented"></wind-rose-tile>

          <div class="col-12 col-lg-4 component">
            <wind-speed-tile :current="current" :seasonal="seasonal" :time="systemTime" :utc-offset="station.utc_offset" :unit-abbrs="unitAbbrs" :units="units"></wind-speed-tile>
          </div>

          <div class="col-12 col-lg-4 component">
            <humidity-tile :current="current" :seasonal="seasonal" :time="systemTime" :utc-offset="station.utc_offset"></humidity-tile>
          </div>
        </div>

        <div class="row row-md">
          <div class="col-12 col-lg-6 component">
            <solar-rad-tile :current="current" :time="systemTime" :unit-abbrs="unitAbbrs"></solar-rad-tile>
          </div>

          <div class="col-12 col-lg-6 component">
            <precipitation-tile :current="current" :yesterday="yesterday" :time="systemTime" :unit-abbrs="unitAbbrs" :units="units"></precipitation-tile>
          </div>
        </div>

        <div class="row row-md">
          <div class="col-12 col-lg-6 component">
            <pressure-tile :coordinates="coordinates" :current="current" :two-weeks="twoWeeks" :time="systemTime" :utc-offset="station.utc_offset" :unit-abbrs="unitAbbrs" :units="units"></pressure-tile>
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
      <time-machine class="not-implemented"></time-machine>
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
    clientTime: Date,
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
      current: null,
      seasonal: null,
      twoWeeks: null,
      yesterday: null,
      systemTime: null,
      lightboxOptions: null,
      unitAbbrs: null
    }
  },

  created () {
    this.slug = this.$route.params.slug
    dataLoader.load(this)
  },

  computed: {
    coordinates () {
      const station = this.station
      if (!station || !station.geo || !station.geo.coordinates || station.geo.coordinates.length < 3) return
      return station.geo.coordinates
    }
  },

  methods: {
    fetchDatapoints () {
      dataLoader.clear(this, source => {
        return /^(current|seasonal|yesterday|systemTime)\w*$/.test(source)
      }).load(this)
    },
    fetchStation () {
      this.slug = this.$route.params.slug
      dataLoader.clear(this, source => {
        return source !== 'unitVocabulary'
      }).load(this)
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
    clientTime (newTime) {
      // Update datapoints every 2.7 minutes
      // TODO: Make this configurable!
      if (newTime - this.currentFetchedAt > 162000) this.fetchDatapoints()
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
