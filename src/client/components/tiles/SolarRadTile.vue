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
import math from '../../lib/math'

export default {
  props: {
    current: Object,
    time: Date,
    unitAbbrs: Object
  },

  computed: {
    curPAR: function () {
      // TODO: Should be Average_Solar_PhotosyntheticallyActiveRadiation_MicromolePerSquareMeter
      return this.getCurVal('Average_Solar_PhotosyntheticallyActiveRadiation_Micromole')[0]
    },
    curRad: function () {
      return this.getCurVal('Average_Solar_Radiation_WattPerSquareMeter')[0]
    },
    parAbbr: function () {
      // TODO: Should be MicromolePerSquareMeter
      return this.getAbbr('Micromole')
    },
    radAbbr: function () {
      return this.getAbbr('WattPerSquareMeter')
    }
  },

  methods: {
    getAbbr (key) {
      if (!this.unitAbbrs) return ''
      return this.unitAbbrs[key]
    },
    getCurVal (...args) {
      return this.getVal(this.current, ...args)
    },
    getVal (prop, key) {
      if (!prop) return []

      const pts = prop[key]

      if (pts) return [math.round(pts[0].v, 0), pts[0]]
      return []
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
