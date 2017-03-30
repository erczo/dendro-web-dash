<template>
  <div class="component">
    <section id="banner">
      <div class="jumbotron jumbotron">
        <div class="container">
          <form>
            <p class="lead">Welcome to the Dendro weather station network.</p>
            <div class="form-group">
              <input type="text" class="form-control form-control-lg" placeholder="Search for stations" v-model="searchText">
            </div>
          </form>

          <button type="button" class="btn btn-sm btn-secondary disabled">Show Map</button>
        </div>
      </div>
    </section>

    <section id="stations" class="pb-4">
      <div class="container" v-if="!stationsLoading">
        <div class="row">
          <div class="col-12">
            <h2 v-if="!stations || stations.length === 0">No stations found</h2>
            <ul class="list-unstyled" v-if="stations && stations.length > 0">
              <station-list-item :is-retina="isRetina" :station="station" :unit-abbrs="state.unitAbbrs" :units="units" v-for="station in stations"></station-list-item>
            </ul>
          </div>
        </div>
      </div>

      <div class="row justify-content-sm-center py-2" v-if="stations && state.stations.length > queryLimit">
        <div class="col-12 col-sm-auto">
          <button type="button" class="btn btn-info" @click="seeMore">See more &raquo;</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// TODO: Implement search, no results, errors and 'more' button
import debounce from 'lodash.debounce'
import logger from '../lib/logger'

import StationListItem from './StationListItem'

import {DataLoader} from '../lib/dataloader'
import HomeSources from '../sources/HomeSources'
import HomeStore from '../stores/HomeStore'

let dataLoader

export default {
  components: {
    StationListItem
  },

  props: {
    clientTime: Number,
    isRetina: Boolean,
    units: String
  },

  data () {
    return {
      state: this.store.reactiveState,

      // TODO: Make this configurable
      // TODO: Finish this!!!
      queryLimit: 1000,
      searchText: '',

      stationsError: null,
      stationsLoading: false,
      stationsReady: false
    }
  },

  beforeCreate () {
    this.store = new HomeStore()
  },

  created () {
    dataLoader = new DataLoader(this, HomeSources)
    dataLoader.clear().load().then(() => {
      logger.log('Home:created::vm', this)
    })

    this.debouncedSearch = debounce(() => {
      // TODO: Make this configurable
      // TODO: Finish this!!!
      // this.queryLimit = 10
      // this.stationsReady = false

      // TODO: Finish this!!!
      dataLoader.clear(source => {
        return source === 'stations'
      }).load().then(() => {
        logger.log('Home:created.debouncedSearch::vm', this)
      })

      // TODO: Finish this!!!
      // dataLoader.clear(source => {
      //   return source === 'stations'
      // }).load().then(() => {
      //   logger.log('Home:created.debouncedSearch::vm', this)
      // })
    }, 400)
  },

  beforeDestroy () {
    // TODO: Implement
    // dataLoader.cancel()
    dataLoader = null

    this.debouncedSearch.cancel()
  },

  computed: {
    stations () {
      return this.state.stations
      // TODO: Finish this!!!
      // const stations = this.state.stations
      // if (Array.isArray(stations)) return stations.slice(0, this.queryLimit)
    }
  },

  methods: {
    // TODO: Finish this!!!
    // seeMore () {
    //   // TODO: Make this configurable
    //   this.queryLimit += 10
    //   this.stationsReady = false

    //   dataLoader.load().then(() => {
    //     logger.log('Home:methods.seeMore::vm', this)
    //   })
    // }
  },

  watch: {
    searchText (newSearchText) {
      this.debouncedSearch()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
