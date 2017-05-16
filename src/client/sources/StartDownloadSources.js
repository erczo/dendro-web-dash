/**
 * Exports DataLoader sources for the start download page. Includes helpers to manage the fetching of download data.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module sources/StartDownloadSources
 */

// import moment from 'moment'
import logger from '../lib/logger'
import services from '../lib/services'

// Given 5 min data, fetching 4 days at a time will yield 1152 datapoints per fetch
const SERIES_FETCH_DAYS = 4

// Fetch 10 fields at a time
const SERIES_FETCH_FIELDS = 20

/**
 * Data source definitions for the start download page; used to configure a DataLoader.
 */
export default {

  /*
    Download timeseries data
   */

  downloadSeries: {
    // Loader config
    clear (vm) {
      vm.store.clearDataset()
    },
    guard (vm) {
      const cursor = vm.downloadCursor
      return !vm.isPaused && vm.hasFields && vm.selectedDays > 0 && (!cursor || (cursor.start < cursor.end))
    },
    beforeFetch (vm) {
      if (vm.downloadCursor) return

      /*
        Init cursor to fetch the first batch of fields within the interval [start, pos).
       */
      const newCursor = vm.downloadCursor = {}
      newCursor.index = 0
      newCursor.start = vm.range.start
      newCursor.pos = vm.range.start.clone().add(SERIES_FETCH_DAYS, 'd')
      newCursor.end = vm.range.end.clone().add(1, 'd')
    },
    fetch (vm) {
      const cursor = vm.downloadCursor
      const ids = vm.store.plainState.datastreamIds.slice(cursor.index, cursor.index + SERIES_FETCH_FIELDS)
      const query = {
        _id: ids.join(','),
        time: {
          $gte: cursor.start.toISOString(),
          $lt: cursor.pos.toISOString()
        },
        time_local: true, // 'time' is standard station time
        $limit: 2000,
        $sort: {time: 1} // ASC
      }

      logger.log('StartDownloadSources:fetch::query', query)

      return services.datapointLookup.find({
        query: query
      })
      // TODO: Remove this! - For debug only
      // }).then(res => {
      //   return new Promise(resolve => {
      //     setTimeout(() => {
      //       resolve(res)
      //     }, 2000)
      //   })
      // })
    },
    afterFetch (vm, res) {
      /*
        Move the cursor to the right to fetch more fields, or down to fetch additional days.
       */
      const cursor = vm.downloadCursor

      let newIndex = cursor.index + SERIES_FETCH_FIELDS
      let newStart = cursor.start
      let newPos = cursor.pos

      if (newIndex >= vm.store.plainState.datastreamIds.length) {
        newIndex = 0 // Start at the first field again

        if (Array.isArray(res) && res.length > 0) {
          newStart = cursor.pos
          newPos = cursor.pos.clone().add(SERIES_FETCH_DAYS, 'd')
        } else {
          newStart = newPos = cursor.end
        }

        // Clamp pos to the end time
        if (newPos > cursor.end) newPos = cursor.end
      }

      // Assign a new object for reactive updates
      const newCursor = vm.downloadCursor = {}
      newCursor.index = newIndex
      newCursor.start = newStart
      newCursor.pos = newPos
      newCursor.end = cursor.end

      return res
    },
    assign (vm, res) {
      // datapointLookup returns an array of documents, each having datastream meatdata and datapoints
      vm.store.fillDataset(res)

      // If the cursor moved to the first field, then flush the dataset and start over
      if (vm.downloadCursor.index === 0) {
        vm.store.appendDatasetToBlob()
        vm.store.clearDataset()
      }
    }
  }
}
