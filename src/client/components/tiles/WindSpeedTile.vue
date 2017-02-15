<template>
  <div class="d-flex flex-column h-100 rounded tile">

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
            <th class="text-muted" scope="row">Daytime Average</th>
            <td class="h2 text-right">{{ seasAvg | placeholder }}</td>
          </tr>

          <tr class="bg-darken">
            <th class="text-muted" scope="row">Nighttime Average</th>
            <td class="h2 text-right">{{ seasMin | placeholder }}</td>
          </tr>

          <tr>
            <th class="text-muted" scope="row">Seasonal Gusts</th>
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
import math from '../../lib/math'
import moment from 'moment'
import {windDegToIndex} from '../../lib/utils'

const DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']

export default {
  props: {
    current: Object,
    seasonal: Object,
    time: Date,
    utcOffset: Number,
    unitAbbrs: Object,
    units: String
  },

  computed: {
    curAvg: function () {
      return this.getCurSpd('Average_Air_Speed_MilePerHour', 'Average_Air_Speed_MeterPerSecond')[0]
    },
    curDir: function () {
      if (!this.current) return
      const pts = this.current.Average_Air_Direction_DegreeAngle
      if (pts) return DIRECTIONS[windDegToIndex(pts[0].v)]
    },
    seasAvg: function () {
      return this.getSeasSpd('Average_Seasonal_Air_Speed_MilePerHour', 'Average_Seasonal_Air_Speed_MeterPerSecond')[0]
    },
    seasMax: function () {
      return this.getSeasSpd('Maximum_Seasonal_Air_Speed_MilePerHour', 'Maximum_Seasonal_Air_Speed_MeterPerSecond')[0]
    },
    seasMin: function () {
      return this.getSeasSpd('Minimum_Seasonal_Air_Speed_MilePerHour', 'Minimum_Seasonal_Air_Speed_MeterPerSecond')[0]
    },
    seasMonth: function () {
      // TODO: Verify approach for seasonal month names (A or B below)
      // A. Use current station time to get a month name
      if (!this.time) return
      return moment(this.time).utcOffset(this.utcOffset / 60).format('MMMM')
      // B. Harvest the time from a datapoint to get a month name
      // const pt = this.getSeasSpd('Maximum_Seasonal_Air_Speed_MilePerHour', 'Maximum_Seasonal_Air_Speed_MeterPerSecond')[1]
      // if (pt) return moment(pt.t).utcOffset(pt.o / 60).format('MMMM')
    },
    spdAbbr: function () {
      switch (this.units) {
        case 'imp':
          return this.getAbbr('MilePerHour')
        case 'met':
          return this.getAbbr('MeterPerSecond')
      }
      return
    }
  },

  methods: {
    getAbbr (key) {
      if (!this.unitAbbrs) return ''
      return this.unitAbbrs[key]
    },
    getCurSpd (...args) {
      return this.getSpd(this.current, ...args)
    },
    getSeasSpd (...args) {
      return this.getSpd(this.seasonal, ...args)
    },
    getSpd (prop, impKey, metKey) {
      if (!prop) return []

      const [impPts, metPts] = [prop[impKey], prop[metKey]]

      switch (this.units) {
        case 'imp':
          if (impPts) {
            return [math.round(math.unit(impPts[0].v, 'mi/h').toNumber(), 1), impPts[0]]
          } else if (metPts) {
            return [math.round(math.unit(metPts[0].v, 'm/s').toNumber('mi/h'), 1), metPts[0]]
          }
          break
        case 'met':
          if (metPts) {
            return [math.round(math.unit(metPts[0].v, 'm/s').toNumber(), 1), metPts[0]]
          } else if (impPts) {
            return [math.round(math.unit(impPts[0].v, 'mi/h').toNumber('m/s'), 1), impPts[0]]
          }
          break
      }
      return []
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
  background-color: #9081bf;
  color: #fff;
}
</style>
