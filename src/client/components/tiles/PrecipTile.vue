<template>
  <div class="component d-flex flex-column h-100 rounded tile" :style="{backgroundColor: colors.TILE.PRECIP}">
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
