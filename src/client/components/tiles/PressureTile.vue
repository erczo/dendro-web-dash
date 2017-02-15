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
import air from '../../lib/air'
import math from '../../lib/math'
import Highcharts from 'highcharts'

export default {
  props: {
    coordinates: Array,
    current: Object,
    twoWeeks: Object,
    time: Date,
    utcOffset: Number,
    unitAbbrs: Object,
    units: String
  },

  data () {
    return {
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

  mounted () {
    this.chart = Highcharts.chart(this.$el.getElementsByClassName('chart')[0], this.opts)
    console.log('current', this.current)
  },

  computed: {
    curAvg: function () {
      return this.getCurPres('Average_Air_BarometricPressure_PoundForcePerSquareInch', 'Average_Air_BarometricPressure_Millibar')[0]
    },
    elevOffset: function () {
      const curPres = this.getCurPres('Average_Air_BarometricPressure_PoundForcePerSquareInch', 'Average_Air_BarometricPressure_Millibar')[0]
      const elevPres = this.getElevPres()
      if (typeof curPres !== 'number' || typeof elevPres !== 'number') return

      // TODO: Discuss this approach - diff. of rounded values
      return elevPres - curPres
    },
    presAbbr: function () {
      switch (this.units) {
        case 'imp':
          return this.getAbbr('PoundForcePerSquareInch')
        case 'met':
          return this.getAbbr('Millibar')
      }
      return
    }
  },

  methods: {
    getAbbr (key) {
      if (!this.unitAbbrs) return ''
      return this.unitAbbrs[key]
    },
    getCurPres (...args) {
      return this.getPres(this.current, ...args)
    },
    getElevPres: function () {
      if (!this.coordinates) return

      const pa = math.unit(air.pressure(this.coordinates[2]), 'Pa')

      switch (this.units) {
        case 'imp':
          return math.round(pa.toNumber('psi'), 1)
        case 'met':
          return math.round(pa.toNumber('mbar'), 0)
      }
      return
    },
    getPres (prop, impKey, metKey) {
      if (!prop) return []

      const [impPts, metPts] = [prop[impKey], prop[metKey]]

      switch (this.units) {
        case 'imp':
          if (impPts) {
            return [math.round(math.unit(impPts[0].v, 'psi').toNumber(), 1), impPts[0]]
          } else if (metPts) {
            return [math.round(math.unit(metPts[0].v, 'mbar').toNumber('psi'), 1), metPts[0]]
          }
          break
        case 'met':
          if (metPts) {
            return [math.round(math.unit(metPts[0].v, 'mbar').toNumber(), 0), metPts[0]]
          } else if (impPts) {
            return [math.round(math.unit(impPts[0].v, 'psi').toNumber('mbar'), 0), impPts[0]]
          }
          break
      }
      return []
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
