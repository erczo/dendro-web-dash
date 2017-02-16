import moment from 'moment'
import services from '../lib/services'
import {tagsToKey} from '../lib/utils'
import {UNIT_STRATEGIES} from '../lib/unit'

/**
 * Helper used on datapoints to assign the target after fetching.
 */
function assignDatapoints (vm, res) {
  const obj = {}

  /*
    The datapointLookup service returns an array of documents, each with a datatream _id and datapoints.data.
   */
  res.forEach(doc => {
    // Lookup the _id in the key-map to get a friendly object key in order to assign
    const key = vm.datastreamsIdKeyMap[doc._id]

    // If data was returned, then assign a propery in our obj that's used to assign the target
    if (key && doc.datapoints && doc.datapoints.data && doc.datapoints.data.length > 0) {
      obj[key] = doc.datapoints.data
    }
  })

  return [obj]
}

/**
 * Helper used on datapoints to fetch data.
 */
function fetchDatapoints (vm) {
  const strategy = UNIT_STRATEGIES[vm.units] || []
  const ids = []

  for (let key of this.datastreamKeys) {
    for (let u of strategy) {
      if (!key[u]) continue
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
    query: Object.assign(this.datapointsQuery(vm), {
      _id: ids.join(',')
    })
  })
}

/**
 * Datapoints filter for absence of attributes.
 */
function noAttributesFilter (datastream) {
  // TODO: Should we test for a isDefault attribute instead?
  return !datastream.attributes
}

/**
 * Data source definitions for the station dashboard; used to configure a DataLoader.
 */
