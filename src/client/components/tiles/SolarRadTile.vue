<template>
  <div class="d-flex flex-column h-100 rounded tile">

    <div class="d-flex flex-1 flex-row justify-content-center text-center border-bottom">
      <div class="d-flex flex-1 flex-column justify-content-center text-center">
        <h1 class="display-3">{{ curPAR | placeholder }}</h1>
        <span class="text-muted">PAR ({{ parAbbr }})</span>
      </div>
      <div class="d-flex flex-1 flex-column justify-content-center text-center bg-lighten">
        <h1 class="display-3">{{ curRad | placeholder }}</h1>
        <span class="text-muted">Total Solar ({{ radAbbr }})</span>
      </div>
    </div>

    <div class="d-flex flex-1 flex-column justify-content-center text-center">
      <h2>-
        <!-- TODO: Add today's forecast from NOAA -->
        <!-- <i class="wi wi-day-cloudy"></i> Partially Cloudy -->
      </h2>
    </div>

  </div>
</template>

<script>
// TODO: Show warning/indicator if current readings are older than 24 hours
// TODO: Make colors props?
import {abbr, solar} from '../../mixins/tile'

import ValueAcc from '../../accessors/ValueAcc'

let avgSolarPAR
let avgSolarRad

export default {
  props: {
    // Tile datasets
    current: Object,

    // Misc
    stationTime: Number,
    systemTime: Number,
    unitAbbrs: Object,
    units: String
  },

  data () {
    return {
      curPAR: null,
      curRad: null
    }
  },

  created () {
    avgSolarPAR = new ValueAcc(this, 'Average_Solar_PhotosyntheticallyActiveRadiation')
    avgSolarRad = new ValueAcc(this, 'Average_Solar_Radiation')
  },

  beforeDestroy () {
    avgSolarPAR = avgSolarRad = null
  },

  mixins: [abbr, solar],

  watch: {
    current (newDataset) {
      this.curPAR = avgSolarPAR.init(newDataset).valRound
      this.curRad = avgSolarRad.init(newDataset).valRound
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tile {
  background-color: #bf9650;
  color: #fff;
}
</style>
