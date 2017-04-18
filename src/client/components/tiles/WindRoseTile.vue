<template>
  <div class="component d-flex flex-column h-100 rounded tile" :style="{backgroundColor: colors.TILE.WIND}">
    <div class="d-flex flex-1 flex-column justify-content-center text-center" ref="windRoseChart"></div>
  </div>
</template>

<script>
import math from '../../lib/math'
import Highcharts from 'highcharts'

// Needed for polar charts
// SEE: http://www.highcharts.com/docs/export-module/setting-up-the-server
import HighchartsMore from 'highcharts-more'
HighchartsMore(Highcharts)

import {abbr, color, speed} from '../../mixins/tile'

import AirDirAcc from '../../accessors/AirDirAcc'
import AirSpeedAcc from '../../accessors/AirSpeedAcc'

let avgAirDir
let avgAirSpeed

// TODO: Use colors.js lib
const WIND_FORCE_LEVELS = [{
  color: '#5cb6dc',
  // NOTE: Ranges for display only; actual wind force index is eval'd in AirSpeedAcc
  range: [0, 3]
}, {
  color: '#aedc5c',
  range: [3.1, 5]
}, {
  color: '#f3f767',
  range: [5.1, 8]
}, {
  color: '#dcac5c',
  range: [8.1]
}]

export default {
  props: {
    // Chart config
    seriesConfig: Object,

    // Chart datasets
    airSpeed: Object,

    // Cursor-based fetching
    airSpeedCursor: null,

    // Misc
    stationTime: Number,
    systemTime: Number,
    unitAbbrs: Object,
    units: String
  },

  created () {
    avgAirDir = new AirDirAcc(this, 'Average_Air_Direction')
    avgAirSpeed = new AirSpeedAcc(this, 'Average_Air_Speed')

    // Series data
    this.initWindRoseData()
  },

  mounted () {
    this.windRoseChart = Highcharts.chart(this.$refs.windRoseChart, this.windRoseOptions())

    this.windRoseChart.showLoading()
  },

  beforeDestroy () {
    this.windRoseChart.destroy()
    this.windRoseChart = null
    this.windRoseData = null
    this.windDirByTime = null

    avgAirDir = avgAirSpeed = null
  },

  mixins: [abbr, color, speed],

  methods: {
    windRoseOptions () {
      return {
        chart: {
          backgroundColor: this.colors.TILE.WIND,
          polar: true,
          type: 'column'
        },
        legend: {
          align: 'center',
          itemStyle: {
            color: '#fff'
          },
          layout: 'horizontal',
          verticalAlign: 'top'
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
        pane: {
          size: '80%'
        },
        plotOptions: {
          series: {
            groupPadding: 0,
            pointPlacement: 'on',
            shadow: false,
            stacking: 'normal'
          }
        },
        title: {
          text: null
        },
        tooltip: {
          valueSuffix: '%'
        },
        xAxis: {
          categories: AirDirAcc.DIR_NAMES,
          gridLineColor: 'rgba(255, 255, 255, 0.4)',
          labels: {
            style: {
              color: 'rgba(255, 255, 255, 0.4)'
            }
          },
          lineColor: 'rgba(255, 255, 255, 0.4)',
          tickmarkPlacement: 'on'
        },
        yAxis: {
          endOnTick: false,
          gridLineColor: '#fff',
          labels: {
            formatter: function () {
              return this.value + '%'
            },
            style: {
              color: '#fff'
            }
          },
          min: 0,
          reversedStacks: false,
          showLastLabel: true,
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
    initWindRoseData () {
      this.numReadings = 0

      this.windRoseData = {}
      WIND_FORCE_LEVELS.forEach((_, i) => {
        this.windRoseData[i] = new Array(AirDirAcc.DIR_NAMES.length).fill(0)
      })

      // Used to correlate wind direction and speed datapoints
      this.windDirByTime = {}
    },
    meterPerSecToUnitNum (mps) {
      return avgAirSpeed.roundSpd(avgAirSpeed.unitToSpdNum(math.unit(mps, 'm/s')))
    },
    // TODO: Move to a mixin
    removeAllSeries (chart) {
      while (chart.series.length > 0) {
        chart.series[0].remove()
      }
    },
    seriesName (range) {
      const m = this.meterPerSecToUnitNum(range[0])
      if (range.length > 1) {
        const n = this.meterPerSecToUnitNum(range[1])
        return `${m}-${n} ${this.spdAbbr}`
      }
      return `${m}+ ${this.spdAbbr}`
    }
  },

  watch: {
    airSpeed (newDataset) {
      const vm = this
      if (!newDataset) {
        this.removeAllSeries(this.windRoseChart)
        this.windRoseChart.showLoading()
        this.initWindRoseData()
      } else if (this.windRoseData) {
        avgAirDir.init(newDataset).data.forEach(function (point) {
          this.point = point
          vm.windDirByTime[this.time] = this.dirIndex
        }, avgAirDir)

        avgAirSpeed.init(newDataset).data.forEach(function (point) {
          this.point = point

          const dirIndex = vm.windDirByTime[this.time]
          const spdIndex = this.spdIndex

          if (typeof dirIndex === 'number' && typeof spdIndex === 'number') {
            // Count the number of occasions the wind speed falls within each bin
            vm.windRoseData[spdIndex][dirIndex]++
            vm.numReadings++
          }
        }, avgAirSpeed)
      }
    },
    airSpeedCursor (newCursor) {
      if (newCursor && (newCursor.start >= newCursor.end)) {
        WIND_FORCE_LEVELS.forEach((level, spdIndex) => {
          this.windRoseChart.addSeries({
            color: level.color,
            data: this.windRoseData[spdIndex].map((n, dirIndex) => {
              return [dirIndex, math.round(n / this.numReadings * 100, 1)]
            }),
            name: this.seriesName(level.range)
          })
        })
        this.windRoseData = this.windDirByTime = null
        this.windRoseChart.hideLoading()
        this.$emit('series-added', 'airSpeed')
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
