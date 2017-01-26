<template>
  <div class="col-12 col-lg-6 component">
    <div class="d-flex flex-column h-100 rounded tile">

      <div class="d-flex flex-1 flex-row justify-content-center text-center border-bottom">
        <div class="d-flex flex-1 flex-column justify-content-center text-center">
          <h1 class="display-4">949 <span class="hidden-sm-down"><i class="wi wi-barometer"></i></span></h1>
          <span class="text-muted"><span class="hidden-sm-down">Barometric</span> Pressure (mbar)</span>
        </div>
        <div class="d-flex flex-1 flex-column justify-content-center text-center bg-lighten">
          <h2>-67</h2>
          <span class="text-muted">Elevation offset<br /><span class="hidden-sm-down">from sea level </span>(mbar)</span>
        </div>
      </div>

      <div class="d-flex flex-1 flex-column justify-content-center text-center chart"></div>

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
