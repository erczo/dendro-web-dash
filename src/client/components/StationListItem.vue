<template>
  <li class="media mb-4">
    <router-link :to="{name: 'station', params: {slug: station.slug}}" class="hidden-xs-down">
      <div class="d-flex mr-3 rounded align-items-center justify-content-center img-thumbnail photo-small" v-if="!media || media.length === 0">
        <i class="fa fa-picture-o fa-lg" aria-hidden="true"></i>
      </div>
      <img class="d-flex mr-3 rounded photo-small" :src="isRetina && media[0].sizes.small_2x ? media[0].sizes.small_2x.url : media[0].sizes.small.url" v-if="media && media.length > 0">
    </router-link>

    <div class="media-body">
      <router-link :to="{name: 'station', params: {slug: station.slug}}">
        <h3>{{ station.name }}</h3>
      </router-link>

      <!-- TODO: Move to StationElevation.vue? -->
      <p v-if="station.geo && station.geo.coordinates && station.geo.coordinates.length > 1">
        <span>Coordinates: </span>{{ station.geo.coordinates[1] }}°, {{ station.geo.coordinates[0] }}°
        <span v-if="station.geo.coordinates.length > 2"><br />Elevation: {{ elevation }}</span>
      </p>
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
    elevation: function () {
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
    media: function () {
      if (!this.isMediaError) return this.station.media
    }
  },

  mixins: [abbr],

  methods: {
    onError: function () {
      console.log('IMAGEERROR2')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
