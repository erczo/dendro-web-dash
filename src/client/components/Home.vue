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

    <section id="stations">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <ul class="list-unstyled">
              <station-list-item :is-retina="isRetina" :station="station" :unit-abbrs="unitAbbrs" :units="units" v-for="station in stations"></station-list-item>
            </ul>
          </div>
        </div>
      </div>
    </section>
</template>

<script>
// TODO: Implement search, no results, errors and 'more' button
import StationListItem from './StationListItem'

import {DataLoader} from '../lib/dataloader'
import HomeSources from '../sources/HomeSources'

const dataLoader = new DataLoader(HomeSources)

export default {
  components: {
    StationListItem
  },

  props: {
    clientTime: Date,
    isRetina: Boolean,
    units: String
  },

  data () {
    return {
      stations: null,
      stationsError: null,
      stationsLoading: false,
      unitAbbrs: null
    }
  },

  created () {
    dataLoader.load(this)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
