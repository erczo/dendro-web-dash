<template>
  <div class="component d-flex flex-column justify-content-center h-100 rounded tile" style="position: relative;" :style="{backgroundColor}">
    <div class="align-self-center" style="position: absolute;" v-if="isPending">
      <span class="badge badge-pill badge-default px-4 py-4" style="opacity: 0.9;">Calculating...</span>
    </div>

    <!-- TODO: Re-enable after data is ready: x-border-bottom -->
    <div class="d-flex flex-1 flex-row justify-content-center text-center x-border-bottom">
      <div class="d-flex flex-1 flex-column justify-content-center text-center">
        <h1 class="display-4">{{ cytdCu | placeholder }} <span class="hidden-sm-down"><i class="wi wi-umbrella"></i></span></h1>
        <span class="text-muted">Precip<span class="hidden-sm-down">itation</span> to Date ({{ lenAbbr }})</span>
      </div>
      <div class="d-flex flex-1 flex-column justify-content-center text-center bg-lighten">
        <h2>{{ pytdCu | placeholder }}</h2>
        <span class="text-muted">Last YTD<br />Cumulative ({{ lenAbbr }})</span>
      </div>
    </div>

    <!-- TODO: Re-enable after data is ready -->
    <!-- <div class="d-flex flex-1 flex-column justify-content-center text-center" ref="precipChart"></div> -->
  </div>
</template>

<script>
import chroma from 'chroma-js'
import math from '../../lib/math'
// TODO: Re-enable after data is ready
// import Highcharts from 'highcharts'

import {abbr, color, length} from '../../mixins/tile'

import LengthAcc from '../../accessors/LengthAcc'

let lengthAcc

