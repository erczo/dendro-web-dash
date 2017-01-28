<template>
  <div class="d-flex flex-column h-100 rounded tile">

    <div class="d-flex flex-1 flex-column justify-content-center text-center border-bottom">
      <h1 class="display-4">{{ average | placeholder }}
        <i class="wi wi-wind" :class="'wi-from-' + direction.toLowerCase()" v-if="direction"></i>
        <small>{{ direction | placeholder }}</small>
      </h1>
      <span class="text-muted">Wind Speed ({{ unitAbbr }})</span>
    </div>

    <div class="d-flex flex-1 flex-row">
      <table class="table table-sm">
        <tbody>
          <tr class="bg-lighten">
            <th class="text-muted" scope="row">Daytime Average</th>
            <td class="h2 text-right">1.3</td>
          </tr>
<!-- NOTE: Not implemented -->
<!--
          <tr class="bg-darken">
            <th class="text-muted" scope="row">Nighttime Average</th>
            <td class="h2 text-right">0.3</td>
          </tr>
-->
          <tr>
            <th class="text-muted" scope="row">Seasonal Gusts</th>
            <td class="h2 text-right">6.9</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="d-flex flex-column justify-content-center py-2 text-center text-muted">
      October
    </div>

  </div>
</template>

<script>
// TODO: Make colors props?
import math from '../../lib/math'
import {windDegToIndex} from '../../lib/utils'

const DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']

export default {
  props: {
    current: Object,
    seasonal: Object,
    unitAbbrs: Object,
    units: String
  },

  computed: {
    average: function () {
      return this.getValue(this.current, 'Average_Air_Speed_MilePerHour', 'Average_Air_Speed_MeterPerSecond')
    },
    direction: function () {
      if (!this.current) return
      const pts = this.current.Average_Air_Direction_DegreeAngle
      return pts ? DIRECTIONS[windDegToIndex(pts[0].v)] : null
    },
    unitAbbr: function () {
      switch (this.units) {
        case 'imp':
          return this.getUnitAbbr('MilePerHour')
        case 'met':
          return this.getUnitAbbr('MeterPerSecond')
      }
      return
    }
  },

  methods: {
    getUnitAbbr (key) {
      if (!this.unitAbbrs) return ''
      return this.unitAbbrs[key]
    },
    getValue (prop, impKey, metKey) {
      if (!prop) return

      switch (this.units) {
        case 'imp':
          if (prop[impKey]) {
            return math.round(math.unit(prop[impKey][0].v, 'mi/h').toNumber(), 1)
          } else if (prop[metKey]) {
            return math.round(math.unit(prop[metKey][0].v, 'm/s').toNumber('mi/h'), 1)
          }
          break
        case 'met':
          if (prop[metKey]) {
            return math.round(math.unit(prop[metKey][0].v, 'm/s').toNumber(), 1)
          } else if (prop[impKey]) {
            return math.round(math.unit(prop[impKey][0].v, 'mi/h').toNumber('m/s'), 1)
          }
          break
      }
      return
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
