<template>
  <div class="component">
    <section>
      <div class="container-fluid">
        <div class="row">
          <div class="col-12 col-sm-7 col-stations-map pl-0 pr-0 p-fixed vh-sm-100" style="position: relative;">
            <div class="w-100 h-100" style="z-index: 100;" ref="stationsMap"></div>

            <div class="o-hidden p-fixed w-100" style="position: absolute; left: 0; top: 0; z-index: 200; background-color: rgba(0, 0, 0, 0.20);">
              <div class="px-3 py-3">
                <input type="text" class="form-control form-control-lg" placeholder="Search weather stations" v-model="searchText" />
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-5 o-sm-scroll p-sm-fixed vh-sm-100" v-if="!stationsLoading">
            <div class="row py-2 border-bottom" v-if="hasMoreStations">
              <div class="col-12 text-muted">{{ stations.length }} stations shown</div>
            </div>

            <div class="row" v-if="stations">
              <div class="col-12">
                <h2 class="my-3 pb-3" v-if="stations.length === 0">No stations found</h2>
                <ul class="list-unstyled" v-else>
                  <station-list-item
                    :is-retina="isRetina"
                    :link-enabled="stationLinkEnabled"
                    :station="station"
                    :unit-abbrs="state.unitAbbrs" :units="units"
                    :key="station._id"
                    v-for="station in stations"></station-list-item>
                </ul>
              </div>
            </div>

            <div class="row my-3 pb-3" v-if="!moreStationsLoading && hasMoreStations">
              <div class="col-12 text-center">
                <button type="button" class="btn btn-info" @click="seeMore">See More</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import debounce from 'lodash.debounce'
import loadGoogleMapsAPI from 'load-google-maps-api'
import logger from '../lib/logger'

import StationListItem from './StationListItem'

import {DataLoader} from '../lib/dataloader'
import HomeSources from '../sources/HomeSources'
import VocabularySources from '../sources/VocabularySources'

import HomeStore from '../stores/HomeStore'

const config = window.CLIENT_CONFIG

let dataLoader

export default {
  components: {
    StationListItem
  },

  props: {
    // Misc
    isRetina: Boolean,
    units: String
  },

  data () {
    return {
      state: this.store.reactiveState,

      searchText: '',
      skipStationCount: 0,
      totalStationCount: 0,

      moreStationsLoading: false,

      stationsError: null,
      stationsLoading: false
    }
  },

  beforeCreate () {
    this.store = new HomeStore()
  },

  created () {
    this.markers = {}
    this.needsRezoom = false

    dataLoader = new DataLoader(this, Object.assign({}, HomeSources, VocabularySources))
    dataLoader.clear()

    this.debouncedSearch = debounce(() => {
      dataLoader.clear(source => {
        return source === 'stations'
      }).load().then(() => {
        logger.log('Home:created.debouncedSearch::vm', this)
      })
    }, 400)
  },

  mounted () {
    Promise.resolve(window.google).then(google => {
      return google ? google.maps : loadGoogleMapsAPI(config.googleMapsAPI)
    }).then(maps => {
      this.maps = maps
      this.map = new maps.Map(this.$refs.stationsMap, {
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: maps.ControlPosition.BOTTOM_CENTER
        },
        scrollwheel: false
      })

      this.infoWindow = new maps.InfoWindow()

      // Adjust the map after a window resize
      this.resizeListener = debounce(() => {
        if (this.map && this.bounds) {
          this.needsRezoom = true
          this.map.fitBounds(this.bounds)
          // TODO: Could try a less dramatic option
          // this.map.panToBounds(this.bounds)
        }
      }, 1500)

      this.maps.event.addDomListener(window, 'resize', this.resizeListener)
      this.map.addListener('bounds_changed', () => {
        if (this.needsRezoom) {
          this.needsRezoom = false
          if (this.map.getZoom() > 10) {
            this.map.setZoom(10)
          }
          // TODO: Could try this to keep all markers inside map area
          // } else {
          //   this.map.setZoom(this.map.getZoom() - 1)
          // }
        }
      })
    }).catch(err => {
      logger.error(err)
    }).then(() => {
      dataLoader.load().then(() => {
        logger.log('Home:mounted::vm', this)
      })
    })
  },

  beforeDestroy () {
    dataLoader.destroy()
    dataLoader = null

    this.debouncedSearch.cancel()
    this.resizeListener.cancel()

    const maps = this.maps
    if (maps) {
      maps.event.clearInstanceListeners(window)
      maps.event.clearInstanceListeners(maps)

      if (this.map) maps.event.clearInstanceListeners(this.map)

      Object.keys(this.markers).forEach(key => {
        maps.event.clearInstanceListeners(this.markers[key])
      })
    }

    this.bounds = this.infoWindow = this.maps = this.map = this.markers = null
  },

  computed: {
    hasMoreStations () {
      const stations = this.stations
      return stations && this.totalStationCount > stations.length
    },
    stationLinkEnabled () {
      return [true, 1, 'true', 'yes'].includes(config.stationLinkEnabled)
    },
    stations () {
      return this.state.stations
    }
  },

  methods: {
    seeMore () {
      this.skipStationCount = this.stations.length

      dataLoader.load().then(() => {
        logger.log('Home:methods.seeMore::vm', this)
      })
    },
    selectMarker (station) {
      const marker = this.markers[station._id]
      if (marker) {
        const coords = station.geo.coordinates
        const link = this.$router.resolve({name: 'station', params: {slug: station.slug}})

        // TODO: Figure out where map links should take us - hardcoded to Google
        // TODO: Make this configurable
        this.infoWindow.setContent(
          `<h6>${station.name}</h6>` +
          (this.stationLinkEnabled ? `<a href="${link.href}">Dashboard</a> | ` : '') +
          `<a href="https://www.google.com/maps?q=${coords[1]},${coords[0]}" target="_blank">Maps</a>`
        )
        this.infoWindow.open(this.map, marker)
      }
    }
  },

  watch: {
    searchText (newSearchText) {
      this.debouncedSearch()
    },
    'state.stations': function (newStations) {
      // Remove markers from map, but keep cached in memory
      Object.keys(this.markers).forEach(key => {
        this.markers[key].setMap(null)
      })

      // Add new markers to map
      if (newStations) {
        this.bounds = new this.maps.LatLngBounds()

        newStations.filter(station => {
          // We're only interested in stations with geo coordinates
          return station.geo && station.geo.coordinates && station.geo.coordinates.length > 2
        }).forEach(station => {
          // Markers are cached and keyed by station id
          let marker = this.markers[station._id]
          if (marker) {
            marker.setMap(this.map)
          } else {
            const coords = station.geo.coordinates
            const latLng = new this.maps.LatLng({lat: coords[1], lng: coords[0]})
            marker = this.markers[station._id] = new this.maps.Marker({
              position: latLng,
              map: this.map,
              title: station.name
            })

            marker.addListener('click', this.selectMarker.bind(this, station))
          }

          this.bounds.extend(marker.getPosition())
        })

        this.needsRezoom = true
        this.map.fitBounds(this.bounds)
      }
    }
    // TODO: Remove this - deprecated
    // totalStationCount (newCount) {
    //   this.$emit('update-header', {
    //     title: `${newCount} stations found`
    //   })
    // }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

/*Extra small devices (portrait phones, less than 576px)*/
@media (max-width: 575px) {
  .col-stations-map {
    height: 24rem;
  }
}

</style>
