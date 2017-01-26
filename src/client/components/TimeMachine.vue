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

import Highcharts from 'highcharts'

// TODO: Sync'd charts to be implemented later
// import HighchartsDendro from '../lib/highcharts-dendro'

// HighchartsDendro(Highcharts)

// function syncExtremes(e) {
//   let thisChart = this.chart;

//   // Prevent feedback loop
//   if (e.trigger !== 'syncExtremes') {
//     Highcharts.each(Highcharts.charts, function (chart) {
//       if (chart !== thisChart) {
//         if (chart.xAxis[0].setExtremes) { // It is null while updating
//           chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
//         }
//       }
//     });
//   }
// }

export default {
  data () {
    let categories = [
      '9/28', '9/29', '9/30', '10/1', '10/2', '10/3', '10/4',
      '10/5', '10/6', '10/7', '10/8', '10/9', '10/10', '10/11'
    ]

    return {

      // Air temp
      airTempOpts: {
        chart: {
          height: 350
        },

        colors: ['#999', '#5cb6dc', '#5cdcbf'],

        title: {
          text: 'Air Temperature (°C)'
        },

        xAxis: {
          categories: categories
        },

        yAxis: {
          title: {
            text: null
          }
        },

        series: [{
          name: 'Avg',
          data: [
            22.0, 18.2, 12.2, 12.3, 10.5, 10.5, 11.4, 11.2, 14.2, 17.3, 19.9, 19.6, 15.9, 12.8
          ]
        }, {
          name: '2 m',
          data: [
            21.6, 17.9, 12.0, 12.1, 10.3, 10.4, 11.2, 11.0, 13.9, 17.1, 19.6, 19.3, 15.6, 12.5
          ]
        }, {
          name: '10 m',
          data: [
            21.9, 18.2, 11.9, 12.0, 10.3, 10.6, 11.2, 11.2, 14.4, 17.7, 20.2, 19.8, 15.9, 11.7
          ]
        }]
      },

      // Soil temp
      soilTempOpts: {
        chart: {
          height: 350
        },

        colors: ['#5cb6dc', '#5cdcbf', '#aedc5c', '#999'],

        title: {
          text: 'Soil Temperature (°C)'
        },

        xAxis: {
          categories: categories
        },

        yAxis: {
          title: {
            text: null
          }
        },

        series: [{
          name: '2 in',
          data: [25.3, 24.1, 22.1, 20.8, 19.0, 18.0, 18.5, 18.0, 18.3, 19.1, 20.0, 20.7, 20.7, 20.1]
        }, {
          name: '4 in',
          data: [24.8, 24.1, 22.5, 21.2, 19.7, 18.7, 18.8, 18.5, 18.6, 19.2, 19.9, 20.6, 20.7, 20.1]
        }, {
          name: '8 in',
          data: [24.1, 23.8, 22.7, 21.6, 20.5, 19.5, 19.2, 19.0, 18.9, 19.2, 19.8, 20.3, 20.5, 20.3]
        }, {
          name: '20 in',
          data: [22.9, 23.0, 22.9, 22.4, 21.9, 21.4, 20.8, 20.5, 20.3, 20.2, 20.2, 20.4, 20.6, 20.7]
        }]
      },

      // Wind speed
      windSpeedOpts: {
        chart: {
          height: 350
        },

        colors: ['#a695dc', '#dc635c'],

        title: {
          text: 'Wind Speed (m/s)'
        },

        xAxis: {
          categories: categories
        },

        yAxis: {
          title: {
            text: null
          }
        },

        series: [{
          name: 'Avg',
          data: [1.0, 1.0, 1.8, 2.2, 2.2, 0.9, 1.7, 1.7, 1.3, 1.2, 0.9, 1.0, 1.0, 1.3]
        }, {
          name: 'Gust',
          data: [3.3, 3.3, 4.5, 4.6, 5.4, 2.8, 4.8, 4.9, 4.6, 3.1, 3.2, 3.5, 3.6, 3.0]
        }]
      },

      // Solar radiation
      solarRadOpts: {
        chart: {
          height: 350
        },

        colors: ['#dcac5c', '#f3f767'],

        title: {
          text: 'Solar Radiation'
        },

        xAxis: {
          categories: categories
        },

        yAxis: {
          title: {
            text: null
          }
        },

        series: [{
          name: 'Total (W/m2)',
          data: [198.4, 197.5, 193.2, 200.4, 135.5, 75.1, 176.9, 205.1, 202.6, 185.0, 200.5, 197.3, 193.0, 233.4]
        }, {
          name: 'PAR (μmol/m2)',
          data: [224.3, 222.8, 221.8, 220.3, 137.6, 83.0, 187.1, 212.1, 211.8, 194.4, 207.4, 204.5, 200.1, 244.4]
        }]
      }
    }
  },

  mounted () {
    this.airTempChart = Highcharts.chart(this.$el.getElementsByClassName('air-temp-chart')[0], this.airTempOpts)
    this.soilTempChart = Highcharts.chart(this.$el.getElementsByClassName('soil-temp-chart')[0], this.soilTempOpts)
    this.windSpeedChart = Highcharts.chart(this.$el.getElementsByClassName('wind-speed-chart')[0], this.windSpeedOpts)
    this.solarRadChart = Highcharts.chart(this.$el.getElementsByClassName('solar-rad-chart')[0], this.solarRadOpts)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
