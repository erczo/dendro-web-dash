<template>
  <li class="component media my-3 pb-3 border-bottom">
    <router-link :to="{name: 'station', params: {slug: station.slug}}" class="hidden-xs-down" v-if="linkEnabled">
      <img class="d-flex mr-3 photo-thumb rounded" :src="mediaUrl" v-if="mediaUrl">
      <div class="d-flex mr-3 photo-thumb" v-else></div>
    </router-link>
    <img class="d-flex mr-3 photo-thumb rounded" :src="mediaUrl" v-else-if="mediaUrl">
    <div class="d-flex mr-3 photo-thumb" v-else></div>

    <div class="media-body">
      <router-link :to="{name: 'station', params: {slug: station.slug}}" v-if="linkEnabled">
        <h4>{{ station.name }}</h4>
      </router-link>
      <h4 v-else>{{ station.name }}</h4>

      <!-- TODO: Move to StationElevation.vue? -->
      <p v-if="station.geo && station.geo.coordinates && station.geo.coordinates.length > 1">
        <span class="hidden-md-down">Coordinates: </span>{{ station.geo.coordinates[1] }}°, {{ station.geo.coordinates[0] }}°
        <span v-if="station.geo.coordinates.length > 2"><br />Elevation: {{ elevation }}</span>
      </p>

      <router-link class="mr-3" :to="{name: 'station', params: {slug: station.slug}}" v-if="linkEnabled">Dashboard</router-link>
      <!-- TODO: Implement this -->
      <!-- <a class="" href="#">Datastreams</a> -->
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
    linkEnabled: Boolean,
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
      const station = this.station
      if (station.geo && station.geo.coordinates && station.geo.coordinates.length > 2) {
        const m = station.geo.coordinates[2]
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
    },
    mediaUrl () {
      const media = this.media
      if (this.media && this.media.length > 0) {
        return this.isRetina && media[0].sizes.thumb_2x ? media[0].sizes.thumb_2x.url : media[0].sizes.thumb.url
      }
    }
  },

  mixins: [abbr]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
