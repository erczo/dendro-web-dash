<template>
  <div class="container">

    <div class="row">
      <div class="col-xs-12 air-temp-chart"></div>
    </div>

    <div class="row">
      <div class="col-xs-12 soil-temp-chart"></div>
    </div>

    <div class="row">
      <div class="col-xs-12 wind-speed-chart"></div>
    </div>

    <div class="row">
      <div class="col-xs-12 solar-rad-chart"></div>
    </div>

  </div>
</template>

<script>
// TODO: Finish
// TODO: Make colors props?

// import HighchartsDendro from '../../lib/highcharts-dendro'

// HighchartsDendro(Highcharts)

import Highcharts from 'highcharts'

export default {
  data () {
    return {

      // Air temp
      airTempOpts: {
        chart: {
          height: 300
        },

        colors: ['#509ebf'],

        legend: {
          enabled: false
        },

        title: {
          text: 'Air Temperature'
        },

        xAxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          // gridLineColor: 'rgba(255, 255, 255, 0.4)',
          // labels: {
          //   style: {
          //     color: 'rgba(255, 255, 255, 0.4)'
          //   }
          // },
          // lineColor: 'rgba(255, 255, 255, 0.4)'
        },

        yAxis: {
          // gridLineColor: '#fff',
          // labels: {
          //   style: {
          //     color: '#fff'
          //   }
          // },
          title: {
            // style: {
            //   color: '#fff'
            // },
            text: null
          }
        },

        series: [{
          name: 'Sample',
          data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }]
      },

      // Soil temp
      soilTempOpts: {
        chart: {
          height: 300
        },

        colors: ['#50bfa6'],

        legend: {
          enabled: false
        },

        title: {
          text: 'Soil Temperature'
        },

        xAxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          // gridLineColor: 'rgba(255, 255, 255, 0.4)',
          // labels: {
          //   style: {
          //     color: 'rgba(255, 255, 255, 0.4)'
          //   }
          // },
          // lineColor: 'rgba(255, 255, 255, 0.4)'
        },

        yAxis: {
          // gridLineColor: '#fff',
          // labels: {
          //   style: {
          //     color: '#fff'
          //   }
          // },
          title: {
            // style: {
            //   color: '#fff'
            // },
            text: null
          }
        },

        series: [{
          name: 'Sample',
          data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }]
      },

      // Wind speed
      windSpeedOpts: {
        chart: {
          height: 300
        },

        colors: ['#9081bf'],

        legend: {
          enabled: false
        },

        title: {
          text: 'Wind Speed'
        },

        xAxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          // gridLineColor: 'rgba(255, 255, 255, 0.4)',
          // labels: {
          //   style: {
          //     color: 'rgba(255, 255, 255, 0.4)'
          //   }
          // },
          // lineColor: 'rgba(255, 255, 255, 0.4)'
        },

        yAxis: {
          // gridLineColor: '#fff',
          // labels: {
          //   style: {
          //     color: '#fff'
          //   }
          // },
          title: {
            // style: {
            //   color: '#fff'
            // },
            text: null
          }
        },

        series: [{
          name: 'Sample',
          data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }]
      },

      // Solar radiation
      solarRadOpts: {
        chart: {
          height: 300
        },

        colors: ['#bf9650'],

        legend: {
          enabled: false
        },

        title: {
          text: 'Solar Radiation'
        },

        xAxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          // gridLineColor: 'rgba(255, 255, 255, 0.4)',
          // labels: {
          //   style: {
          //     color: 'rgba(255, 255, 255, 0.4)'
          //   }
          // },
          // lineColor: 'rgba(255, 255, 255, 0.4)'
        },

        yAxis: {
          // gridLineColor: '#fff',
          // labels: {
          //   style: {
          //     color: '#fff'
          //   }
          // },
          title: {
            // style: {
            //   color: '#fff'
            // },
            text: null
          }
        },

        series: [{
          name: 'Sample',
          data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
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
.air-temp-tile {
  background-color: #509ebf;
  color: #fff;
}
</style>
