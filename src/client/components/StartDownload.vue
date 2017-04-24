<template>
  <div class="component p-fixed">
    <section>
      <div class="container-fluid">
        <div class="row py-2 border-bottom">
          <div class="col-12 text-muted">Download Datapoints</div>
        </div>
      </div>
    </section>

    <section class="py-3" v-if="!hasFields">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12">
            <h2>Nothing to download</h2>
            <p class="text-muted">Try adding a few stations or datastreams to your download to continue.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-3 border-bottom" v-else-if="isCompleted">
      <div class="container">
        <div class="row">
          <div class="col">
            <div class="card text-center">
              <div class="card-block">
                <h5 class="card-title">Download Complete</h5>
                <p class="card-text">Your CSV file is ready.</p>
                <a class="btn btn-success" target="_blank" download="dendro.csv" :href="this.state.blobURL">Save File</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-3 border-bottom" v-else>
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h5 v-if="!isPaused">Downloading...</h5>
            <h5 v-else-if="dataLoading">Pausing...</h5>
            <h5 v-else>Paused</h5>
          </div>
        </div>

        <div class="row pt-2">
          <div class="col-12">
            <div class="progress">
              <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"
                :class="isIndeterminate ? (isPaused ? 'bg-faded' : 'progress-bar-striped progress-bar-animated bg-success') : 'bg-success'"
                :style="{width: (isIndeterminate ? 100 : progress) + '%'}"></div>
            </div>
          </div>
        </div>

        <div class="row py-1">
          <div class="col-6 py-1">
            <span class="text-muted">{{ downloadDays }} of {{ selectedDays }} {{ selectedDays | pluralize('day') }}</span><br />
            <span class="text-muted">{{ sizeFormat }}</span>
          </div>

          <div class="col-6 py-1 text-right">
            <span class="text-muted" v-if="progress < 90">{{ progress }}%</span>
            <span class="text-muted" v-else>Almost there!</span>
          </div>
        </div>

        <div class="row pt-2" v-if="recentError">
          <div class="col-12">
            <div class="alert alert-warning" role="alert">
              <strong>Error</strong> {{ recentError }}
            </div>
          </div>
        </div>

        <div class="row pt-2">
          <div class="col-12 text-right">
            <button type="button" class="btn btn-sm mr-1" :class="isPaused ? 'btn-success' : 'btn-outline-success'" :disabled="isPaused && dataLoading" @click="isPaused = !isPaused">
              <span v-if="isPaused"><i class="fa fa-play-circle" aria-hidden="true"></i> Resume</span>
              <span v-else><i class="fa fa-pause-circle" aria-hidden="true"></i> Pause</span>
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger" @click="$router.push({name: 'download'})"><i class="fa fa-times" aria-hidden="true"></i> Cancel</button>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>

<script>
import math from '../lib/math'
import logger from '../lib/logger'

import {DataLoader} from '../lib/dataloader'
import StartDownloadSources from '../sources/StartDownloadSources'

import StartDownloadStore from '../stores/StartDownloadStore'

let dataLoader

export default {
  props: {
    // Download 'cart'
    downloadStore: Object
  },

  data () {
    return {
      // DataLoader state
      dataLoading: false,

      state: this.store.reactiveState,

      downloadSeriesError: null,

      // Cursor-based fetching
      downloadCursor: null,

      // Misc
      isPaused: false,
      recentError: null
    }
  },

  beforeCreate () {
    this.store = new StartDownloadStore()
  },

  created () {
    this.store.initForDownloadFields(this.downloadStore.reactiveState.fields)

    dataLoader = new DataLoader(this, StartDownloadSources)
    dataLoader.maxFetches = 100000
    dataLoader.clear().load().then(() => {
      logger.log('StartDownload:created::vm', this)
    })
  },

  beforeDestroy () {
    dataLoader.destroy()
    dataLoader = null

    this.store.clearBlob()
    this.store.clearDataset()
  },

  computed: {
    downloadDays () {
      const [cursor, range] = [this.downloadCursor, this.range]
      if (cursor && cursor.start && range && range.start) return cursor.start.diff(range.start, 'days')
      return 0
    },
    fieldCount () {
      const names = this.fieldNames
      if (names) return names.length
      return 0
    },
    fieldNames () {
      return this.state.fieldNames
    },
    hasFields () {
      return this.fieldCount > 0
    },
    isCompleted () {
      const cursor = this.downloadCursor
      return (cursor && cursor.start >= cursor.end)
    },
    isIndeterminate () {
      return this.isPaused || this.progress < 1
    },
    progress () {
      const [cursor, fieldCount, dlDays, selDays] = [this.downloadCursor, this.fieldCount, this.downloadDays, this.selectedDays]
      if (cursor) return Math.min(100, Math.round((dlDays * fieldCount + cursor.index) / (selDays * fieldCount) * 100))
      return 0
    },
    range () {
      return this.downloadStore.reactiveState.range
    },
    sizeFormat () {
      const size = this.state.blobSize
      if (size) return math.unit(size, 'B').format({notation: 'fixed', precision: 1})
    },
    selectedDays () {
      const range = this.range
      if (range && range.start && range.end) return Math.max(1, range.end.diff(range.start, 'days'))
      return 0
    }
  },

  watch: {
    downloadSeriesError (newError) {
      if (newError) this.recentError = newError
    },
    isCompleted (newIsCompleted) {
      if (newIsCompleted) {
        this.store.createBlobURL()
      }
    },
    isPaused (newIsPaused) {
      if (newIsPaused) {
        this.downloadSeriesFetchedAt = null // Cancel any pending fetch
      } else {
        // Resume download
        dataLoader.load().then(() => {
          logger.log('StartDownload:watch.isPaused::vm', this)
        })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
