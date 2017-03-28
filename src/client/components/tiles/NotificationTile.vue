<template>
  <div class="d-flex flex-1 flex-column h-100 rounded tile">

    <!-- Status -->
    <div class="d-flex flex-1 flex-column justify-content-center text-center border-bottom status-cell status-cell-online" v-if="isOnline">
      <h2><i class="fa fa-check-circle-o" aria-hidden="true"></i> Online</h2>
      <!-- TODO: Implement this -->
      <!-- <span class="text-muted">Last offline: 11/11 11:22</span> -->
    </div>

    <div class="d-flex flex-1 flex-column justify-content-center text-center border-bottom status-cell status-cell-offline" v-if="!isOnline">
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
<!--
          <tr>
            <th scope="row"><i class="fa fa-lg fa-exclamation-triangle text-danger" aria-hidden="true"></i></th>
            <td>5 min ago</td>
            <td>Deliberately offline for demo.</td>
          </tr>
          <tr>
            <th scope="row"><i class="fa fa-lg fa-check-circle-o text-success" aria-hidden="true"></i></th>
            <td>Today 9:00 AM</td>
            <td>NL115 ethernet module replaced. System back online.</td>
          </tr>
          <tr>
            <th scope="row"><i class="fa fa-lg fa-exclamation-triangle text-danger" aria-hidden="true"></i></th>
            <td>9/20 10:42 PM</td>
            <td>Network disconnect. No data lost.</td>
          </tr>
          <tr>
            <th scope="row"><i class="fa fa-lg fa-exclamation-triangle text-danger" aria-hidden="true"></i></th>
            <td>9/10 8:50 AM</td>
            <td>Annual calibration. System down for 2 hours.</td>
          </tr>
          <tr>
            <th scope="row"><i class="fa fa-lg fa-exclamation-triangle text-danger" aria-hidden="true"></i></th>
            <td>9/10 8:50 AM</td>
            <td>Annual calibration. System down for 2 hours.</td>
          </tr>
          <tr>
            <th scope="row"><i class="fa fa-lg fa-exclamation-triangle text-danger" aria-hidden="true"></i></th>
            <td>9/10 8:50 AM</td>
            <td>Annual calibration. System down for 2 hours.</td>
          </tr>
 -->
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
// TODO: Finish
// TODO: Make colors props?
import moment from 'moment'

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

  watch: {
    dataLoading (newDataLoading) {
      if (newDataLoading) return

      const maxTime = this.timestamps._max || 0
      const maxMoment = moment(maxTime).utc()
      const stationTime = this.stationTime
      const stationMoment = moment(stationTime).utc()

      // Station is offline if 2 hours without data
      // TODO: Make this configurable
      this.isOnline = (stationTime - maxTime < 7200000)

      /*
        NOTE: Datastream timestamps are set as follows:
        - If we never fetched data for the datastream, the timestamp is null
        - If the datastream didn't return data, the timestamp is 0
        - Otherwise, the timestamp is from the latest point
       */

      // Determine sensor failure events based on timestamps
      const newEvents = this.datastreams.map(datastream => {
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
        // TODO: Only concerned about 'sensor' types now; resolve this with proper event logging
        if ((datastream.source_type === 'sensor') && (typeof datastream.interval === 'number')) return !(datastream.interval < 86400000)
        return false
      })
      .sort((a, b) => {
        return a.interval - b.interval
      }).map(datastream => {
        return {
          level: 1,
          text: `Sensor [${datastream.name}] offline`,
          when: datastream.timestamp === 0 ? 'Long ago' : moment(datastream.ts).utc().from(maxMoment)
        }
      })

      // Prepend data received event
      if (this.isOnline) {
        newEvents.unshift({
          level: 0,
          text: 'Data received',
          when: moment(maxMoment).utc().from(stationMoment)
        })
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
.status-cell-offline {
  background-color: #bf5750;
}
.status-cell-online {
  background-color: #97bf50;
}
</style>
