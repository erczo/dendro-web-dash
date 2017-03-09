/**
 * Exports DataLoader sources for the home page.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module source/StationSources
 */

import services from '../lib/services'

/**
 * Data source definitions for the home page; used to configure a DataLoader.
 */
export default {

  /*
    Top-level datasets: stations, etc.
   */

  stations: {
    // Loader config
    clear (vm) {
      vm.store.clearStations()
    },
    guard (vm) {
      return !vm.state.stations && !vm.stationsError
    },
    fetch (vm) {
      return services.station.find({
        query: {
          enabled: true,
          station_type: 'weather',
          slug: {$exists: 1}
          // TODO: Implement limit; add 'More' button
          // $limit: 1
        }
      })
    },
    afterFetch (vm, res) {
      if (res && res.data && res.data.length > 0) {
        return res.data.sort((a, b) => {
          if (a.name < b.name) return -1
          if (a.name > b.name) return 1
          return 0
        })
      }
    },
    assign (vm, stations) {
      vm.store.setStations(stations)
    }
  },

  // TODO: Move to AppSources.js?
  unitVocabulary: {
    // Loader config
    clear (vm) {
      vm.store.clearUnitVocabulary()
    },
    guard (vm) {
      return !vm.state.unitAbbrs
    },
    fetch (vm) {
      return services.vocabulary.get('dt-unit')
    },
    afterFetch (vm, res) {
      if (res) return res
    },
    assign (vm, vocabulary) {
      vm.store.setUnitVocabulary(vocabulary)
    }
  }
}