export default {
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
    targets: ['contactOrgs']
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
    targets: ['contactPersons']
  },

  current: {
    datastreamFilter: noAttributesFilter,
    datastreamKeys: [
      {imp: 'Average_Air_BarometricPressure_PoundForcePerSquareInch', met: 'Average_Air_BarometricPressure_Millibar'},
      {imp: 'Average_Air_Direction_DegreeAngle', met: 'Average_Air_Direction_DegreeAngle'},
      {imp: 'Average_Air_Moisture_Percent', met: 'Average_Air_Moisture_Percent'},
      {imp: 'Average_Air_Speed_MilePerHour', met: 'Average_Air_Speed_MeterPerSecond'},
      {imp: 'Average_Air_Temperature_DegreeFahrenheit', met: 'Average_Air_Temperature_DegreeCelsius'},
      // TODO: Should be Average_Solar_PhotosyntheticallyActiveRadiation_MicromolePerSquareMeter
      {imp: 'Average_Solar_PhotosyntheticallyActiveRadiation_Micromole', met: 'Average_Solar_PhotosyntheticallyActiveRadiation_Micromole'},
      {imp: 'Average_Solar_Radiation_WattPerSquareMeter', met: 'Average_Solar_Radiation_WattPerSquareMeter'},
      // TODO: Should be Cumulative_Precipitation_Height_InchPerHour
      // TODO: Should be Cumulative_Precipitation_Height_MillimeterPerHour
      {imp: 'Cumulative_Precipitation_Height_Inch', met: 'Cumulative_Precipitation_Height_Millimeter'}
    ],
    datapointsQuery () {
      return {
        $limit: 1
      }
    },
    guard (vm) {
      return vm.datastreams && vm.units && !vm.current
    },
    fetch: fetchDatapoints,
    assign: assignDatapoints,
    targets: ['current']
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
          $limit: 100,
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

      return [idKeyMap, datastreams]
    },
    targets: ['datastreamsIdKeyMap', 'datastreams']
  },

  // TODO: Finish!!!
  // twoWeeks: {
  //   datastreamFilter: noAttributesFilter,
  //   datastreamKeys: [
  //     {imp: 'Average_Air_BarometricPressure_PoundForcePerSquareInch', met: 'Average_Air_BarometricPressure_Millibar'}
  //   ],
  //   datapointsQuery (vm) {
  //     /*
  //       NOTE: Time manipulation must be performed within the station's timezone (UTC offset).
  //      */
  //     const time = moment(vm.systemTime).utcOffset(vm.station.utc_offset / 60).startOf('d').subtract(1, 'd').toISOString()
  //     return {
  //       time: {
  //         $gte: time,
  //         $lte: time
  //       },
  //       $limit: 1
  //     }
  //   },
  //   guard (vm) {
  //     return vm.datastreams && vm.units && vm.systemTime && !vm.yesterday
  //   },
  //   fetch: fetchDatapoints,
  //   assign: assignDatapoints,
  //   targets: ['lastTwoWeeks']
  // }

  seasonal: {
    datastreamFilter: noAttributesFilter,
    datastreamKeys: [
      {imp: 'Average_Seasonal_Air_Speed_MilePerHour', met: 'Average_Seasonal_Air_Speed_MeterPerSecond'},
      {imp: 'Maximum_Seasonal_Air_Moisture_Percent', met: 'Maximum_Seasonal_Air_Moisture_Percent'},
      {imp: 'Maximum_Seasonal_Air_Speed_MilePerHour', met: 'Maximum_Seasonal_Air_Speed_MeterPerSecond'},
      {imp: 'Minimum_Seasonal_Air_Speed_MilePerHour', met: 'Minimum_Seasonal_Air_Speed_MeterPerSecond'},
      {imp: 'Maximum_Seasonal_Air_Temperature_DegreeFahrenheit', met: 'Maximum_Seasonal_Air_Temperature_DegreeCelsius'},
      {imp: 'Minimum_Seasonal_Air_Moisture_Percent', met: 'Minimum_Seasonal_Air_Moisture_Percent'},
      {imp: 'Minimum_Seasonal_Air_Temperature_DegreeFahrenheit', met: 'Minimum_Seasonal_Air_Temperature_DegreeCelsius'}
    ],
    datapointsQuery (vm) {
      /*
        Monthly seasonal values are stamped with the first day of the current month in the prior year.

        NOTE: Time manipulation must be performed within the station's timezone (UTC offset).
       */
      const time = moment(vm.systemTime).utcOffset(vm.station.utc_offset / 60).startOf('M').subtract(1, 'y').toISOString()
      return {
        time: {
          $gte: time,
          $lte: time
        },
        $limit: 1
      }
    },
    guard (vm) {
      return vm.datastreams && vm.units && vm.systemTime && !vm.seasonal
    },
    fetch: fetchDatapoints,
    assign: assignDatapoints,
    targets: ['seasonal']
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
      if (station.members) {
        station.members.filter(m => {
          return m.roles.indexOf('contact') > -1
        }).forEach(m => {
          if (m.organization_id) orgIds.push(m.organization_id)
          if (m.person_id) personIds.push(m.person_id)
        })
      }

      return [orgIds, personIds, station]
    },
    targets: ['contactOrgIds', 'contactPersonIds', 'station']
  },

  // TODO: Move to AppSources.js?
  systemTime: {
    guard (vm) {
      return !vm.systemTime
    },
    fetch (vm) {
      return services.systemTime.get('utc')
    },
    afterFetch (res) {
      if (res && res.now) {
        return new Date(res.now)
      }
    },
    targets: ['systemTime']
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
  },

  yesterday: {
    datastreamFilter: noAttributesFilter,
    datastreamKeys: [
      // TODO: Should be Cumulative_Day_Precipitation_Height_InchPerDay
      // TODO: Should be Cumulative_Day_Precipitation_Height_MillimeterPerDay
      {imp: 'Cumulative_Day_Precipitation_Height_Inch', met: 'Cumulative_Day_Precipitation_Height_Millimeter'}
    ],
    datapointsQuery (vm) {
      /*
        Daily cumulative values are stamped with midnight of the relevant day.

        NOTE: Time manipulation must be performed within the station's timezone (UTC offset).
       */
      const time = moment(vm.systemTime).utcOffset(vm.station.utc_offset / 60).startOf('d').subtract(1, 'd').toISOString()
      return {
        time: {
          $gte: time,
          $lte: time
        },
        $limit: 1
      }
    },
    guard (vm) {
      return vm.datastreams && vm.units && vm.systemTime && !vm.yesterday
    },
    fetch: fetchDatapoints,
    assign: assignDatapoints,
    targets: ['yesterday']
  }
}
