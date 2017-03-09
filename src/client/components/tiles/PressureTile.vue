<template>
  <div class="d-flex flex-column h-100 rounded tile">

    <div class="d-flex flex-1 flex-row justify-content-center text-center border-bottom">
      <div class="d-flex flex-1 flex-column justify-content-center text-center">
        <h1 class="display-4">{{ curAvg | placeholder }} <span class="hidden-sm-down"><i class="wi wi-barometer"></i></span></h1>
        <span class="text-muted"><span class="hidden-sm-down">Barometric</span> Pressure ({{ presAbbr }})</span>
      </div>
      <div class="d-flex flex-1 flex-column justify-content-center text-center bg-lighten">
        <h2>{{ elevOffset | placeholder }}</h2>
        <span class="text-muted">Elevation offset<br /><span class="hidden-sm-down">from sea level </span>({{ presAbbr }})</span>
      </div>
    </div>

    <div class="d-flex flex-1 flex-column justify-content-center text-center chart not-implemented"></div>

  </div>
</template>

<script>
// TODO: Finish
// TODO: Rename to AirPressureTile or AirPresTile?
// TODO: Show warning/indicator if current readings are older than 24 hours
// TODO: Make colors props?
import math from '../../lib/math'
import {pressure as baroPressure} from '../../lib/barometric'
import {abbr, pressure} from '../../mixins/tile'
import Highcharts from 'highcharts'

import PressureAcc from '../../accessors/PressureAcc'

let avgAirPres

export default {
  props: {
    // Tile datasets
    coordinates: Array,
    current: Object,

    // Misc
    stationTime: Number,
    systemTime: Number,
    unitAbbrs: Object,
    units: String
  },

  data () {
    return {
      curAvg: null,
      elevOffset: null,

      opts: {
        chart: {
          backgroundColor: '#509ebf',
          height: 120
        },

        colors: ['#f3f767'],

        legend: {
          enabled: false
        },

        title: {
          text: null
        },

        xAxis: {
          categories: [
            '9/28', '9/29', '9/30', '10/1', '10/2', '10/3', '10/4',
            '10/5', '10/6', '10/7', '10/8', '10/9', '10/10', '10/11'
          ],
          gridLineColor: 'rgba(255, 255, 255, 0.4)',
          labels: {
            style: {
              color: 'rgba(255, 255, 255, 0.4)'
            }
          },
          lineColor: 'rgba(255, 255, 255, 0.4)'
        },

        yAxis: {
          gridLineColor: '#fff',
          labels: {
            style: {
              color: '#fff'
            }
          },
          title: {
            style: {
              color: '#fff'
            },
            text: null
          }
        },

        series: [{
          name: 'Sample',
          // SEE: http://api.highcharts.com/highcharts/Series.setData
          data: [
            946.1, 950.3, 951.6, 951.4, 950.0, 950.0, 948.4,
            949.9, 949.8, 948.4, 946.9, 947.9, 947.7, 949.6
          ]
        }]
      }
    }
  },

  created () {
    avgAirPres = new PressureAcc(this, 'Average_Air_BarometricPressure')
  },

  mounted () {
    this.chart = Highcharts.chart(this.$el.getElementsByClassName('chart')[0], this.opts)
  },

  beforeDestroy () {
    avgAirPres = null
  },

  mixins: [abbr, pressure],

  watch: {
    current (newDataset) {
      this.curAvg = avgAirPres.init(newDataset).presRound

      const avgPres = avgAirPres.presNum
      if (this.coordinates && typeof avgPres === 'number') {
        const elevPres = avgAirPres.unitToPresNum(math.unit(baroPressure(this.coordinates[2]), 'Pa'))
        this.elevOffset = avgAirPres.roundPres(elevPres - avgPres)
      } else {
        this.elevOffset = null
      }
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
