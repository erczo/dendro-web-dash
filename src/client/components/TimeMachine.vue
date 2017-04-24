<template>
  <div class="component container-fluid">
    <div class="row">
      <div class="col-12 pb-4" ref="airTempChart"></div>
    </div>

    <div class="row">
      <div class="col-12 pb-4" ref="soilTempChart"></div>
    </div>

    <div class="row">
      <div class="col-12 pb-4" ref="windSpeedChart"></div>
    </div>

    <div class="row">
      <div class="col-12" ref="solarRadChart"></div>
    </div>
  </div>
</template>

<script>
// TODO: Break this into separate components
// TODO: Refactor, reduce redundancy
import $ from 'jquery'
import chroma from 'chroma-js'
import Highcharts from 'highcharts'

// TODO: Optional sync'd chart feature - not implemented
// import HighchartsDendro from '../lib/highcharts-dendro'
// HighchartsDendro(Highcharts)

import {abbr, color, solar, speed, temperature} from '../mixins/tile'

import SpeedAcc from '../accessors/SpeedAcc'
import TempAcc from '../accessors/TempAcc'
import ValueAcc from '../accessors/ValueAcc'

const CHART_HEIGHT = 380

let avgAirSpeed
let avgAirTemp
let avgSoilTemp
let avgSolarPAR
let avgSolarRad
let maxAirSpeed

/**
 * Array.sort comparison predicate for sorting dataset docs.
 */
function compareDocsByAttrsIndex (a, b) {
  const aIndex = a.datastream.__attrsInfo.index
  const bIndex = b.datastream.__attrsInfo.index

  if (aIndex !== bIndex) {
    return aIndex - bIndex
  } else if (a.datastream._id < b.datastream._id) {
    return -1
  } else if (a.datastream._id > b.datastream._id) {
    return 1
  }
  return 0
}

/**
 * Synchronize zooming through the setExtremes event handler.
 */
function syncExtremes (e) {
  let thisChart = this.chart

  // Prevent feedback loop
  if (e.trigger !== 'syncExtremes') {
    Highcharts.charts.forEach(function (chart) {
      if (chart && chart !== thisChart && chart.__custom === 'tm') {
        if (chart.xAxis[0].setExtremes) { // It is null while updating
          chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
            trigger: 'syncExtremes'
          })
        }
      }
    })
  }
}

