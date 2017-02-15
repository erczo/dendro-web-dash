<template>
  <div class="d-flex flex-column h-100 rounded tile">

    <div class="d-flex flex-1 flex-column justify-content-center text-center">
      <h1 class="display-3">{{ curRate | placeholder }} <i class="wi wi-raindrops"></i></h1>
      <span class="text-muted">Current Precipitation ({{ perHourAbbr }})</span>
    </div>

    <div class="d-flex flex-1 flex-column justify-content-center text-center bg-darken">
      <h1 class="display-4">{{ ydaRate | placeholder }}</h1>
      <span class="text-muted">Yesterday’s ({{ perDayAbbr }})</span>
    </div>

  </div>
</template>

<script>
// TODO: Show warning/indicator if current readings are older than 24 hours
// TODO: Make colors props?
import math from '../../lib/math'

export default {
  props: {
    current: Object,
    yesterday: Object,
    time: Date,
    units: String,
    unitAbbrs: Object
  },

  computed: {
    curRate: function () {
      // TODO: Should be Cumulative_Precipitation_Height_InchPerHour
      // TODO: Should be Cumulative_Precipitation_Height_MillimeterPerHour
      return this.getCurRate('Cumulative_Precipitation_Height_Inch', 'Cumulative_Precipitation_Height_Millimeter')[0]
    },
    ydaRate: function () {
      // TODO: Should be Cumulative_Day_Precipitation_Height_InchPerDay
      // TODO: Should be Cumulative_Day_Precipitation_Height_MillimeterPerDay
      return this.getYdaRate('Cumulative_Day_Precipitation_Height_Inch', 'Cumulative_Day_Precipitation_Height_Millimeter')[0]
    },
    perHourAbbr: function () {
      switch (this.units) {
        case 'imp':
          // TODO: Should be InchPerHour
          return this.getAbbr('Inch')
        case 'met':
          // TODO: Should be MillimeterPerHour
          return this.getAbbr('Millimeter')
      }
      return
    },
    perDayAbbr: function () {
      switch (this.units) {
        case 'imp':
          // TODO: Should be InchPerDay
          return this.getAbbr('Inch')
        case 'met':
          // TODO: Should be MillimeterPerDay
          return this.getAbbr('Millimeter')
      }
      return
    }
  },

  methods: {
    getAbbr (key) {
      if (!this.unitAbbrs) return ''
      return this.unitAbbrs[key]
    },
    getCurRate (...args) {
      return this.getRate(this.current, ...args)
    },
    getYdaRate (...args) {
      return this.getRate(this.yesterday, ...args)
    },
    getRate (prop, impKey, metKey) {
      if (!prop) return []

      const [impPts, metPts] = [prop[impKey], prop[metKey]]

      switch (this.units) {
        case 'imp':
          if (impPts) {
            return [math.round(math.unit(impPts[0].v, 'in').toNumber(), 1), impPts[0]]
          } else if (metPts) {
            return [math.round(math.unit(metPts[0].v, 'mm').toNumber('in'), 1), metPts[0]]
          }
          break
        case 'met':
          if (metPts) {
            return [math.round(math.unit(metPts[0].v, 'mm').toNumber(), 0), metPts[0]]
          } else if (impPts) {
            return [math.round(math.unit(impPts[0].v, 'in').toNumber('mm'), 0), impPts[0]]
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
  background-color: #50bfa6;
  color: #fff;
}
</style>
