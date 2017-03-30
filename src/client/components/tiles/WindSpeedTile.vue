<template>
  <div class="d-flex flex-column h-100 rounded tile" :style="{backgroundColor: colors.TILE.WIND}">

    <div class="d-flex flex-1 flex-column justify-content-center text-center border-bottom">
      <h1 class="display-4">{{ curAvg | placeholder }}
        <i class="wi wi-wind" :class="'wi-from-' + curDir.toLowerCase()" v-if="curDir"></i>
        <small>{{ curDir | placeholder }}</small>
      </h1>
      <span class="text-muted">Wind Speed ({{ spdAbbr }})</span>
    </div>

    <div class="d-flex flex-1 flex-row">
      <table class="table table-sm">
        <tbody>
          <tr class="bg-lighten">
            <th class="text-muted" scope="row">Seasonal Average</th>
            <td class="h2 text-right">{{ seasAvg | placeholder }}</td>
          </tr>

          <tr class="bg-darken">
            <th class="text-muted" scope="row">Seasonal Low</th>
            <td class="h2 text-right">{{ seasMin | placeholder }}</td>
          </tr>

          <tr>
            <th class="text-muted" scope="row">Seasonal High</th>
            <td class="h2 text-right">{{ seasMax | placeholder }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="d-flex flex-column justify-content-center py-2 text-center text-muted">
      {{ seasMonth | placeholder }}
    </div>

  </div>
</template>

<script>
// TODO: Show warning/indicator if current readings are older than 24 hours
// TODO: Make colors props?
import {abbr, color, seasonal, speed} from '../../mixins/tile'

import AirDirAcc from '../../accessors/AirDirAcc'
import SpeedAcc from '../../accessors/SpeedAcc'

let avgAirDir
let avgAirSpeed
let avgSeasAirSpeed
let maxSeasAirSpeed
let minSeasAirSpeed

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
      curDir: null,
      curAvg: null,
      seasAvg: null,
      seasMax: null,
      seasMin: null
    }
  },

  created () {
    avgAirDir = new AirDirAcc(this, 'Average_Air_Direction')
    avgAirSpeed = new SpeedAcc(this, 'Average_Air_Speed')
    avgSeasAirSpeed = new SpeedAcc(this, 'Average_Seasonal_Air_Speed')
    maxSeasAirSpeed = new SpeedAcc(this, 'Maximum_Seasonal_Air_Speed')
    minSeasAirSpeed = new SpeedAcc(this, 'Minimum_Seasonal_Air_Speed')
  },

  beforeDestroy () {
    avgAirDir = avgAirSpeed = avgSeasAirSpeed = maxSeasAirSpeed = minSeasAirSpeed = null
  },

  mixins: [abbr, color, seasonal, speed],

  watch: {
    current (newDataset) {
      this.curDir = avgAirDir.init(newDataset).dirName
      this.curAvg = avgAirSpeed.init(newDataset).spdRound
    },
    seasonal (newDataset) {
      this.seasAvg = avgSeasAirSpeed.init(newDataset).spdRound
      this.seasMax = maxSeasAirSpeed.init(newDataset).spdRound
      this.seasMin = minSeasAirSpeed.init(newDataset).spdRound
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.table th,
.table td {
  border-top: none;
  padding: 0.3rem 0.6rem;
  vertical-align: middle;
}
.table.table-sm th {
  font-weight: normal;
}

.tile {
  color: #fff;
}
</style>
