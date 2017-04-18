<template>
  <div class="component d-flex flex-column h-100 rounded tile" :style="{backgroundColor: colors.TILE.AIR_PRES}">
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

    <div class="d-flex flex-1 flex-column justify-content-center text-center" ref="airPresChart"></div>
  </div>
</template>

<script>
import math from '../../lib/math'
import Highcharts from 'highcharts'

import {pressure as baroPressure} from '../../lib/barometric'
import {abbr, color, pressure} from '../../mixins/tile'

import PresAcc from '../../accessors/PresAcc'

let avgAirPres

export default {
  props: {
    // Tile datasets
    coordinates: Array,
    current: Object,

    // Chart config
    seriesConfig: Object,

    // Chart datasets
    airPres: Object,

    // Cursor-based fetching
    airPresCursor: null,

    // Misc
    stationTime: Number,
    systemTime: Number,
    unitAbbrs: Object,
    units: String
  },

  data () {
    return {
      curAvg: null,
      elevOffset: null
    }
  },

  created () {
    avgAirPres = new PresAcc(this, 'Average_Air_BarometricPressure')

    // Series data
    this.airPresData = []
  },

  mounted () {
    this.airPresChart = Highcharts.chart(this.$refs.airPresChart, this.airPresOptions())

    this.airPresChart.showLoading()
  },

  beforeDestroy () {
    this.airPresChart.destroy()
    this.airPresChart = null
    this.airPresData = null

    avgAirPres = null
  },

  mixins: [abbr, color, pressure],

  methods: {
    airPresOptions () {
      return {
        chart: {
          backgroundColor: this.colors.TILE.AIR_PRES,
          height: 120,
          zoomType: 'x'
        },
        legend: {
          enabled: false
        },
        loading: {
          labelStyle: {
            color: '#fff'
          },
          style: {
            backgroundColor: '#000',
            opacity: 0.2
          }
        },
        title: {
          text: null
        },
        xAxis: {
          gridLineColor: 'rgba(255, 255, 255, 0.4)',
          labels: {
            style: {
              color: 'rgba(255, 255, 255, 0.4)'
            }
          },
          lineColor: 'rgba(255, 255, 255, 0.4)',
          type: 'datetime'
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
        series: []
      }
    },
    // TODO: Move to a mixin
    removeAllSeries (chart) {
      while (chart.series.length > 0) {
        chart.series[0].remove()
      }
    }
  },

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
    },
    airPres (newDataset) {
      if (!newDataset) {
        this.removeAllSeries(this.airPresChart)
        this.airPresChart.showLoading()
        this.airPresData = []
      } else if (this.airPresData) {
        this.airPresData = this.airPresData.concat(avgAirPres.init(newDataset).data.map(function (point) {
          this.point = point
          return [this.time, this.presRound]
        }, avgAirPres))
      }
    },
    airPresCursor (newCursor) {
      if (newCursor && (newCursor.start >= newCursor.end)) {
        this.airPresChart.addSeries({
          // TODO: Use colors.js lib
          color: '#f3f767',
          data: this.airPresData,
          name: 'Avg',
          step: true
        })
        this.airPresData = null
        this.airPresChart.hideLoading()
        this.$emit('series-added', 'airPres')
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tile {
  color: #fff;
}
</style>