export default {
  props: {
    // Chart datasets
    airSpeed: Object,
    airTemp: Object,
    soilTemp: Object,
    solarRad: Object,

    // Cursor-based fetching
    airSpeedCursor: null,
    airTempCursor: null,
    soilTempCursor: null,
    solarRadCursor: null,

    // Misc
    unitAbbrs: Object,
    units: String
  },

  created () {
    avgAirSpeed = new SpeedAcc(this, 'Average_Air_Speed')
    avgAirTemp = new TempAcc(this, 'Average_Air_Temperature')
    avgSoilTemp = new TempAcc(this, 'Average_Soil_Temperature')
    avgSolarPAR = new ValueAcc(this, 'Average_Solar_PhotosyntheticallyActiveRadiation')
    avgSolarRad = new ValueAcc(this, 'Average_Solar_Radiation')
    maxAirSpeed = new SpeedAcc(this, 'Maximum_Air_Speed')

    // Arrange series by datastream attributes
    avgAirTemp.docsSortPredicate = compareDocsByAttrsIndex
    avgSoilTemp.docsSortPredicate = compareDocsByAttrsIndex

    // Series data
    this.airTempData = []
    this.soilTempData = []
    this.solarRadData = [[], []]
    this.windSpeedData = [[], []]

    // Series names
    this.airTempNames = []
    this.soilTempNames = []
  },

  mounted () {
    this.airTempChart = Highcharts.chart(this.$refs.airTempChart, this.airTempOptions())
    this.soilTempChart = Highcharts.chart(this.$refs.soilTempChart, this.soilTempOptions())
    this.solarRadChart = Highcharts.chart(this.$refs.solarRadChart, this.solarRadOptions())
    this.windSpeedChart = Highcharts.chart(this.$refs.windSpeedChart, this.windSpeedOptions())

    this.charts = [this.airTempChart, this.soilTempChart, this.solarRadChart, this.windSpeedChart]
    this.charts.forEach(chart => {
      chart.showLoading()
      // HACK: Tag charts so that the global syncExtremes hander can exclude other charts on the page
      chart.__custom = 'tm'
    })

    // Remove crosshairs upon mouseleave
    $(this.$el).bind('mouseleave', (e) => {
      this.charts.forEach(chart => {
        chart.xAxis[0].hideCrosshair()
      })
    })

    // Sync crosshairs across charts
    $(this.$el).bind('mousemove touchmove touchstart', (e) => {
      this.charts.forEach(chart => {
        // Find coordinates within the chart
        const event = chart.pointer.normalize(e.originalEvent)
        if (!event) return

        // Get the hovered point
        const firstSeries = chart.series[0]
        if (!firstSeries) return

        const point = firstSeries.searchPoint(event, true)
        if (!point) return

        chart.xAxis[0].drawCrosshair(event, point)
      })
    })
  },

  beforeDestroy () {
    $(this.$el).unbind()

    this.charts.forEach(chart => {
      chart.destroy()
    })
    this.charts = null
    this.airTempChart = this.soilTempChart = this.solarRadChart = this.windSpeedChart = null
    this.airTempData = this.soilTempData = this.solarRadData = this.windSpeedData = null
    this.airTempNames = this.soilTempNames = null

    avgAirSpeed = avgAirTemp = avgSoilTemp = avgSolarPAR = avgSolarRad = maxAirSpeed = null
  },

  mixins: [abbr, color, solar, speed, temperature],

  methods: {
    airTempOptions () {
      return {
        chart: {
          height: CHART_HEIGHT,
          zoomType: 'x'
        },
        title: {
          text: 'Air Temperature'
        },
        xAxis: {
          crosshair: true,
          events: {
            setExtremes: syncExtremes
          },
          type: 'datetime',
          title: {
            text: 'Time'
          }
        },
        yAxis: [{
          title: {
            text: 'Degrees'
          }
        }, {
          gridLineWidth: 0,
          linkedTo: 0,
          title: {
            text: 'Degrees'
          },
          opposite: true
        }],
        series: []
      }
    },
    soilTempOptions () {
      return {
        chart: {
          height: CHART_HEIGHT,
          zoomType: 'x'
        },
        title: {
          text: 'Soil Temperature'
        },
        xAxis: {
          crosshair: true,
          events: {
            setExtremes: syncExtremes
          },
          type: 'datetime',
          title: {
            text: 'Time'
          }
        },
        yAxis: [{
          title: {
            text: 'Degrees'
          }
        }, {
          gridLineWidth: 0,
          linkedTo: 0,
          title: {
            text: 'Degrees'
          },
          opposite: true
        }],
        series: []
      }
    },
    solarRadOptions () {
      return {
        chart: {
          height: CHART_HEIGHT,
          zoomType: 'x'
        },
        title: {
          text: 'Solar Radiation'
        },
        xAxis: {
          crosshair: true,
          events: {
            setExtremes: syncExtremes
          },
          type: 'datetime',
          title: {
            text: 'Time'
          }
        },
        yAxis: [{
          title: {
            text: 'Total'
          }
        }, {
          gridLineWidth: 0,
          title: {
            text: 'PAR'
          },
          opposite: true
        }],
        series: []
      }
    },
    windSpeedOptions () {
      return {
        chart: {
          height: CHART_HEIGHT,
          zoomType: 'x'
        },
        title: {
          text: `Wind Speed`
        },
        xAxis: {
          crosshair: true,
          events: {
            setExtremes: syncExtremes
          },
          type: 'datetime',
          title: {
            text: 'Time'
          }
        },
        yAxis: [{
          title: {
            text: 'Speed'
          }
        }, {
          gridLineWidth: 0,
          linkedTo: 0,
          title: {
            text: 'Speed'
          },
          opposite: true
        }],
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
    airSpeed (newDataset) {
      if (!newDataset) {
        this.removeAllSeries(this.windSpeedChart)
        this.windSpeedChart.showLoading()
        this.windSpeedData = [[], []]
      } else if (this.windSpeedData) {
        this.windSpeedData[0] = this.windSpeedData[0].concat(avgAirSpeed.init(newDataset).data.map(function (point) {
          this.point = point
          return [this.time, this.spdRound]
        }, avgAirSpeed))

        this.windSpeedData[1] = this.windSpeedData[1].concat(maxAirSpeed.init(newDataset).data.map(function (point) {
          this.point = point
          return [this.time, this.spdRound]
        }, maxAirSpeed))
      }
    },
    airSpeedCursor (newCursor) {
      if (newCursor && (newCursor.start >= newCursor.end)) {
        this.windSpeedChart.addSeries({
          color: this.colors.SERIES.AIR_SPEED_AVG,
          data: this.windSpeedData[0],
          name: 'Avg',
          step: true
        })
        this.windSpeedChart.addSeries({
          color: this.colors.SERIES.AIR_SPEED_MAX,
          data: this.windSpeedData[1],
          lineWidth: 3,
          name: 'Gust',
          step: true
        })
        this.windSpeedData = null
        this.windSpeedChart.hideLoading()
        this.windSpeedChart.setTitle({
          text: `Wind Speed (${this.spdAbbr})`
        })
        this.$emit('series-added', 'airSpeed')
      }
    },
    airTemp (newDataset) {
      const vm = this
      if (!newDataset) {
        this.removeAllSeries(this.airTempChart)
        this.airTempChart.showLoading()
        this.airTempData = []
        this.airTempNames = []
      } else if (this.airTempData) {
        avgAirTemp.init(newDataset).docs.forEach(function (doc, i) {
          this.doc = doc

          // Dynamically add series based on the number of docs
          if (i >= vm.airTempData.length) {
            vm.airTempData.push([])
            vm.airTempNames.push(doc.datastream.__attrsInfo.text || (i > 0 ? `Avg ${i}` : 'Avg'))
          }

          vm.airTempData[i] = vm.airTempData[i].concat(avgAirTemp.data.map(function (point) {
            this.point = point
            return [this.time, this.degRound]
          }, this))
        }, avgAirTemp)
      }
    },
    airTempCursor (newCursor) {
      if (newCursor && (newCursor.start >= newCursor.end)) {
        const colors = this.airTempData.length < 2 ? [this.colors.SERIES.AIR_TEMP[0]] : chroma.scale(this.colors.SERIES.AIR_TEMP).colors(this.airTempData.length)

        this.airTempData.forEach((data, i) => {
          this.airTempChart.addSeries({
            color: colors[i],
            data: data,
            name: this.airTempNames[i],
            step: true,
            zIndex: i > 0 ? i : 100
          })
        })
        this.airTempData = this.airTempNames = null
        this.airTempChart.hideLoading()
        this.airTempChart.setTitle({
          text: `Air Temperature (${this.degAbbr})`
        })
        this.$emit('series-added', 'airTemp')
      }
    },
    soilTemp (newDataset) {
      const vm = this
      if (!newDataset) {
        this.removeAllSeries(this.soilTempChart)
        this.soilTempChart.showLoading()
        this.soilTempData = []
        this.soilTempNames = []
      } else if (this.soilTempData) {
        avgSoilTemp.init(newDataset).docs.forEach(function (doc, i) {
          this.doc = doc

          // Dynamically add series based on the number of docs
          if (i >= vm.soilTempData.length) {
            vm.soilTempData.push([])
            vm.soilTempNames.push(doc.datastream.__attrsInfo.text || (i > 0 ? `Avg ${i}` : 'Avg'))
          }

          vm.soilTempData[i] = vm.soilTempData[i].concat(avgSoilTemp.data.map(function (point) {
            this.point = point
            return [this.time, this.degRound]
          }, this))
        }, avgSoilTemp)
      }
    },
    soilTempCursor (newCursor) {
      if (newCursor && (newCursor.start >= newCursor.end)) {
        const colors = this.soilTempData.length < 2 ? [this.colors.SERIES.SOIL_TEMP[0]] : chroma.scale(this.colors.SERIES.SOIL_TEMP).colors(this.soilTempData.length)

        this.soilTempData.forEach((data, i) => {
          this.soilTempChart.addSeries({
            color: colors[i],
            data: data,
            name: this.soilTempNames[i],
            step: true,
            zIndex: i > 0 ? i : 100
          })
        })
        this.soilTempData = this.soilTempNames = null
        this.soilTempChart.hideLoading()
        this.soilTempChart.setTitle({
          text: `Soil Temperature (${this.degAbbr})`
        })
        this.$emit('series-added', 'soilTemp')
      }
    },
    solarRad (newDataset) {
      if (!newDataset) {
        this.removeAllSeries(this.solarRadChart)
        this.solarRadChart.showLoading()
        this.solarRadData = [[], []]
      } else if (this.solarRadData) {
        this.solarRadData[0] = this.solarRadData[0].concat(avgSolarRad.init(newDataset).data.map(function (point) {
          this.point = point
          return [this.time, this.valRound]
        }, avgSolarRad))

        this.solarRadData[1] = this.solarRadData[1].concat(avgSolarPAR.init(newDataset).data.map(function (point) {
          this.point = point
          return [this.time, this.valRound]
        }, avgSolarPAR))
      }
    },
    solarRadCursor (newCursor) {
      if (newCursor && (newCursor.start >= newCursor.end)) {
        this.solarRadChart.addSeries({
          color: this.colors.SERIES.SOLAR_RAD,
          data: this.solarRadData[0],
          lineWidth: 3,
          name: `Total (${this.radAbbr})`,
          step: true
        })
        this.solarRadChart.addSeries({
          color: this.colors.SERIES.SOLAR_PAR,
          data: this.solarRadData[1],
          lineWidth: 1,
          name: `PAR (${this.parAbbr})`,
          step: true,
          yAxis: 1
        })
        this.solarRadData = null
        this.solarRadChart.hideLoading()
        this.$emit('series-added', 'solarRad')
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
