<template>
  <div class="component">
    <section id="banner">
      <div class="jumbotron jumbotron-fluid">
        <div class="container">
          <form>
            <p class="lead">Welcome to the Dendro weather station network.</p>
            <div class="form-group">
              <input type="text" class="form-control form-control-lg" placeholder="Search for stations" disabled>
            </div>
          </form>

          <button type="button" class="btn btn-sm btn-secondary disabled">Show Map</button>
        </div>
      </div>
    </section>

    <section id="stations" v-if="stations && stations.length > 0">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <ul class="list-unstyled">
              <station-list-item :is-retina="isRetina" :station="station" :unit-abbrs="state.unitAbbrs" :units="units" v-for="station in stations"></station-list-item>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// TODO: Implement search, no results, errors and 'more' button
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

      stationsError: null,
      stationsLoading: false
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
  },

  computed: {
    stations () {
      return this.state.stations
    }
  },

  beforeDestroy () {
    // TODO: Implement
    // dataLoader.cancel()
    dataLoader = null
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
