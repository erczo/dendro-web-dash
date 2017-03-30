/**
 * Exports DataLoader sources for the station dashboard. Includes helpers to manage the fetching of dashboard data.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module source/StationSources
 */

import moment from 'moment'
import logger from '../lib/logger'
import services from '../lib/services'

// Given 5 min data, fetching 4 days at a time will yield 1152 datapoints per fetch
const SERIES_FETCH_DAYS = 4

// Maximum number of datapoints per fetch
const SERIES_QUERY_LIMIT = 2000

const UNITS_ORDER = {
  imp: {all: 2, imp: 2, met: 1},
  met: {all: 2, imp: 1, met: 2}
}

function stationMomentToUTCTime (stationMoment, offset) {
  return stationMoment.valueOf() - (typeof offset === 'number' ? offset * 1000 : 0)
}

/**
 * Reusable datapointsQuery and guard for cursor-based fetching.
 */
function fwdCursorDatapointsQuery (vm) {
  const cursor = vm[this.cursorName]
  const startTime = stationMomentToUTCTime(cursor.start, vm.state.station.utc_offset)
  const posTime = stationMomentToUTCTime(cursor.pos, vm.state.station.utc_offset)

  return {
    time: {
      $gte: moment(startTime).utc().toISOString(),
      $lt: moment(posTime).utc().toISOString()
    },
    $limit: SERIES_QUERY_LIMIT,
    $sort: {time: 1} // ASC
  }
}

function fwdCursorDatapointsGuard (vm) {
  const cursor = vm[this.cursorName]
  return vm.store.plainState.datastreams && vm.units && vm.stationTime && (!cursor || (cursor.start < cursor.end))
}

/**
 * Return an array of datastream ids for the given display units and search specifiers.
 *
 * Example specs:
 *  [
 *    {dsKey: 'Average_Air_Speed', dtUnits: {'MilePerHour': 'imp', 'MeterPerSecond': 'met'}},
 *    {dsKey: 'Average_Air_Temperature', dtUnits: {'DegreeFahrenheit': 'imp', 'DegreeCelsius': 'met'}}
 *  ]
 */
function getDatastreamIdsForLookup (datastreamsByDsKey, specs, filter, units) {
  const filterFn = typeof filter === 'function' ? filter : function () {
    return true
  }
  const order = UNITS_ORDER[units]
  const ids = []

  specs.forEach(spec => {
    const hashIdMap = [{}, {}]
    const datastreams = datastreamsByDsKey[spec.dsKey]
    if (datastreams) {
      datastreams.filter(filterFn).forEach(datastream => {
        let u = spec.dtUnits[datastream.__dtUnit]
        if (u) {
          const n = order[u]
          if (n > 0) hashIdMap[n - 1][datastream.__attrsInfo.hash] = datastream._id
        }
      })
    }

    const merged = Object.assign(...hashIdMap)
    ids.push(...Object.keys(merged).map(k => {
      return merged[k]
    }))
  })

  return ids
}

/**
 * Reusable beforeFetch and afterFetch for chart series data.
 */
function beforeFetchSeries (vm) {
  if (vm[this.cursorName]) return

  /*
    Init cursor interval [start, pos). Points are fetched within this interval, then we move the cursor forward.
   */
  const config = vm.seriesConfig
  const newCursor = vm[this.cursorName] = {}
  newCursor.start = moment(config.start).utc()
  newCursor.pos = moment(config.start).utc().add(SERIES_FETCH_DAYS - 1, 'd')
  newCursor.end = moment(config.end).utc()
}

function afterFetchSeries (vm, res) {
  /*
    Move the cursor to the right (i.e. forwards in time). Fetch datapoints for SERIES_FETCH_DAYS at a time.
   */

  // TODO: This could be improved by inspecting the last datapoint fetched
  const cursor = vm[this.cursorName]
  const newStart = cursor.pos
  let newPos = cursor.pos.clone().add(SERIES_FETCH_DAYS, 'd')

  // Clamp pos to the end time
  if (newPos > cursor.end) newPos = cursor.end

  // Assign a new object for reactive updates
  const newCursor = vm[this.cursorName] = {}
  newCursor.start = newStart.clone()
  newCursor.pos = newPos.clone()
  newCursor.end = cursor.end

  return res
}

/**
 * Custom/reusable assigner to set model variables after fetching datapoints.
 */
function assignDatapoints (vm, res) {
  // datapointLookup returns an array of documents, each having datastream meatdata and datapoints
  // TODO: Remove - deprecated
  // vm.store.setDataset(this.datasetKey, res.filter(doc => {
  //   return doc.datapoints && doc.datapoints.data && doc.datapoints.data.length > 0
  // }))
  vm.store.setDataset(this.datasetKey, res)
}

/**
 * Reusable fetch for retrieving datapoints based on extended source properties (e.g. datastreamSpecs).
 */
