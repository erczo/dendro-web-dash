<template>
  <div class="component d-flex flex-column h-100 rounded tile">
    <div class="d-flex flex-column justify-content-center py-2 text-center border-bottom" style="background-color: #999;">
      <h3 class="my-2">NOAA Forecast</h3>
    </div>

    <div class="d-flex flex-1 flex-column justify-content-center" style="overflow-x: scroll;">
      <p class="text-center py-2" v-if="!days">Loading...</p>

      <table class="table" v-else>
        <thead>
          <tr>
            <th style="width: 10%" v-for="day in days">{{ day.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-for="day in days"><img class="rounded" :src="day.dt.condIcon" /></td>
          </tr>
          <tr>
            <td v-for="day in days">
              {{ day.dt.weatherSummary }}<br />
              <span class="text-danger" v-if="day.dt.maxTemp">High {{ day.dt.maxTemp }}
                <i class="wi wi-fahrenheit" v-if="units === 'imp'"></i>
                <i class="wi wi-celsius" v-if="units === 'met'"></i>
              </span>
            </td>
          </tr>
          <tr>
            <td v-for="day in days"><img class="rounded" :src="day.nt.condIcon" /></td>
          </tr>
          <tr>
            <td v-for="day in days">
              {{ day.nt.weatherSummary }}<br />
              <span class="text-info" v-if="day.nt.minTemp">Low {{ day.nt.minTemp }}
                <i class="wi wi-fahrenheit" v-if="units === 'imp'"></i>
                <i class="wi wi-celsius" v-if="units === 'met'"></i>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
// TODO: Finish
// TODO: Make colors props?
import moment from 'moment'

import {abbr, color} from '../../mixins/tile'

import DataAcc from '../../accessors/DataAcc'
import TempAcc from '../../accessors/TempAcc'
// TODO: Remove - may not implement this
// import ValueAcc from '../../accessors/ValueAcc'
// const VALUE_ACC_OPTIONS = {
//   round: 1
// }

let condIcon
let maxTemp
let minTemp
// TODO: Remove - may not implement this
// let probPrecip
let weatherSummary

export default {
  props: {
    // Tile datasets
    forecast: Object,

    // Misc
    stationTime: Number,
    systemTime: Number,
    unitAbbrs: Object,
    units: String
  },

  data () {
    return {
      days: null
    }
  },

  created () {
    condIcon = new DataAcc(this, 'ForecastNWS_Summarized_ConditionsIcon_7Day_12Hourly')
    maxTemp = new TempAcc(this, 'Summarized_Temperature_7Day_12Hourly_Maximum')
    minTemp = new TempAcc(this, 'Summarized_Temperature_7Day_12Hourly_Minimum')
    // TODO: Remove - may not implement this
    // probPrecip = new ValueAcc(this, 'Summarized_ProbabilityOfPrecipitation_7Day_12Hourly', VALUE_ACC_OPTIONS)
    weatherSummary = new DataAcc(this, 'Summarized_Weather_7Day_12Hourly')
  },

  beforeDestroy () {
    // TODO: Remove - may not implement this
    // condIcon = maxTemp = minTemp = probPrecip = weatherSummary = null
    condIcon = maxTemp = minTemp = weatherSummary = null
  },

  mixins: [abbr, color],

  watch: {
    forecast (newDataset) {
      if (!newDataset) {
        this.days = null
      } else {
        const bins = {}

        // Gets or creates an object for binning data
        const getBin = function (time) {
          const m = moment(time).utc()
          const h = m.hour()
          const t = m.startOf('d').valueOf()

          // Create a bin with daytime and nighttime values
          if (!bins[t]) bins[t] = {dt: {}, nt: {}, name: m.format('dddd')}

          return h >= 18 ? bins[t].nt : bins[t].dt
        }

        condIcon.init(newDataset).data.forEach(function (point) {
          this.point = point
          const bin = getBin(this.time)
          const d = this.rawData
          if (d && d.url) bin.condIcon = d.url
        }, condIcon)

        maxTemp.init(newDataset).data.forEach(function (point) {
          this.point = point
          const bin = getBin(this.time)
          bin.maxTemp = this.degRound
        }, maxTemp)

        minTemp.init(newDataset).data.forEach(function (point) {
          this.point = point
          const bin = getBin(this.time)
          bin.minTemp = this.degRound
        }, minTemp)

        // TODO: Remove - may not implement this
        // probPrecip.init(newDataset).data.forEach(function (point) {
        //   this.point = point
        //   const bin = getBin(this.time)
        //   bin.probPrecip = this.valRound
        // }, probPrecip)

        weatherSummary.init(newDataset).data.forEach(function (point) {
          this.point = point
          const bin = getBin(this.time)
          const d = this.rawData
          if (d && d.summary) bin.weatherSummary = d.summary
        }, weatherSummary)

        const days = []

        Object.keys(bins).sort((a, b) => {
          return a - b // Ensure keys are sorted numerically
        }).forEach(key => {
          days.push(bins[key])
        })

        this.days = days.filter(day => {
          return day.dt.condIcon || day.nt.condIcon
        })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  color: #fff;
}

.table {
  font-size: 86%;
}
.table td {
  border-top: none;
  border-right: 1px solid #e1e1e1;
}
.table th,
.table td {
  text-align: center;
}

.tile {
  background-color: #fff;
}
</style>
