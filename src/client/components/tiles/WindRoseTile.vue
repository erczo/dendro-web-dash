<template>
  <div class="col-12 col-lg-4 component">
    <div class="d-flex flex-column h-100 rounded tile">
      <div class="d-flex flex-1 flex-column justify-content-center text-center chart"></div>
    </div>
  </div>
</template>

<script>
// TODO: Finish
// TODO: Make colors props?

import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts-more'

HighchartsMore(Highcharts)

export default {
  data () {
    return {
      opts: {
        chart: {
          backgroundColor: '#9081bf',
          polar: true,
          type: 'column'
        },

        colors: ['#5cb6dc', '#aedc5c', '#f3f767', '#dcac5c'],

        legend: {
          align: 'center',
          itemStyle: {
            color: '#fff'
          },
          layout: 'horizontal',
          verticalAlign: 'top'
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

        series: [{
          name: '0-3 m/s',
          data: [
            ['N', 1.81],
            ['NNE', 0.64],
            ['NE', 0.82],
            ['ENE', 0.59],
            ['E', 0.62],
            ['ESE', 1.22],
            ['SE', 1.61],
            ['SSE', 2.04],
            ['S', 2.66],
            ['SSW', 2.96],
            ['SW', 2.53],
            ['WSW', 1.97],
            ['W', 1.64],
            ['WNW', 1.32],
            ['NW', 1.58],
            ['NNW', 1.51]
          ]
        }, {
          name: '3.1-5 m/s',
          data: [
            ['N', 1.94],
            ['NNE', 1.09],
            ['NE', 0.89],
            ['ENE', 1.29],
            ['E', 2.69],
            ['ESE', 3.56],
            ['SE', 5.43],
            ['SSE', 5.39],
            ['S', 5.17],
            ['SSW', 4.4],
            ['SW', 5.23],
            ['WSW', 4.63],
            ['W', 2.63],
            ['WNW', 3.39],
            ['NW', 5.56],
            ['NNW', 6.32]
          ]
        }, {
          name: '5.1-8 m/s',
          data: [
            ['N', 0],
            ['NNE', 0],
            ['NE', 0],
            ['ENE', 0],
            ['E', 0],
            ['ESE', 0.43],
            ['SE', 3.88],
            ['SSE', 1.39],
            ['S', 0],
            ['SSW', 0],
            ['SW', 0.62],
            ['WSW', 1.09],
            ['W', 1.71],
            ['WNW', 1.94],
            ['NW', 1.42],
            ['NNW', 0.36]
          ]
        }, {
          name: '8+ m/s',
          data: [
            ['N', 0],
            ['NNE', 0],
            ['NE', 0],
            ['ENE', 0],
            ['E', 0],
            ['ESE', 0],
            ['SE', 0.52],
            ['SSE', 0.49],
            ['S', 0],
            ['SSW', 0],
            ['SW', 0],
            ['WSW', 0],
            ['W', 0.1],
            ['WNW', 0],
            ['NW', 0.72],
            ['NNW', 0.2]
          ]
        }],

        title: {
          text: null
        },

        tooltip: {
          valueSuffix: '%'
        },

        xAxis: {
          categories: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
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
        }
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
  background-color: #9081bf;
  color: #fff;
}
</style>
