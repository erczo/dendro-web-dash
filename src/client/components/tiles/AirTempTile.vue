<template>
  <div class="d-flex flex-column h-100 rounded tile">

    <div class="d-flex flex-1 flex-column justify-content-center text-center border-bottom">
      <h1 class="display-3">{{ average | placeholder }}
        <i class="wi wi-fahrenheit" v-if="units === 'imp'"></i>
        <i class="wi wi-celsius" v-if="units === 'met'"></i>
      </h1>
      <span class="text-muted">Air Temperature</span>
    </div>

    <div class="d-flex flex-1 flex-row">
      <div class="d-flex flex-1 flex-column justify-content-center text-center bg-darken">
        <h2>{{ minimum | placeholder }}°</h2>
        <span class="text-muted">Seasonal Low</span>
      </div>
      <div class="d-flex flex-1 flex-column justify-content-center text-center bg-lighten">
        <h2>{{ maximum | placeholder }}°</h2>
        <span class="text-muted">Seasonal High</span>
      </div>
    </div>

    <div class="d-flex flex-column justify-content-center py-2 text-center text-muted">
    <!-- TODO: Derive from seasonal time -->
      October
    </div>

  </div>
</template>

<script>
// TODO: Finish
// TODO: Make colors props?
import math from '../../math'

export default {
  props: {
    station: Object,
    datapoints: Object,
    units: String
  },

  computed: {
    average: function () {
      return this.getValue('Average_Air_Temperature_DegreeFahrenheit', 'Average_Air_Temperature_DegreeCelsius')
    },
    maximum: function () {
      // FIX: Seasonal data is NOT the min and max values
      return this.getValue('Maximum_Air_Temperature_DegreeFahrenheit', 'Maximum_Air_Temperature_DegreeCelsius')
    },
    minimum: function () {
      // FIX: Seasonal data is NOT the min and max values
      return this.getValue('Minimum_Air_Temperature_DegreeFahrenheit', 'Minimum_Air_Temperature_DegreeCelsius')
    }
  },

  methods: {
    getValue (impKey, metKey) {
      if (!this.datapoints) return null

      switch (this.units) {
        case 'imp':
          if (this.datapoints[impKey]) {
            return math.round(math.unit(this.datapoints[impKey][0].v, 'degF').toNumber(), 1)
          } else if (this.datapoints[metKey]) {
            return math.round(math.unit(this.datapoints[metKey][0].v, 'degC').toNumber('degF'), 1)
          }
          break
        case 'met':
          if (this.datapoints[metKey]) {
            return math.round(math.unit(this.datapoints[metKey][0].v, 'degC').toNumber(), 1)
          } else if (this.datapoints[impKey]) {
            return math.round(math.unit(this.datapoints[impKey][0].v, 'degF').toNumber('degC'), 1)
          }
          break
      }
      return null
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
