/**
 * Exports various Vue mixins for use with dashboard tiles.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module mixins/tile
 */

import moment from 'moment'
import colors from '../lib/colors'

const abbr = {
  methods: {
    getAbbr (key) {
      if (!this.unitAbbrs) return ''
      return this.unitAbbrs[key]
    }
  }
}

const color = {
  computed: {
    colors () {
      return colors
    }
  }
}

const length = {
  computed: {
    lenAbbr: function () {
      switch (this.units) {
        case 'imp':
          return this.getAbbr('Inch')
        case 'met':
          return this.getAbbr('Millimeter')
      }
      return
    }
  }
}

const pressure = {
  computed: {
    presAbbr: function () {
      switch (this.units) {
        case 'imp':
          return this.getAbbr('PoundForcePerSquareInch')
        case 'met':
          return this.getAbbr('Millibar')
      }
      return
    }
  }
}

const seasonal = {
  computed: {
    seasMonth: function () {
      if (this.stationTime) return moment(this.stationTime).utc().format('MMMM')
    }
  }
}

const solar = {
  computed: {
    parAbbr: function () {
      // TODO: Should be MicromolePerSquareMeter
      return this.getAbbr('Micromole')
    },
    radAbbr: function () {
      return this.getAbbr('WattPerSquareMeter')
    }
  }
}

const speed = {
  computed: {
    spdAbbr: function () {
      switch (this.units) {
        case 'imp':
          return this.getAbbr('MilePerHour')
        case 'met':
          return this.getAbbr('MeterPerSecond')
      }
      return
    }
  }
}

const temperature = {
  computed: {
    degAbbr: function () {
      switch (this.units) {
        case 'imp':
          return this.getAbbr('DegreeFahrenheit')
        case 'met':
          return this.getAbbr('DegreeCelsius')
      }
      return
    }
  }
}

export {
  abbr,
  color,
  length,
  pressure,
  seasonal,
  solar,
  speed,
  temperature
}
