<template>
  <div class="component d-flex flex-1 flex-column h-100 rounded tile">

    <!-- Status -->
    <div class="d-flex flex-1 flex-column justify-content-center text-center border-bottom status-cell" :style="{backgroundColor: colors.TILE.NOTIFY_ONLINE}" v-if="isOnline">
      <h2><i class="fa fa-check-circle-o" aria-hidden="true"></i> Online</h2>
      <!-- TODO: Implement this -->
      <!-- <span class="text-muted">Last offline: 11/11 11:22</span> -->
    </div>

    <div class="d-flex flex-1 flex-column justify-content-center text-center border-bottom status-cell status-cell-offline" :style="{backgroundColor: colors.TILE.NOTIFY_OFFLINE}" v-if="!isOnline">
      <h3><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Offline</h3>
      <!-- TODO: Implement this -->
      <!-- <span class="text-muted">Last online: 10/11 11:22 AM</span> -->
    </div>

    <!-- Events -->
    <div class="d-flex flex-4 flex-column" style="overflow-y: scroll; height: 0;">
      <table class="table table-sm table-hover">
        <tbody>
          <tr v-for="event in events">
            <th scope="row">
              <i class="fa fa-lg fa-check-circle-o text-success" aria-hidden="true" v-if="event.level == 0"></i>
              <i class="fa fa-lg fa-exclamation-triangle text-danger" aria-hidden="true" v-if="event.level > 0"></i>
            </th>
            <td>{{ event.when }}</td>
            <td>{{ event.text }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

import {color} from '../../mixins/tile'

// Station is offline if 2 hours without data
// TODO: Make this configurable
const OFFLINE_INTERVAL = 3 * 60 * 60 * 1000

// Sensor failure if 24 hours without data, from most recent timestamp (_max)
// TODO: Make this configurable
const FAILURE_INTERVAL = 24 * 60 * 60 * 1000

export default {
  props: {
    // DataLoader state
    dataLoading: false,

    // Plain state
    datastreams: Array,
    timestamps: Object,

    // Misc
    stationTime: Number,
    systemTime: Number
  },

  data () {
    return {
      events: [{
        level: null,
        text: 'Loading...',
        when: ''
      }],
      isOnline: true
      // TODO: Implememnt this
      // lastOnlineTime: Number
    }
  },

  mixins: [color],

  watch: {
    dataLoading (newDataLoading) {
      if (newDataLoading) return

      const maxTime = this.timestamps._max || 0
      const maxMoment = moment(maxTime).utc()
      const stationTime = this.stationTime
      const stationMoment = moment(stationTime).utc()

      // Station is offline if 2 hours without data
      // TODO: Make this configurable
      this.isOnline = (stationTime - maxTime < OFFLINE_INTERVAL)

      /*
        NOTE: Datastream timestamps are set as follows:
        - If we never fetched data for the datastream, the timestamp is null
        - If the datastream didn't return data, the timestamp is 0
        - Otherwise, the timestamp is from the latest datapoint
       */

      // Determine sensor failure events based on timestamps
      // TODO: Refactor this all
      let newEvents

      if (this.datastreams) {
        newEvents = this.datastreams.map(datastream => {
          const ts = this.timestamps[datastream._id]
          return {
            _id: datastream._id,
            name: datastream.name,
            source_type: datastream.source_type,
            interval: typeof ts === 'number' ? maxTime - ts : null,
            timestamp: ts
          }
        }).filter(datastream => {
          // Sensor failure if 24 hours without data, from most recent timestamp (_max)
          // TODO: Make this configurable
          if (typeof datastream.interval === 'number') return !(datastream.interval < FAILURE_INTERVAL)
          return false
        })
        .sort((a, b) => {
          return a.interval - b.interval
        }).map(datastream => {
          return {
            level: 1,
            text: `Sensor [${datastream.name}] offline`,
            when: datastream.timestamp === 0 ? 'Long ago' : maxMoment.from(moment(datastream.ts).utc())
          }
        })
      }

      if (this.isOnline) {
        // Prepend data received event
        newEvents.unshift({
          level: 0,
          text: 'Data received',
          when: maxMoment.from(stationMoment)
        })
      } else {
        // Offline station supersedes events
        newEvents = [{
          level: 1,
          text: 'No data received',
          when: maxTime === 0 ? 'Long ago' : maxMoment.from(stationMoment)
        }]
      }

      this.events = newEvents
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.table {
  font-size: 86%;
}
.table th,
.table td {
  vertical-align: middle;
}
.table.table-sm th {
  padding: 0.3rem 0.6rem;
  text-align: center;
}

.tile {
  background-color: #fff;
}

.status-cell {
  color: #fff;
}
</style>
