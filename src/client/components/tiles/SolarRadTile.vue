<template>
  <div class="component d-flex flex-column h-100 rounded tile" :style="{backgroundColor: colors.TILE.SOLAR}">
    <div class="d-flex flex-1 flex-row justify-content-center text-center">
      <div class="d-flex flex-1 flex-column justify-content-center text-center">
        <h1 class="display-3">{{ curPAR | placeholder }}</h1>
        <span class="text-muted">PAR ({{ parAbbr }})</span>
      </div>
      <div class="d-flex flex-1 flex-column justify-content-center text-center bg-lighten">
        <h1 class="display-3">{{ curRad | placeholder }}</h1>
        <span class="text-muted">Total Solar ({{ radAbbr }})</span>
      </div>
    </div>
  </div>
</template>

<script>
import {abbr, color, solar} from '../../mixins/tile'

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

  mixins: [abbr, color, solar],

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
  color: #fff;
}
</style>
