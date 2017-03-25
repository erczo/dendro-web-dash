<template>
  <div class="container">

    <div class="row">
      <div class="col-12 py-2 air-temp-chart"></div>
    </div>

    <div class="row">
      <div class="col-12 py-2 soil-temp-chart"></div>
    </div>

    <div class="row">
      <div class="col-12 py-2 wind-speed-chart"></div>
    </div>

    <div class="row">
      <div class="col-12 py-2 solar-rad-chart"></div>
    </div>

  </div>
</template>

<script>
// TODO: Finish
// TODO: Make colors props?
// TODO: Break this into separate components
// TODO: Refactor, reduce redundancy
import $ from 'jquery'
import Highcharts from 'highcharts'

// TODO: Optional sync'd chart feature - not implemented
// import HighchartsDendro from '../lib/highcharts-dendro'
// HighchartsDendro(Highcharts)

import {abbr, solar, speed, temperature} from '../mixins/tile'

import SpeedAcc from '../accessors/SpeedAcc'
import TempAcc from '../accessors/TempAcc'
import ValueAcc from '../accessors/ValueAcc'

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
      if (chart !== thisChart && chart.__custom === 'tm') {
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
    // Chart config
    seriesConfig: Object,

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
    this.airTempChart = Highcharts.chart(this.$el.getElementsByClassName('air-temp-chart')[0], this.airTempOptions())
    this.soilTempChart = Highcharts.chart(this.$el.getElementsByClassName('soil-temp-chart')[0], this.soilTempOptions())
    this.solarRadChart = Highcharts.chart(this.$el.getElementsByClassName('solar-rad-chart')[0], this.solarRadOptions())
    this.windSpeedChart = Highcharts.chart(this.$el.getElementsByClassName('wind-speed-chart')[0], this.windSpeedOptions())

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

  mixins: [abbr, solar, speed, temperature],

  methods: {
    airTempOptions () {
      return {
        chart: {
          height: 350,
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
          height: 350,
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
          height: 350,
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
          height: 350,
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
          color: '#a695dc',
          data: this.windSpeedData[0],
          name: 'Avg',
          step: true
        })
        this.windSpeedChart.addSeries({
          color: '#dc635c',
          data: this.windSpeedData[1],
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
        this.airTempData.forEach((data, i) => {
          this.airTempChart.addSeries({
            color: i > 0 ? '#dcdcdc' : '#5ca1dc',
            data: data,
            lineWidth: Math.max(2, i + 1),
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
        this.soilTempData.forEach((data, i) => {
          this.soilTempChart.addSeries({
            color: i > 0 ? '#dcdcdc' : '#aedc5c',
            data: data,
            lineWidth: Math.max(2, i + 1),
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
        this.solarRadData[0] = this.solarRadData[0].concat(avgSolarPAR.init(newDataset).data.map(function (point) {
          this.point = point
          return [this.time, this.valRound]
        }, avgSolarPAR))

        this.solarRadData[1] = this.solarRadData[1].concat(avgSolarRad.init(newDataset).data.map(function (point) {
          this.point = point
          return [this.time, this.valRound]
        }, avgSolarRad))
      }
    },
    solarRadCursor (newCursor) {
      if (newCursor && (newCursor.start >= newCursor.end)) {
        this.solarRadChart.addSeries({
          color: '#dcac5c',
          data: this.solarRadData[0],
          lineWidth: 3,
          name: `Total (${this.radAbbr})`,
          step: true
        })
        this.solarRadChart.addSeries({
          color: '#d8dc5c',
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
