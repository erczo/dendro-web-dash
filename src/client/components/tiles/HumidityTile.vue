<template>
  <div class="d-flex flex-column h-100 rounded tile" :style="{backgroundColor: colors.TILE.AIR_MOIST}">

    <div class="d-flex flex-1 flex-column justify-content-center text-center border-bottom">
      <h1 class="display-3">{{ curAvg | placeholder }}
        <i class="wi wi-humidity"></i>
      </h1>
      <span class="text-muted">Humidity</span>
    </div>

    <div class="d-flex flex-1 flex-row">
      <div class="d-flex flex-1 flex-column justify-content-center text-center bg-darken">
        <h2>{{ seasMin | placeholder }}%</h2>
        <span class="text-muted">Seasonal Low</span>
      </div>
      <div class="d-flex flex-1 flex-column justify-content-center text-center bg-lighten">
        <h2>{{ seasMax | placeholder }}%</h2>
        <span class="text-muted">Seasonal High</span>
      </div>
    </div>

    <div class="d-flex flex-column justify-content-center py-2 text-center text-muted">
      {{ seasMonth | placeholder }}
    </div>

  </div>
</template>

<script>
import {color, seasonal} from '../../mixins/tile'

import ValueAcc from '../../accessors/ValueAcc'
const VALUE_ACC_OPTIONS = {
  round: 1
}

let avgAirMoist
let maxSeasAirMoist
let minSeasAirMoist

export default {
  props: {
    // Tile datasets
    current: Object,
    seasonal: Object,

    // Misc
    stationTime: Number,
    systemTime: Number,
    unitAbbrs: Object,
    units: String
  },

  data () {
    return {
      curAvg: null,
      seasMax: null,
      seasMin: null
    }
  },

  created () {
    avgAirMoist = new ValueAcc(this, 'Average_Air_Moisture', VALUE_ACC_OPTIONS)
    maxSeasAirMoist = new ValueAcc(this, 'Maximum_Seasonal_Air_Moisture', VALUE_ACC_OPTIONS)
    minSeasAirMoist = new ValueAcc(this, 'Minimum_Seasonal_Air_Moisture', VALUE_ACC_OPTIONS)
  },

  beforeDestroy () {
    avgAirMoist = maxSeasAirMoist = minSeasAirMoist = null
  },

  mixins: [color, seasonal],

  watch: {
    current (newDataset) {
      this.curAvg = avgAirMoist.init(newDataset).valRound
    },
    seasonal (newDataset) {
      this.seasMax = maxSeasAirMoist.init(newDataset).valRound
      this.seasMin = minSeasAirMoist.init(newDataset).valRound
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