export default {
  props: {
    // Tile aggs
    currentYTD: Object,
    priorYTD: Object,

    // Misc
    stationTime: Number,
    systemTime: Number,
    unitAbbrs: Object,
    units: String
  },

  created () {
    lengthAcc = new LengthAcc(this)
  },

  beforeDestroy () {
    lengthAcc = null
  },

  // TODO: Re-enable after data is ready
  // created () {
  //   cuDayPrecipHeight = new LengthAcc(this, 'Cumulative_Day_Precipitation_Height')

  //   // Series data
  //   this.precipData = {}
  // },

  // mounted () {
  //   this.precipChart = Highcharts.chart(this.$refs.precipChart, this.precipOptions())

  //   this.precipChart.showLoading()
  // },

  // beforeDestroy () {
  //   this.precipChart.destroy()
  //   this.precipChart = null
  //   this.precipData = null

  //   cuDayPrecipHeight = null
  // },

  mixins: [abbr, color, length],

  computed: {
    cytdCu () {
      const agg = this.currentYTD
      if (agg && agg.result && agg.result.data && agg.result.data[0]) {
        const n = lengthAcc.unitToLenNum(math.unit(agg.result.data[0].v_sum.value, 'mm'))
        return lengthAcc.roundLen(n)
      }
    },
    pytdCu () {
      const agg = this.priorYTD
      if (agg && agg.result && agg.result.data && agg.result.data[0]) {
        const n = lengthAcc.unitToLenNum(math.unit(agg.result.data[0].v_sum.value, 'mm'))
        return lengthAcc.roundLen(n)
      }
    },
    backgroundColor () {
      return this.isPending ? chroma(this.colors.TILE.PRECIP).alpha(0.5).css() : this.colors.TILE.PRECIP
    },
    isPending () {
      return (this.currentYTD && this.currentYTD.status) ||
        (this.priorYTD && this.priorYTD.status)
    }
  }

  // TODO: Re-enable after data is ready
  // methods: {
  //   precipOptions () {
  //     return {
  //       chart: {
  //         backgroundColor: this.colors.TILE.PRECIP,
  //         height: 120,
  //         zoomType: 'x'
  //       },
  //       legend: {
  //         align: 'right',
  //         itemStyle: {
  //           color: '#fff'
  //         },
  //         layout: 'vertical',
  //         verticalAlign: 'middle'
  //       },
  //       loading: {
  //         labelStyle: {
  //           color: '#fff'
  //         },
  //         style: {
  //           backgroundColor: '#000',
  //           opacity: 0.2
  //         }
  //       },
  //       title: {
  //         text: null
  //       },
  //       tooltip: {
  //         headerFormat: '{point.x:%b %e}<br />'
  //       },
  //       xAxis: {
  //         dateTimeLabelFormats: {
  //           // Don't display the dummy year
  //           month: '%e. %b',
  //           year: '%b'
  //         },
  //         gridLineColor: 'rgba(255, 255, 255, 0.4)',
  //         labels: {
  //           style: {
  //             color: 'rgba(255, 255, 255, 0.4)'
  //           }
  //         },
  //         lineColor: 'rgba(255, 255, 255, 0.4)',
  //         type: 'datetime'
  //       },
  //       yAxis: {
  //         gridLineColor: '#fff',
  //         labels: {
  //           style: {
  //             color: '#fff'
  //           }
  //         },
  //         title: {
  //           style: {
  //             color: '#fff'
  //           },
  //           text: null
  //         }
  //       },
  //       series: []
  //     }
  //   },
  //   // TODO: Move to a mixin
  //   removeAllSeries (chart) {
  //     while (chart.series.length > 0) {
  //       chart.series[0].remove()
  //     }
  //   }
  // }

  // watch: {
  //   precip (newDataset) {
  //     const vm = this
  //     if (!newDataset) {
  //       this.removeAllSeries(this.precipChart)
  //       this.precipChart.showLoading()
  //       this.precipData = {}
  //     } else if (this.precipData) {
  //       cuDayPrecipHeight.init(newDataset).data.forEach(function (point) {
  //         this.point = point

  //         const date = new Date(this.time)
  //         const dd = date.getUTCDate()
  //         const mm = date.getUTCMonth() // Zero-based
  //         const yy = date.getUTCFullYear()
  //         const wy = mm > 8 ? yy : yy - 1

  //         if (!vm.precipData[wy]) vm.precipData[wy] = {d: [], sum: 0}

  //         vm.precipData[wy].sum += this.rawLen
  //         vm.precipData[wy].d.push([
  //           /*
  //             All series have a dummy year in order to be compared on the same x axis.
  //             Make sure we use a leap year (e.g. 1972)!
  //            */
  //           Date.UTC(mm > 8 ? 1971 : 1972, mm, dd), // Make sure we use a leap year
  //           this.roundLen(this.unitToLenNum(this.rawLenToUnit(vm.precipData[wy].sum)))
  //         ])
  //       }, cuDayPrecipHeight)
  //     }
  //   },
  //   precipCursor (newCursor) {
  //     if (newCursor && (newCursor.start >= newCursor.end)) {
  //       const waterYears = Object.keys(this.precipData)
  //       waterYears.forEach((wy, i) => {
  //         const data = this.precipData[wy]
  //         this.precipChart.addSeries({
  //           // TODO: Use colors.js lib
  //           color: i === waterYears.length - 1 ? '#f3f767' : '#fff',
  //           data: data.d,
  //           name: `wy${wy}`,
  //           step: true
  //         })
  //       })

  //       /*
  //         Update tile stats
  //        */

  //       let lastDate = 0

  //       // Current YTD Cumulative
  //       // HACK: Obtain the last point from the current WY series
  //       if (waterYears.length > 0) {
  //         const wy = waterYears[waterYears.length - 1]
  //         const data = this.precipData[wy]
  //         if (data.d.length > 0) {
  //           const lastPt = data.d[data.d.length - 1]
  //           lastDate = lastPt[0]
  //           this.cytdCu = lastPt[1]
  //         }
  //       }

  //       // Prior YTD Cumulative
  //       // HACK: Using the datetime from the current WY series, find a nearby point in the prior WY series
  //       if (lastDate > 0 && waterYears.length > 1) {
  //         const wy = waterYears[waterYears.length - 2]
  //         const data = this.precipData[wy]
  //         const ptIndex = data.d.findIndex(pt => { return pt[0] > lastDate })
  //         if (ptIndex > 1) {
  //           const lastPt = data.d[ptIndex - 1]
  //           this.pytdCu = lastPt[1]
  //         }
  //       }

  //       this.precipData = null
  //       this.precipChart.hideLoading()
  //       this.$emit('series-added', 'wyPrecip')
  //     }
  //   }
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tile {
  color: #fff;
}
</style>