function fetchDatapoints (vm) {
  const ids = getDatastreamIdsForLookup(vm.store.plainState.datastreamsByDsKey, this.datastreamSpecs, this.datastreamFilter, vm.units)
  const query = Object.assign(this.datapointsQuery(vm), {
    _id: ids.join(',')
  })

  logger.log('StationSources:fetchDatapoints::query', query)

  if (ids.length === 0) {
    // TODO: Cleanup - for debug
    console.error('No datastreams found for source', this)
    return Promise.reject(new Error('No datastreams found for source'))
  }

  return services.datapointLookup.find({
    query: query
  })
}

/**
 * Clears the dataset associated with a source.
 */
function clearDataset (vm) {
  vm[this.cursorName] = null
  vm.store.clearDataset(this.datasetKey)
}

/**
 * Datastream filter for absence of attributes (i.e. the 'default' datastream).
 */
function noAttributesFilter (datastream) {
  return !datastream.attributes
}

/**
 * Data source definitions for the station dashboard; used to configure a DataLoader.
 */
export default {

  /*
    Top-level datasets: station, contacts, datastreams, etc.
   */

  contactOrgs: {
    // Loader config
    clear (vm) {
      vm.store.clearContactOrgs()
    },
    guard (vm) {
      return vm.state.contactOrgIds && !vm.state.contactOrgs
    },
    fetch (vm) {
      return services.organization.find({
        query: {
          _id: {$in: vm.state.contactOrgIds},
          email: {$exists: true},
          $select: ['_id', 'email', 'name']
        }
      })
    },
    afterFetch (vm, res) {
      if (res && res.data) return res.data
    },
    assign (vm, orgs) {
      vm.store.setContactOrgs(orgs)
    }
  },

  contactPersons: {
    // Loader config
    clear (vm) {
      vm.store.clearContactPersons()
    },
    guard (vm) {
      return vm.state.contactPersonIds && !vm.state.contactPersons
    },
    fetch (vm) {
      return services.person.find({
        query: {
          _id: {$in: vm.state.contactPersonIds},
          email: {$exists: true},
          $select: ['_id', 'email', 'name']
        }
      })
    },
    afterFetch (vm, res) {
      if (res && res.data) return res.data
    },
    assign (vm, persons) {
      vm.store.setContactPersons(persons)
    }
  },

  datastreams: {
    // Loader config
    clear (vm) {
      vm.store.clearDatastreams()
    },
    guard (vm) {
      // NOTE: unitAbbrs is a dependency since __attrsInfo.text is populated in setDatastreams
      return vm.state.station && vm.state.unitAbbrs && !vm.store.plainState.datastreams
    },
    fetch (vm) {
      return services.datastream.find({
        query: {
          enabled: true,
          station_id: vm.state.station._id,
          $limit: 100,
          $select: ['_id', 'attributes', 'name', 'source_type', 'tags']
        }
      })
    },
    afterFetch (vm, res) {
      if (res && res.data && res.data.length > 0) return res.data
    },
    assign (vm, datastreams) {
      vm.store.setDatastreams(datastreams)
    }
  },

  station: {
    // Loader config
    clear (vm) {
      vm.store.clearStation()
    },
    guard (vm) {
      return vm.slug && !vm.state.station && !vm.stationError
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
    afterFetch (vm, res) {
      if (res && res.data && res.data.length > 0) return res.data[0]
    },
    assign (vm, station) {
      vm.store.setStation(station)
    }
  },

  // TODO: Move to AppSources.js?
  systemTime: {
    // Loader config
    clear (vm) {
      vm.store.clearSystemTime()
    },
    guard (vm) {
      return !vm.state.systemTime
    },
    fetch (vm) {
      return services.systemTime.get('utc')
    },
    afterFetch (vm, res) {
      if (res) return res
    },
    assign (vm, systemTime) {
      vm.store.setSystemTime(systemTime)
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
  },

  /*
    Single-value stats
   */

  currentStats: {
    // Extra config
    datasetKey: 'current',
    datastreamFilter: noAttributesFilter,
    datastreamSpecs: [
      {dsKey: 'Average_Air_BarometricPressure', dtUnits: {'PoundForcePerSquareInch': 'imp', 'Millibar': 'met'}},
      {dsKey: 'Average_Air_Direction', dtUnits: {'DegreeAngle': 'all'}},
      {dsKey: 'Average_Air_Moisture', dtUnits: {'Percent': 'all'}},
      {dsKey: 'Average_Air_Speed', dtUnits: {'MilePerHour': 'imp', 'MeterPerSecond': 'met'}},
      {dsKey: 'Average_Air_Temperature', dtUnits: {'DegreeFahrenheit': 'imp', 'DegreeCelsius': 'met'}},
      // TODO: Should be Average_Solar_PhotosyntheticallyActiveRadiation, MicromolePerSquareMeter
      {dsKey: 'Average_Solar_PhotosyntheticallyActiveRadiation', dtUnits: {'Micromole': 'all'}},
      {dsKey: 'Average_Solar_Radiation', dtUnits: {'WattPerSquareMeter': 'all'}},
      // TODO: Should be Cumulative_Day_Precipitation_Height, InchPerDay/MillimeterPerDay
      {dsKey: 'Cumulative_Day_Precipitation_Height', dtUnits: {'Inch': 'imp', 'Millimeter': 'met'}}
    ],
    // TODO: Remove - deprecated
    // datapointsQuery () {
    //   return {
    //     $limit: 1
    //   }
    // },
    datapointsQuery (vm) {
      const twentyFourHoursAgo = moment(vm.stationTime).utc().subtract(24, 'h')
      const time = stationMomentToUTCTime(twentyFourHoursAgo, vm.state.station.utc_offset)
      const iso = moment(time).utc().toISOString()
      return {
        time: {
          $gte: iso
        },
        $limit: 1
      }
    },

    // Loader config
    clear: clearDataset,
    guard (vm) {
      return vm.store.plainState.datastreams && vm.units && !vm.state.datasets.current
    },
    fetch: fetchDatapoints,
    assign: assignDatapoints
  },

  seasonalStats: {
    // Extra config
    datasetKey: 'seasonal',
    datastreamFilter: noAttributesFilter,
    datastreamSpecs: [
      {dsKey: 'Average_Seasonal_Air_Speed', dtUnits: {'MilePerHour': 'imp', 'MeterPerSecond': 'met'}},
      {dsKey: 'Maximum_Seasonal_Air_Moisture', dtUnits: {'Percent': 'all'}},
      {dsKey: 'Maximum_Seasonal_Air_Speed', dtUnits: {'MilePerHour': 'imp', 'MeterPerSecond': 'met'}},
      {dsKey: 'Maximum_Seasonal_Air_Temperature', dtUnits: {'DegreeFahrenheit': 'imp', 'DegreeCelsius': 'met'}},
      {dsKey: 'Minimum_Seasonal_Air_Moisture', dtUnits: {'Percent': 'all'}},
      {dsKey: 'Minimum_Seasonal_Air_Speed', dtUnits: {'MilePerHour': 'imp', 'MeterPerSecond': 'met'}},
      {dsKey: 'Minimum_Seasonal_Air_Temperature', dtUnits: {'DegreeFahrenheit': 'imp', 'DegreeCelsius': 'met'}}
    ],
    datapointsQuery (vm) {
      /*
        Monthly seasonal values are stamped with the first day of the current month in the prior year.
       */
      const startOfMonthPriorYear = moment(vm.stationTime).utc().startOf('M').subtract(1, 'y')
      const time = stationMomentToUTCTime(startOfMonthPriorYear, vm.state.station.utc_offset)
      const iso = moment(time).utc().toISOString()
      return {
        time: {
          $gte: iso,
          $lte: iso
        },
        $limit: 1
      }
    },

    // Loader config
    clear: clearDataset,
    guard (vm) {
      return vm.store.plainState.datastreams && vm.units && vm.stationTime && !vm.state.datasets.seasonal
    },
    fetch: fetchDatapoints,
    assign: assignDatapoints
  },

  yesterdayStats: {
    // Extra config
    datasetKey: 'yesterday',
    datastreamFilter: noAttributesFilter,
    datastreamSpecs: [
      // TODO: Should be Cumulative_Day_Precipitation_Height, InchPerDay/MillimeterPerDay
      {dsKey: 'Cumulative_Day_Precipitation_Height', dtUnits: {'Inch': 'imp', 'Millimeter': 'met'}}
    ],
    datapointsQuery (vm) {
      const startOfToday = moment(vm.stationTime).utc().startOf('d')
      const startOfYesterday = startOfToday.clone().subtract(1, 'd')
      const startTime = stationMomentToUTCTime(startOfYesterday, vm.state.station.utc_offset)
      const endTime = stationMomentToUTCTime(startOfToday, vm.state.station.utc_offset)
      return {
        time: {
          $gte: moment(startTime).utc().toISOString(),
          $lt: moment(endTime).utc().toISOString()
        },
        $limit: 1
      }
    },

    // Loader config
    clear: clearDataset,
    guard (vm) {
      return vm.store.plainState.datastreams && vm.units && vm.stationTime && !vm.state.datasets.yesterday
    },
    fetch: fetchDatapoints,
    assign: assignDatapoints
  },

  /*
    Chart timeseries data
   */

  airPresSeries: {
    // Extra config
    cursorName: 'airPresCursor',
    datasetKey: 'airPres',
    datastreamFilter: noAttributesFilter,
    datastreamSpecs: [
      {dsKey: 'Average_Air_BarometricPressure', dtUnits: {'PoundForcePerSquareInch': 'imp', 'Millibar': 'met'}}
    ],
    datapointsQuery: fwdCursorDatapointsQuery,

    // Loader config
    clear: clearDataset,
    guard: fwdCursorDatapointsGuard,
    beforeFetch: beforeFetchSeries,
    fetch: fetchDatapoints,
    afterFetch: afterFetchSeries,
    assign: assignDatapoints
  },

  airSpeedSeries: {
    // Extra config
    cursorName: 'airSpeedCursor',
    datasetKey: 'airSpeed',
    datastreamFilter: noAttributesFilter,
    datastreamSpecs: [
      {dsKey: 'Average_Air_Direction', dtUnits: {'DegreeAngle': 'all'}},
      {dsKey: 'Average_Air_Speed', dtUnits: {'MilePerHour': 'imp', 'MeterPerSecond': 'met'}},
      {dsKey: 'Maximum_Air_Speed', dtUnits: {'MilePerHour': 'imp', 'MeterPerSecond': 'met'}}
    ],
    datapointsQuery: fwdCursorDatapointsQuery,

    // Loader config
    clear: clearDataset,
    guard: fwdCursorDatapointsGuard,
    beforeFetch: beforeFetchSeries,
    fetch: fetchDatapoints,
    afterFetch: afterFetchSeries,
    assign: assignDatapoints
  },

  airTempSeries: {
    // Extra config
    cursorName: 'airTempCursor',
    datasetKey: 'airTemp',
    datastreamSpecs: [
      {dsKey: 'Average_Air_Temperature', dtUnits: {'DegreeFahrenheit': 'imp', 'DegreeCelsius': 'met'}}
    ],
    datapointsQuery: fwdCursorDatapointsQuery,

    // Loader config
    clear: clearDataset,
    guard: fwdCursorDatapointsGuard,
    beforeFetch: beforeFetchSeries,
    fetch: fetchDatapoints,
    afterFetch: afterFetchSeries,
    assign: assignDatapoints
  },

  soilTempSeries: {
    // Extra config
    cursorName: 'soilTempCursor',
    datasetKey: 'soilTemp',
    datastreamSpecs: [
      {dsKey: 'Average_Soil_Temperature', dtUnits: {'DegreeFahrenheit': 'imp', 'DegreeCelsius': 'met'}}
    ],
    datapointsQuery: fwdCursorDatapointsQuery,

    // Loader config
    clear: clearDataset,
    guard: fwdCursorDatapointsGuard,
    beforeFetch: beforeFetchSeries,
    fetch: fetchDatapoints,
    afterFetch: afterFetchSeries,
    assign: assignDatapoints
  },

  solarRadSeries: {
    // Extra config
    cursorName: 'solarRadCursor',
    datasetKey: 'solarRad',
    datastreamFilter: noAttributesFilter,
    datastreamSpecs: [
      // TODO: Should be Average_Solar_PhotosyntheticallyActiveRadiation, MicromolePerSquareMeter
      {dsKey: 'Average_Solar_PhotosyntheticallyActiveRadiation', dtUnits: {'Micromole': 'all'}},
      {dsKey: 'Average_Solar_Radiation', dtUnits: {'WattPerSquareMeter': 'all'}}
    ],
    datapointsQuery: fwdCursorDatapointsQuery,

    // Loader config
    clear: clearDataset,
    guard: fwdCursorDatapointsGuard,
    beforeFetch: beforeFetchSeries,
    fetch: fetchDatapoints,
    afterFetch: afterFetchSeries,
    assign: assignDatapoints
  },

  wyPrecipSeries: {
    // Extra config
    cursorName: 'wyPrecipCursor',
    datasetKey: 'wyPrecip',
    datastreamFilter: noAttributesFilter,
    datastreamSpecs: [
      // TODO: Should be Cumulative_Day_Precipitation_Height, InchPerDay/MillimeterPerDay
      {dsKey: 'Cumulative_Day_Precipitation_Height', dtUnits: {'Inch': 'imp', 'Millimeter': 'met'}}
    ],
    datapointsQuery: fwdCursorDatapointsQuery,

    // Loader config
    clear: clearDataset,
    guard: fwdCursorDatapointsGuard,
    beforeFetch (vm) {
      if (vm[this.cursorName]) return

      /*
        NOTE: Two years of daily precip. data will be fetched in one iteration.
       */
      const config = vm.wySeriesConfig
      const newCursor = vm[this.cursorName] = {}
      newCursor.start = moment(config.start).utc()
      newCursor.pos = moment(config.end).utc()
      newCursor.end = moment(config.end).utc()
    },
    fetch: fetchDatapoints,
    afterFetch: afterFetchSeries,
    assign: assignDatapoints
  }
}
