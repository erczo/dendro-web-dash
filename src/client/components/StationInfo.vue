<template>
  <div class="component card border-0 text-center text-md-left">
    <div class="card-header bg-none">
      <div class="card-text">
        {{ localTimeFormat }} {{ station.time_zone }} <em>(UTC {{ utcOffsetHours }} hours)</em>
      </div>
    </div>

    <div class="card-block">
      <h1 class="card-title">{{ station.name }}</h1>

      <p class="card-text" v-if="station.geo && station.geo.coordinates && station.geo.coordinates.length > 1">
        <span class="hidden-md-down">Coordinates: </span>{{ station.geo.coordinates[1] }}°, {{ station.geo.coordinates[0] }}° <a href="" @click.prevent="selectMarker"><i class="fa fa-fw fa-map-marker" aria-hidden="true"></i></a>
        <span v-if="station.geo.coordinates.length > 2"><br />Elevation: {{ elevation }}</span>
      </p>

      <a class="card-link text-nowrap" href="" @click.prevent="selectDownload" v-if="downloadEnabled"><i class="fa fa-fw fa-arrow-circle-down hidden-sm-down" aria-hidden="true"></i> Download data</a>
      <a class="card-link text-nowrap" target="_blank" v-for="link in station.external_links" :href="link.url"><i class="fa fa-fw fa-external-link-square hidden-sm-down" aria-hidden="true"></i> {{ link.title }}</a>
      <a class="card-link text-nowrap" :href="contactUrl" v-if="contactOrgs && contactPersons && contactOrgs.length + contactPersons.length > 0"><i class="fa fa-fw fa-envelope-o hidden-sm-down" aria-hidden="true"></i> Contact station team</a>
    </div>
  </div>
</template>

<script>
import math from '../lib/math'
import moment from 'moment'

import {abbr} from '../mixins/tile'

const config = window.CLIENT_CONFIG

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
    contactUrl () {
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
    downloadEnabled () {
      return [true, 1, 'true', 'yes'].includes(config.downloadEnabled)
    },
    elevation () {
      const station = this.station
      if (station.geo && station.geo.coordinates && station.geo.coordinates.length > 2) {
        const m = station.geo.coordinates[2]
        switch (this.units) {
          case 'imp':
            return `${math.round(math.unit(m, 'm').toNumber('ft'))} ${this.getAbbr('Foot')}`
          case 'met':
            return `${math.round(m, 1)} ${this.getAbbr('Meter')}`
        }
      }
    },
    localTimeFormat () {
      const stationTime = this.stationTime
      if (stationTime) {
        switch (this.units) {
          case 'imp':
            return moment(stationTime).utc().format('h:mm A')
          case 'met':
            return moment(stationTime).utc().format('HH:mm')
        }
      }
    },
    utcOffsetHours () {
      const offset = this.station.utc_offset
      if (typeof offset === 'number') return math.round(math.unit(offset, 's').toNumber('h'), 2)
    }
  },

  mixins: [abbr],

  methods: {
    selectDownload () {
      this.$emit('select-download')
    },
    selectMarker () {
      this.$emit('select-marker', this.station.geo.coordinates)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card-link + .card-link {
  margin-left: 0;
}
.card-link {
  margin-right: 1rem;
}
</style>
