<template>
  <div class="component">
    <section v-if="error">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h1>{{ error }}</h1>
          </div>
        </div>
      </div>
    </section>

    <section v-if="loading">
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
            <air-temp-tile :station="station" :datapoints="currentDatapoints" :units="units"></air-temp-tile>
          </div>

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

    <section id="timeMachine" class="py-4" v-if="station">
      <time-machine></time-machine>
    </section>
  </div>
</template>

<script>
import services from '../services'
import {tagsToKey} from '../lib/utils'

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

/*
  Predefined queries to be performed against the datapoints/lookup service
 */
const DATAPOINT_QUERY_DEFS = {
  currentAir: {
    filter (ds) {
      // TODO: Should test for isDefault attribute
      return !ds.attributes
    },
    keys: [
      {imp: 'Average_Air_Temperature_DegreeFahrenheit', met: 'Average_Air_Temperature_DegreeCelsius'},
      // FIX: Seasonal data is NOT the min and max values
      {imp: 'Maximum_Air_Temperature_DegreeFahrenheit', met: 'Maximum_Air_Temperature_DegreeCelsius'},
      {imp: 'Minimum_Air_Temperature_DegreeFahrenheit', met: 'Minimum_Air_Temperature_DegreeCelsius'}
    ],
    query: {
      $limit: 1
    },
    target: 'current'
  }
}

/*
  Strategies for handling lookups based on the user's units selection
 */
