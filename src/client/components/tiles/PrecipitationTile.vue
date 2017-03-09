<template>
  <div class="d-flex flex-column h-100 rounded tile">

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
// TODO: Show warning/indicator if current readings are older than 24 hours
// TODO: Make colors props?
import {abbr, length} from '../../mixins/tile'

import LengthAcc from '../../accessors/LengthAcc'

let cuPrecipHeight
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
    cuPrecipHeight = new LengthAcc(this, 'Cumulative_Precipitation_Height')
    cuDayPrecipHeight = new LengthAcc(this, 'Cumulative_Day_Precipitation_Height')
  },

  beforeDestroy () {
    cuPrecipHeight = cuDayPrecipHeight = null
  },

  mixins: [abbr, length],

  watch: {
    current (newDataset) {
      this.curCu = cuPrecipHeight.init(newDataset).lenRound
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
  background-color: #50bfa6;
  color: #fff;
}
</style>
