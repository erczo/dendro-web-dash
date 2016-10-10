<template>
  <div class="col col-sm-12 col-lg-6 flex-col">
    <div class="flex-1 flex-col tile pressure-tile">

      <div class="flex-1-cell flex-row cell-border-bottom">
        <div class="flex-2-cell flex-col cell-align-middle text-xs-center">
          <h1 class="display-4">870 <span class="hidden-xs-down"><i class="wi wi-barometer"></i></span></h1>
          <span class="text-muted"><span class="hidden-xs-down">Barometric</span> Pressure (mbar)</span>
        </div>
        <div class="flex-2-cell flex-col cell-align-middle text-xs-center bg-lighten" style="overflow: hidden;">
          <h2>-67</h2>
          <span class="text-muted">Elevation offset<br /><span class="hidden-xs-down">from sea level </span>(mbar)</span>
        </div>
      </div>

      <div class="flex-1-cell flex-col cell-align-middle text-xs-center chart"></div>

    </div>
  </div>
</template>

<script>
// TODO: Finish
// TODO: Make colors props?

import Highcharts from 'highcharts'

export default {
  data () {
    return {
      opts: {
        chart: {
          backgroundColor: '#509ebf',
          height: 100
        },

        colors: ['#f3f767'],

        legend: {
          enabled: false
        },

        title: {
          text: null
        },

        xAxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
          data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }]
      }
    }
  },

  mounted () {
    this.chart = Highcharts.chart(this.$el.getElementsByClassName('chart')[0], this.opts)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.pressure-tile {
  background-color: #509ebf;
  color: #fff;
}
</style>
