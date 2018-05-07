<template>
  <div class="component d-flex flex-column justify-content-center h-100 rounded tile" style="position: relative;" :style="{backgroundColor}">
    <div class="align-self-center" style="position: absolute;" v-if="isComingSoon">
      <span class="badge badge-pill badge-default px-4 py-4" style="opacity: 0.9;">Coming Soon</span>
    </div>

    <div class="d-flex flex-1 flex-column justify-content-center text-center">
      <h1 class="display-3">{{ curCu | placeholder }} <i class="wi wi-raindrops"></i></h1>
      <span class="text-muted">Current Precipitation ({{ lenAbbr }})</span>
    </div>

    <div class="d-flex flex-1 flex-column justify-content-center text-center bg-darken">
      <h1 class="display-4">{{ ydaCu | placeholder }}</h1>
      <span class="text-muted">Yesterday’s ({{ lenAbbr }})</span>
    </div>
  </div>
</template>

<script>
import chroma from 'chroma-js'

import {abbr, color, length} from '../../mixins/tile'

import LengthAcc from '../../accessors/LengthAcc'

let cuDayPrecipHeight

export default {
  props: {
    // Tile datasets
    current: Object,
    yesterday: Object,

    // Misc
    stationTime: Number,
    systemTime: Number,
    unitAbbrs: Object,
    units: String
  },

  data () {
    return {
      curCu: null,
      ydaCu: null
    }
  },

  created () {
    cuDayPrecipHeight = new LengthAcc(this, 'Cumulative_Day_Precipitation_Height')
  },

  beforeDestroy () {
    cuDayPrecipHeight = null
  },

  mixins: [abbr, color, length],

  computed: {
    backgroundColor () {
      return this.isComingSoon ? chroma(this.colors.TILE.PRECIP).alpha(0.5).css() : this.colors.TILE.PRECIP
    },
    isComingSoon () {
      return (typeof this.curCu === 'undefined') && (typeof this.ydaCu === 'undefined')
    }
  },

  watch: {
    current (newDataset) {
      this.curCu = cuDayPrecipHeight.init(newDataset).lenRound
    },
    yesterday (newDataset) {
      this.ydaCu = cuDayPrecipHeight.init(newDataset).lenRound
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tile {
  color: #fff;
}
</style>
