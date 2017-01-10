<template>
  <div class="col-12 col-lg-6 component">
    <div class="d-flex flex-column h-100 rounded tile">

      <div class="d-flex flex-1 flex-row justify-content-center text-center border-bottom">
        <div class="d-flex flex-1 flex-column justify-content-center text-center">
          <h1 class="display-4">815.7 <span class="hidden-xs-down"><i class="wi wi-umbrella"></i></span></h1>
          <span class="text-muted">Precip<span class="hidden-xs-down">itation</span> to Date (mm)</span>
        </div>
        <div class="d-flex flex-1 flex-column justify-content-center text-center bg-lighten">
          <h2>3.7</h2>
          <span class="text-muted">Last YTD<br />Cumulative (mm)</span>
        </div>
      </div>

      <div class="d-flex flex-1 flex-column justify-content-center text-center chart"></div>

    </div>
  </div>
</template>

<script>
// TODO: Finish
// TODO: Make colors props?
// Cumulative Rainfall
import Highcharts from 'highcharts'

export default {
  data () {
    return {
      opts: {
        chart: {
          backgroundColor: '#50bfa6',
          height: 120
        },

        colors: ['#fff', '#f3f767'],

        legend: {
          align: 'right',
          itemStyle: {
            color: '#fff'
          },
          layout: 'vertical',
          verticalAlign: 'middle'
        },

        title: {
          text: null
        },

        xAxis: {
          categories: ['Oct-14', 'Nov', 'Dec', 'Jan-15', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
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
          name: 'wy2015',
          data: [0, 10, 80, 360, 360, 430, 450, 460, 510, 512, 512, 514, 545]
        }, {
          name: 'wy2016',
          data: [0, 50, 100, 350, 480, 500, 550, 750, 810, 820, 822, 823, 824]
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
  background-color: #50bfa6;
  color: #fff;
}
</style>
