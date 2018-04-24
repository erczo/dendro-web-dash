/**
 * Exports DataLoader sources for the home page.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module sources/HomeSources
 */

import services from '../lib/services'

/**
 * Reusable stationsQuery for page-based fetching.
 */
function stationsQuery (vm) {
  const searchText = vm.searchText.trim()
  const query = {
    enabled: true,
    organization_id: vm.state.organization._id,
    station_type: 'weather',
    slug: {$exists: 1},
    $limit: 200,
    $sort: {name: 1} // ASC
  }
  if (searchText.length > 0) {
    query.name = {
      $regex: searchText,
      $options: 'i'
    }
  }

  return query
}

/**
 * Reusable afterFetch for stations.
 */
function afterFetchStations (vm, res) {
  if (res && res.data) {
    vm.skipStationCount = res.skip
    vm.totalStationCount = res.total

    return res.data
  }
}

/**
 * Data source definitions for the home page; used to configure a DataLoader.
 */
export default {

  /*
    Top-level datasets: stations, etc.
   */

  organization: {
    // Loader config
    clear (vm) {
      vm.store.clearOrganization()
    },
    guard (vm) {
      return !vm.state.organization && !vm.organizationError
    },
    fetch (vm) {
      return services.organization.find({
        query: {
          slug: window.CLIENT_CONFIG.orgSlug,
          $limit: 1
        }
      })
    },
    afterFetch (vm, res) {
      if (res && res.data && res.data.length > 0) return res.data[0]
    },
    assign (vm, organization) {
      vm.store.setOrganization(organization)
    }
  },

  moreStations: {
    // Loader config
    guard (vm) {
      return vm.state.stations && vm.skipStationCount >= vm.stations.length
    },
    fetch (vm) {
      const query = Object.assign(stationsQuery(vm), {
        $skip: vm.skipStationCount
      })

      return services.station.find({
        query: query
      })
    },
    afterFetch: afterFetchStations,
    assign (vm, stations) {
      vm.store.appendStations(stations)
    }
  },

  stations: {
    // Loader config
    clear (vm) {
      vm.store.clearStations()
    },
    guard (vm) {
      return vm.state.organization && !vm.state.stations && !vm.stationsError
    },
    fetch (vm) {
      return services.station.find({
        query: stationsQuery(vm)
      })
    },
    afterFetch: afterFetchStations,
    assign (vm, stations) {
      vm.store.setStations(stations)
    }
  }
}
