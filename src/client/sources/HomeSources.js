import services from '../lib/services'

/**
 * Data source definitions for the station dashboard; used to configure a DataLoader.
 */
export default {
  stations: {
    guard (vm) {
      return !vm.stations && !vm.stationsError
    },
    fetch (vm) {
      return services.station.find({
        query: {
          enabled: true,
          station_type: 'weather',
          slug: vm.slug
          // TODO: Implement limit; add 'More' button
          // $limit: 1
        }
      })
    },
    afterFetch (res) {
      if (res && res.data && res.data.length > 0) {
        return res.data.sort((a, b) => {
          if (a.name < b.name) return -1
          if (a.name > b.name) return 1
          return 0
        })
      }
    },
    targets: ['stations']
  },

  // TODO: Move to AppSources.js?
  unitVocabulary: {
    guard (vm) {
      return !vm.unitAbbrs
    },
    fetch (vm) {
      return services.vocabulary.get('dt-unit')
    },
    afterFetch (res) {
      if (res && res.terms) {
        const abbrs = {}
        res.terms.forEach(term => {
          abbrs[term.label] = term.abbreviation
        })
        return abbrs
      }
    },
    targets: ['unitAbbrs']
  }
}
