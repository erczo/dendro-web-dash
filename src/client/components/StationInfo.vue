<template>
  <div>
    <p class="text-center text-lg-left">{{ localTime }} {{ station.time_zone }} <em>(UTC {{ utcOffsetHours }} hours)</em></p>

    <h2 class="text-center text-lg-left">{{ station.name }} <small class="text-muted hidden-md-down">Weather Station</small></h2>

    <p class="text-center text-lg-left" v-if="station.geo && station.geo.coordinates && station.geo.coordinates.length > 1">
      <span class="hidden-md-down">Coordinates: </span>{{ station.geo.coordinates[1] }}°, {{ station.geo.coordinates[0] }}° <a class="text-primary" role="button" @click.prevent="selectMarker"><i class="fa fa-map-marker fa-lg" aria-hidden="true"></i></a>
      <span v-if="station.geo.coordinates.length > 2"><br />Elevation: {{ elevation }}</span>
    </p>

    <!-- Links -->
    <ul class="nav justify-content-center justify-content-lg-start">
      <li class="nav-item text-center text-lg-left" v-for="link in station.external_links">
        <a class="nav-link" :href="link.url" target="_blank"><i class="fa fa-external-link hidden-md-down" aria-hidden="true"></i> {{ link.title }}</a>
      </li>

      <li class="nav-item text-center text-lg-left" v-if="contactOrgs && contactPersons && (contactOrgs.length + contactPersons.length > 0)">
        <a class="nav-link" :href="contactUrl"><i class="fa fa-envelope-o hidden-md-down" aria-hidden="true"></i> Contact station team</a>
      </li>
    </ul>
  </div>
</template>

<script>
import math from '../lib/math'
import moment from 'moment'

import {abbr} from '../mixins/tile'

export default {
  props: {
    contactOrgs: Array,
    contactPersons: Array,
    station: Object,

    // Misc
    stationTime: Number,
    systemTime: Number,
    unitAbbrs: Object,
    units: String
  },

  computed: {
    contactUrl: function () {
      /*
        Construct a mailto URI for all contacts. Do our best to adhere to https://tools.ietf.org/html/rfc6068
       */

      // TODO: Move the subject to config?
      const subject = encodeURIComponent('Weather Station Inquiry')
      const emails = []

      // We assume that all fetched contacts have an email
      this.contactOrgs.forEach(c => {
        // According to [RFC5322], the characters "?", "&", and even "%" may occur in addr-specs
        emails.push(encodeURIComponent(c.email).replace('%40', '@'))
      })
      this.contactPersons.forEach(c => {
        emails.push(encodeURIComponent(c.email).replace('%40', '@'))
      })

      return `mailto:${emails.sort().join(',')}?subject=${subject}`
    },
    elevation: function () {
      const station = this.station
      if (station.geo && station.geo.coordinates && station.geo.coordinates.length > 2) {
        const m = this.station.geo.coordinates[2]
        switch (this.units) {
          case 'imp':
            return `${math.round(math.unit(m, 'm').toNumber('ft'))} ${this.getAbbr('Foot')}`
          case 'met':
            return `${m} ${this.getAbbr('Meter')}`
        }
      }
    },
    localTime: function () {
      if (this.stationTime) {
        switch (this.units) {
          case 'imp':
            return moment(this.stationTime).utc().format('h:mm A')
          case 'met':
            return moment(this.stationTime).utc().format('HH:mm')
        }
      }
    },
    utcOffsetHours: function () {
      const offset = this.station.utc_offset
      if (typeof offset === 'number') return math.round(math.unit(offset, 's').toNumber('h'), 2)
    }
  },

  mixins: [abbr],

  methods: {
    selectMarker () {
      this.$emit('select-marker', this.station.geo.coordinates)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
