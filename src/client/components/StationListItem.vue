<template>
  <li class="component media my-3 pb-3 border-bottom">
    <router-link :to="{name: 'station', params: {slug: station.slug}}" class="hidden-xs-down">
      <div class="d-flex mr-3 photo-thumb" v-if="!media || media.length === 0"></div>
      <img class="d-flex mr-3 photo-thumb rounded" :src="isRetina && media[0].sizes.thumb_2x ? media[0].sizes.thumb_2x.url : media[0].sizes.thumb.url" v-if="media && media.length > 0">
    </router-link>

    <div class="media-body">
      <router-link :to="{name: 'station', params: {slug: station.slug}}">
        <h4>{{ station.name }}</h4>
      </router-link>

      <!-- TODO: Move to StationElevation.vue? -->
      <p v-if="station.geo && station.geo.coordinates && station.geo.coordinates.length > 1">
        <span class="hidden-md-down">Coordinates: </span>{{ station.geo.coordinates[1] }}°, {{ station.geo.coordinates[0] }}°
        <span v-if="station.geo.coordinates.length > 2"><br />Elevation: {{ elevation }}</span>
      </p>

      <router-link class="mr-3" :to="{name: 'station', params: {slug: station.slug}}">Dashboard</router-link>
      <a class="" href="#">Datastreams</a>
    </div>
  </li>
</template>

<script>
import $ from 'jquery'
import math from '../lib/math'

import {abbr} from '../mixins/tile'

export default {
  props: {
    isRetina: Boolean,
    station: Object,

    // Misc
    unitAbbrs: Object,
    units: String
  },

  data () {
    return {
      isMediaError: false
    }
  },

  mounted () {
    $(this.$el).find('img').bind('error', (e) => {
      this.isMediaError = true
    })
  },

  beforeDestroy () {
    $(this.$el).find('img').unbind()
  },

  computed: {
    // TODO: Move to StationElevation.vue?
    elevation () {
      if (this.station.geo && this.station.geo.coordinates && this.station.geo.coordinates.length > 2) {
        const m = this.station.geo.coordinates[2]
        switch (this.units) {
          case 'imp':
            return `${math.round(math.unit(m, 'm').toNumber('ft'))} ${this.getAbbr('Foot')}`
          case 'met':
            return `${math.round(m, 1)} ${this.getAbbr('Meter')}`
        }
      }
    },
    media () {
      if (!this.isMediaError) return this.station.media
    }
  },

  mixins: [abbr]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
