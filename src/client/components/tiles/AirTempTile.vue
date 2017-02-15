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
import math from '../../lib/math'
import moment from 'moment'

export default {
  props: {
    current: Object,
    seasonal: Object,
    time: Date,
    utcOffset: Number,
    units: String
  },

  computed: {
    curAvg: function () {
      return this.getCurDeg('Average_Air_Temperature_DegreeFahrenheit', 'Average_Air_Temperature_DegreeCelsius')[0]
    },
    seasMax: function () {
      return this.getSeasDeg('Maximum_Seasonal_Air_Temperature_DegreeFahrenheit', 'Maximum_Seasonal_Air_Temperature_DegreeCelsius')[0]
    },
    seasMin: function () {
      return this.getSeasDeg('Minimum_Seasonal_Air_Temperature_DegreeFahrenheit', 'Minimum_Seasonal_Air_Temperature_DegreeCelsius')[0]
    },
    seasMonth: function () {
      // TODO: Verify approach for seasonal month names (A or B below)
      // A. Use current station time to get a month name
      if (!this.time) return
      return moment(this.time).utcOffset(this.utcOffset / 60).format('MMMM')
      // B. Harvest the time from a datapoint to get a month name
      // const pt = this.getSeasDeg('Maximum_Seasonal_Air_Temperature_DegreeFahrenheit', 'Maximum_Seasonal_Air_Temperature_DegreeCelsius')[1]
      // if (pt) return moment(pt.t).utcOffset(pt.o / 60).format('MMMM')
    }
  },

  methods: {
    getCurDeg (...args) {
      return this.getDeg(this.current, ...args)
    },
    getSeasDeg (...args) {
      return this.getDeg(this.seasonal, ...args)
    },
    getDeg (prop, impKey, metKey) {
      if (!prop) return []

      const [impPts, metPts] = [prop[impKey], prop[metKey]]

      switch (this.units) {
        case 'imp':
          if (impPts) {
            return [math.round(math.unit(impPts[0].v, 'degF').toNumber(), 1), impPts[0]]
          } else if (metPts) {
            return [math.round(math.unit(metPts[0].v, 'degC').toNumber('degF'), 1), metPts[0]]
          }
          break
        case 'met':
          if (metPts) {
            return [math.round(math.unit(metPts[0].v, 'degC').toNumber(), 1), metPts[0]]
          } else if (impPts) {
            return [math.round(math.unit(impPts[0].v, 'degF').toNumber('degC'), 1), impPts[0]]
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
.tile {
  background-color: #509ebf;
  color: #fff;
}
</style>
