<template>
  <div class="d-flex flex-column h-100 rounded tile">

    <div class="d-flex flex-1 flex-column justify-content-center text-center border-bottom">
      <h1 class="display-3">{{ curAvg | placeholder }}
        <i class="wi wi-fahrenheit" v-if="units === 'imp'"></i>
        <i class="wi wi-celsius" v-if="units === 'met'"></i>
      </h1>
      <span class="text-muted">Air Temperature</span>
    </div>

    <div class="d-flex flex-1 flex-row">
      <div class="d-flex flex-1 flex-column justify-content-center text-center bg-darken">
        <h2>{{ seasMin | placeholder }}°</h2>
        <span class="text-muted">Seasonal Low</span>
      </div>
      <div class="d-flex flex-1 flex-column justify-content-center text-center bg-lighten">
        <h2>{{ seasMax | placeholder }}°</h2>
        <span class="text-muted">Seasonal High</span>
      </div>
    </div>

    <div class="d-flex flex-column justify-content-center py-2 text-center text-muted">
      {{ seasMonth | placeholder }}
    </div>

  </div>
</template>

<script>
// TODO: Show warning/indicator if current readings are older than 24 hours
// TODO: Make colors props?
import {seasonal} from '../../mixins/tile'

import TempAcc from '../../accessors/TempAcc'

let avgAirTemp
let maxSeasAirTemp
let minSeasAirTemp

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
    avgAirTemp = new TempAcc(this, 'Average_Air_Temperature')
    maxSeasAirTemp = new TempAcc(this, 'Maximum_Seasonal_Air_Temperature')
    minSeasAirTemp = new TempAcc(this, 'Minimum_Seasonal_Air_Temperature')
  },

  beforeDestroy () {
    avgAirTemp = maxSeasAirTemp = minSeasAirTemp = null
  },

  mixins: [seasonal],

  watch: {
    current (newDataset) {
      this.curAvg = avgAirTemp.init(newDataset).degRound
    },
    seasonal (newDataset) {
      this.seasMax = maxSeasAirTemp.init(newDataset).degRound
      this.seasMin = minSeasAirTemp.init(newDataset).degRound
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tile {
  background-color: #509ebf;
  color: #fff;
}
</style>