const UNIT_STRATEGIES = {
  // e.g. if Imperial is selected, then use Imperial datastreams with Metric as fallback
  imp: ['imp', 'met'],
  met: ['met', 'imp']
}

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
      error: null,
      loading: false,
      station: null,
      contactOrgs: null,
      contactPersons: null,
      datastreams: null,
      datapoints: null,
      lightboxOptions: null,
      unitAbbrs: null
    }
  },

  // TODO: Remove this - dead code
  // beforeRouteEnter (to, from, next) {
  //   services.station.find({
  //     query: {
  //       slug: to.params.slug
  //     }
  //   }).then(station => {
  //     if (station && station.data && station.data.length > 0) {
  //       next(vm => {
  //         vm.station = station.data[0]
  //       })
  //     } else {
  //       next({path: '/'})
  //     }
  //   })
  // },

  created () {
    this.fetchStation()
    this.fetchUnitVocabulary()
  },

  computed: {
    currentDatapoints: function () {
      return this.datapoints ? this.datapoints.current : null
    }
  },

  methods: {
    assignDatapoints (query, res) {
      // Assign a target var in datapoints using the given query and results
      if (!this.datapoints) this.datapoints = {}
      this.$set(this.datapoints, query.target, {})

      res.forEach(obj => {
        const key = query.idKeyMap[obj._id]
        if (key && obj.datapoints && obj.datapoints.data) {
          this.$set(this.datapoints[query.target], key, obj.datapoints.data)
        }
      })
    },
    fetchContacts () {
      const fetchedAt = this.contactsFetchedAt = new Date()
      this.contactOrgs = this.contactPersons = null
      if (!this.station || !this.station.members) return

      // Gather IDs for all station contact members
      const orgIds = []
      const personIds = []
      this.station.members.filter(m => {
        return m.roles.indexOf('contact') > -1
      }).forEach(m => {
        if (m.organization_id) orgIds.push(m.organization_id)
        if (m.person_id) personIds.push(m.person_id)
      })

      services.organization.find({
        query: {
          _id: {$in: orgIds},
          email: {$exists: true},
          $select: ['_id', 'email', 'name']
        }
      }).then(res => {
        if (fetchedAt !== this.contactsFetchedAt) return
        if (res && res.data) {
          this.contactOrgs = res.data
        }
      })

      services.person.find({
        query: {
          _id: {$in: personIds},
          email: {$exists: true},
          $select: ['_id', 'email', 'name']
        }
      }).then(res => {
        if (fetchedAt !== this.contactsFetchedAt) return
        if (res && res.data) {
          this.contactPersons = res.data
        }
      })
    },
    fetchDatapoints () {
      const fetchedAt = this.datapointsFetchedAt = new Date()
      this.datapoints = null
      if (!this.station || !this.datastreams) return

      const currentAirQuery = this.getDatapointsQuery(DATAPOINT_QUERY_DEFS.currentAir)
      services.datapointLookup.find(currentAirQuery.params).then(res => {
        if (fetchedAt !== this.datapointsFetchedAt) return
        this.assignDatapoints(currentAirQuery, res)
      }).catch(err => {
        // TODO: Deal with errors
        console.log(err)
      })

      // TODO: Finish this!
    },
    fetchDatastreams () {
      const fetchedAt = this.datastreamsFetchedAt = new Date()
      this.datastreams = this.datapoints = null
      if (!this.station) return

      services.datastream.find({
        query: {
          enabled: true,
          station_id: this.station._id,
          $select: ['_id', 'attributes', 'tags']
        }
      }).then(res => {
        if (fetchedAt !== this.datastreamsFetchedAt) return
        if (res && res.data && res.data.length > 0) {
          res.data.forEach(datastream => {
            datastream.__key = tagsToKey(datastream.tags)
            delete datastream.tags
          })
          this.datastreams = res.data
          this.fetchDatapoints()
        }
      })
    },
    fetchStation () {
      const fetchedAt = this.stationsFetchedAt = new Date()
      this.error = this.station = this.datastreams = this.datapoints = null
      this.loading = true

      services.station.find({
        query: {
          enabled: true,
          station_type: 'weather',
          slug: this.$route.params.slug,
          $limit: 1
        }
      }).then(res => {
        if (fetchedAt !== this.stationsFetchedAt) return

        this.loading = false
        if (res && res.data && res.data.length > 0) {
          this.station = res.data[0]
          //
          // TODO: Remove this - for debug only
          // this.station.media = null
          // this.station.media.pop()
          // this.station.media.pop()
          // this.station.media.pop()
          // this.station.media.pop()
          // this.station.media.pop()
          // this.station.media.push(this.station.media[0])
          // this.station.geo.coordinates = [-73.989308, 40.741895]
          // this.station.external_links = null
          // this.station.members = null
          // setTimeout(() => {
          //   this.station.geo.coordinates = [-73.989308, 40.741895]
          //   this.station.name = 'Hello Station'
          // }, 5000)
          //
          this.fetchDatastreams()
          this.fetchContacts()
        } else {
          this.error = 'Station not found'
        }
      }).catch(err => {
        if (fetchedAt !== this.stationsFetchedAt) return

        this.loading = false
        this.error = err.message
      })
    },
    fetchUnitVocabulary () {
      if (this.unitAbbrs) return

      services.vocabulary.get('dt-unit').then(res => {
        if (res && res.terms) {
          const abbrs = {}
          res.terms.forEach(term => {
            abbrs[term.label] = term.abbreviation
          })
          this.unitAbbrs = abbrs
        }
      })
    },
    getDatapointsQuery (queryDef) {
      // Get datapoints/lookup params along with an idKeyMap for handling results
      const filter = queryDef.filter || function () { return true }
      const strategy = UNIT_STRATEGIES[this.units] || []
      const params = {
        query: Object.assign({}, queryDef.query)
      }
      const idKeyMap = {}

      for (let key of queryDef.keys) {
        for (let u of strategy) {
          const found = this.datastreams.find(ds => {
            return (ds.__key === key[u]) && filter(ds)
          })
          if (found) {
            idKeyMap[found._id] = found.__key
            break
          }
        }
      }

      params.query._id = Object.keys(idKeyMap).join(',')
      return {
        idKeyMap,
        params,
        target: queryDef.target
      }
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
      if (newDate - this.datapointsFetchedAt > 162000) this.fetchDatapoints()
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
