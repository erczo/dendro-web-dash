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
// TODO: Make colors props?
import math from '../../lib/math'

export default {
  props: {
    current: Object,
    seasonal: Object,
    units: String
  },

  computed: {
    average: function () {
      return this.getValue(this.current, 'Average_Air_Temperature_DegreeFahrenheit', 'Average_Air_Temperature_DegreeCelsius')
    },
    maximum: function () {
      return this.getValue(this.seasonal, 'Maximum_Seasonal_Air_Temperature_DegreeFahrenheit', 'Maximum_Seasonal_Air_Temperature_DegreeCelsius')
    },
    minimum: function () {
      return this.getValue(this.seasonal, 'Minimum_Seasonal_Air_Temperature_DegreeFahrenheit', 'Minimum_Seasonal_Air_Temperature_DegreeCelsius')
    }
  },

  methods: {
    getValue (prop, impKey, metKey) {
      if (!prop) return

      switch (this.units) {
        case 'imp':
          if (prop[impKey]) {
            return math.round(math.unit(prop[impKey][0].v, 'degF').toNumber(), 1)
          } else if (prop[metKey]) {
            return math.round(math.unit(prop[metKey][0].v, 'degC').toNumber('degF'), 1)
          }
          break
        case 'met':
          if (prop[metKey]) {
            return math.round(math.unit(prop[metKey][0].v, 'degC').toNumber(), 1)
          } else if (prop[impKey]) {
            return math.round(math.unit(prop[impKey][0].v, 'degF').toNumber('degC'), 1)
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
.tile {
  background-color: #509ebf;
  color: #fff;
}
</style>
