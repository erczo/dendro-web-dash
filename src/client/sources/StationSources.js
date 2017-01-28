import services from '../lib/services'
import {tagsToKey} from '../lib/utils'

/*
  Strategies for handling lookups based on the user's units selection.
 */
const UNIT_STRATEGIES = {
  // e.g. if Imperial is selected, then use Imperial datastreams with Metric as fallback
  imp: ['imp', 'met'],
  met: ['met', 'imp']
}

/**
 * Helper used on datapoints to assign the target after fetching.
 */
function assignDatapoints (vm, res) {
  const datapoints = {}

  res.forEach(obj => {
    const key = vm.datastreamsIdKeyMap[obj._id]
    if (key && obj.datapoints && obj.datapoints.data) {
      datapoints[key] = obj.datapoints.data
    }
  })

  vm[this.target] = datapoints
}

/**
 * Helper used on datapoints to fetch data.
 */
function fetchDatapoints (vm) {
  const strategy = UNIT_STRATEGIES[vm.units] || []
  const ids = []

  for (let key of this.datastreamKeys) {
    for (let u of strategy) {
      const found = vm.datastreams.find(datastream => {
        return (datastream.__key === key[u]) && this.datastreamFilter(datastream)
      })
      if (found) {
        ids.push(found._id)
        break
      }
    }
  }

  return services.datapointLookup.find({
    query: Object.assign({
      _id: ids.join(',')
    }, this.initialQuery)
  })
}

/**
 * Data source definitions for the station dashbaord; used to configure
 * a DataLoader instance.
 */
export default {
  currentReadings: {
    datastreamFilter (datastream) {
      // TODO: Should we test for a isDefault attribute instead?
      return !datastream.attributes
    },
    datastreamKeys: [
      {imp: 'Average_Air_BarometricPressure_Millibar', met: 'Average_Air_BarometricPressure_PoundForcePerSquareInch'},
      {imp: 'Average_Air_Direction_DegreeAngle', met: 'Average_Air_Direction_DegreeAngle'},
      {imp: 'Average_Air_Speed_MeterPerSecond', met: 'Average_Air_Speed_MilePerHour'},
      {imp: 'Average_Air_Temperature_DegreeFahrenheit', met: 'Average_Air_Temperature_DegreeCelsius'}
    ],
    initialQuery: {
      $limit: 1
    },
    guard (vm) {
      return vm.datastreams && vm.units && !vm.currentReadings
    },
    fetch: fetchDatapoints,
    assign: assignDatapoints,
    target: 'currentReadings'
  },

  // seasonalAirTemp: {
  //   datastreamFilter (datastream) {
  //     // TODO: Should test for isDefault attribute
  //     return !datastream.attributes
  //   },
  //   dsdatastreamKeys: [
  //     {imp: 'Maximum_Seasonal_Air_Temperature_DegreeFahrenheit', met: 'Maximum_Seasonal_Air_Temperature_DegreeCelsius'},
  //     {imp: 'Minimum_Seasonal_Air_Temperature_DegreeFahrenheit', met: 'Minimum_Seasonal_Air_Temperature_DegreeCelsius'}
  //   ],
  //   guard (vm) {
  //     return vm.station && vm.datastreams
  //   },
  //   fetch (vm) {
  //     const query = datapointsQuery(vm, this.dsFilter, this.dsKeys, {
  //       $limit: 1
  //     })
  //     return services.datapointLookup.find({query: query})
  //   },
  //   assign: assignDatapoints,
  //   target: 'current'
  // },

  contactOrgs: {
    guard (vm) {
      return vm.contactOrgIds && !vm.contactOrgs
    },
    fetch (vm) {
      return services.organization.find({
        query: {
          _id: {$in: vm.contactOrgIds},
          email: {$exists: true},
          $select: ['_id', 'email', 'name']
        }
      })
    },
    afterFetch (res) {
      if (res && res.data) {
        return res.data
      }
    },
    target: 'contactOrgs'
  },

  contactPersons: {
    guard (vm) {
      return vm.contactPersonIds && !vm.contactPersons
    },
    fetch (vm) {
      return services.person.find({
        query: {
          _id: {$in: vm.contactPersonIds},
          email: {$exists: true},
          $select: ['_id', 'email', 'name']
        }
      })
    },
    afterFetch (res) {
      if (res && res.data) {
        return res.data
      }
    },
    target: 'contactPersons'
  },

  datastreams: {
    guard (vm) {
      return vm.station && !vm.datastreams
    },
    fetch (vm) {
      return services.datastream.find({
        query: {
          enabled: true,
          station_id: vm.station._id,
          $select: ['_id', 'attributes', 'tags']
        }
      })
    },
    afterFetch (res) {
      if (res && res.data && res.data.length > 0) {
        res.data.forEach(datastream => {
          datastream.__key = tagsToKey(datastream.tags)
          delete datastream.tags
        })
        return res.data
      }
    },
    assign (vm, datastreams) {
      const idKeyMap = {}
      datastreams.forEach(datastream => {
        idKeyMap[datastream._id] = datastream.__key
      })

      vm.datastreamsIdKeyMap = idKeyMap
      vm.datastreams = datastreams
    }
  },

  station: {
    guard (vm) {
      return vm.slug && !vm.station && !vm.stationError
    },
    fetch (vm) {
      return services.station.find({
        query: {
          enabled: true,
          station_type: 'weather',
          slug: vm.slug,
          $limit: 1
        }
      })
    },
    afterFetch (res) {
      if (res && res.data && res.data.length > 0) {
        return res.data[0]
      }
    },
    assign (vm, station) {
      const orgIds = []
      const personIds = []
      station.members.filter(m => {
        return m.roles.indexOf('contact') > -1
      }).forEach(m => {
        if (m.organization_id) orgIds.push(m.organization_id)
        if (m.person_id) personIds.push(m.person_id)
      })

      vm.contactOrgIds = orgIds
      vm.contactPersonIds = personIds
      vm.station = station
    }
  },

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
    target: 'unitAbbrs'
  }
}
