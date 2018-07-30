<template>
  <div class="component d-flex flex-column justify-content-center h-100 rounded tile" style="position: relative;" :style="{backgroundColor}">
    <div class="align-self-center" style="position: absolute;" v-if="isPending">
      <span class="badge badge-pill badge-default px-4 py-4" style="opacity: 0.9;">Calculating...</span>
    </div>

    <div class="d-flex flex-1 flex-column justify-content-center text-center">
      <h1 class="display-3">{{ curCu | placeholder }} <i class="wi wi-raindrops"></i></h1>
      <span class="text-muted">Current Precipitation ({{ lenAbbr }})</span>
    </div>

    <div class="d-flex flex-1 flex-column justify-content-center text-center bg-darken">
      <h1 class="display-4">{{ ydaCu | placeholder }}</h1>
      <span class="text-muted">Yesterday’s ({{ lenAbbr }})</span>
    </div>
  </div>
</template>

<script>
import chroma from 'chroma-js'
import math from '../../lib/math'

import {abbr, color, length} from '../../mixins/tile'

import LengthAcc from '../../accessors/LengthAcc'

let lengthAcc

export default {
  props: {
    // Tile aggs
    twoDay: Object,

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

  mixins: [abbr, color, length],

  computed: {
    curCu () {
      const agg = this.twoDay
      if (agg && agg.result && agg.result.data && agg.result.data[1]) {
        const n = lengthAcc.unitToLenNum(math.unit(agg.result.data[1].v_sum.value, 'mm'))
        return lengthAcc.roundLen(n)
      }
    },
    ydaCu () {
      const agg = this.twoDay
      if (agg && agg.result && agg.result.data && agg.result.data[0]) {
        const n = lengthAcc.unitToLenNum(math.unit(agg.result.data[0].v_sum.value, 'mm'))
        return lengthAcc.roundLen(n)
      }
    },
    backgroundColor () {
      return this.isPending ? chroma(this.colors.TILE.PRECIP).alpha(0.5).css() : this.colors.TILE.PRECIP
    },
    isPending () {
      return (this.twoDay && this.twoDay.status)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tile {
  color: #fff;
}
</style>
