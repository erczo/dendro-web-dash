<template>
  <li class="media mb-4">
    <router-link :to="{name: 'station', params: {slug: station.slug}}" class="hidden-xs-down">
      <div class="d-flex mr-3 rounded align-items-center justify-content-center img-thumbnail photo-small" v-if="!media || media.length <= 0">
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
import math from '../lib/math'

export default {
  props: {
    isRetina: Boolean,
    station: Object,
    unitAbbrs: Object,
    units: String
  },

  computed: {
    // TODO: Move to StationElevation.vue?
    elevation: function () {
      const m = this.station.geo.coordinates[2]
      switch (this.units) {
        case 'imp':
          return `${math.round(math.unit(m, 'm').toNumber('ft'))} ${this.getAbbr('Foot')}`
        case 'met':
          return `${m} ${this.getAbbr('Meter')}`
      }
      return
    },
    media: function () {
      return this.station.media
    }
  },

  methods: {
    getAbbr (key) {
      if (!this.unitAbbrs) return ''
      return this.unitAbbrs[key]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
