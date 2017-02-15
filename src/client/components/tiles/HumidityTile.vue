<template>
  <div class="d-flex flex-column h-100 rounded tile">

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
// TODO: Show warning/indicator if current readings are older than 24 hours
// TODO: Make colors props?
import math from '../../lib/math'
import moment from 'moment'

export default {
  props: {
    current: Object,
    seasonal: Object,
    time: Date,
    utcOffset: Number
  },

  computed: {
    curAvg: function () {
      return this.getCurPct('Average_Air_Moisture_Percent')[0]
    },
    seasMax: function () {
      return this.getSeasPct('Maximum_Seasonal_Air_Moisture_Percent')[0]
    },
    seasMin: function () {
      return this.getSeasPct('Minimum_Seasonal_Air_Moisture_Percent')[0]
    },
    seasMonth: function () {
      // TODO: Verify approach for seasonal month names (A or B below)
      // A. Use current station time to get a month name
      if (!this.time) return
      return moment(this.time).utcOffset(this.utcOffset / 60).format('MMMM')
      // B. Harvest the time from a datapoint to get a month name
      // const pt = this.getSeasPct('Maximum_Seasonal_Air_Moisture_Percent')[1]
      // if (pt) return moment(pt.t).utcOffset(pt.o / 60).format('MMMM')
    }
  },

  methods: {
    getCurPct (...args) {
      return this.getPct(this.current, ...args)
    },
    getSeasPct (...args) {
      return this.getPct(this.seasonal, ...args)
    },
    getPct (prop, key) {
      if (!prop) return []

      const pts = prop[key]

      if (pts) return [math.round(pts[0].v, 1), pts[0]]
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
