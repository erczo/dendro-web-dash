/**
 * Exports DataLoader sources for the station dashboard. Includes helpers to manage the fetching of dashboard data.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module sources/StationSources
 */

import moment from 'moment'
import logger from '../lib/logger'
import services from '../lib/services'

// Given 5 min data, fetching 4 days at a time will yield 1152 datapoints per fetch
const SERIES_FETCH_DAYS = 4

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
      $gte: moment(startTime).toISOString(),
      $lt: moment(posTime).toISOString()
    },
    $limit: 2000,
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
 *    {tagKey: 'Average_Air_Speed', dtUnits: {'MilePerHour': 'imp', 'MeterPerSecond': 'met'}},
 *    {tagKey: 'Average_Air_Temperature', dtUnits: {'DegreeFahrenheit': 'imp', 'DegreeCelsius': 'met'}}
 *  ]
 */
function getDatastreamIdsForLookup (datastreamsByTagKey, specs, filter, units) {
  const filterFn = typeof filter === 'function' ? filter : function () {
    return true
  }
  const order = UNITS_ORDER[units]
  const ids = []

  specs.forEach(spec => {
    const hashIdMap = [{}, {}]
    const datastreams = datastreamsByTagKey[spec.tagKey]
    if (datastreams) {
      datastreams.filter(filterFn).forEach(datastream => {
        if (spec.dtUnits) {
          let u = spec.dtUnits[datastream.__dtUnit]
          if (u) {
            const n = order[u]
            if (n > 0) hashIdMap[n - 1][datastream.__attrsInfo.hash] = datastream._id
          }
        } else {
          hashIdMap[1][datastream.__attrsInfo.hash] = datastream._id
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
    Init cursor to fetch points within the interval [start, pos).
   */
  const config = vm.seriesConfig
  const newCursor = vm[this.cursorName] = {}
  newCursor.start = config.start
  newCursor.pos = config.start.clone().add(SERIES_FETCH_DAYS, 'd')
  newCursor.end = config.end
}

function afterFetchSeries (vm, res) {
  /*
    Move the cursor down to fetch additional days.
   */

  // TODO: This could be improved by inspecting the last datapoint fetched
  const cursor = vm[this.cursorName]

  let newStart
  let newPos

  if (Array.isArray(res) && res.length > 0) {
    newStart = cursor.pos
    newPos = cursor.pos.clone().add(SERIES_FETCH_DAYS, 'd')
  } else {
    newStart = newPos = cursor.end
  }

  // Clamp pos to the end time
  if (newPos > cursor.end) newPos = cursor.end

  // Assign a new object for reactive updates
  const newCursor = vm[this.cursorName] = {}
  newCursor.start = newStart
  newCursor.pos = newPos
  newCursor.end = cursor.end

  return res
}

/**
 * Custom/reusable assigner to set model variables after fetching datapoints.
 */
function assignDatapoints (vm, res) {
  // datapointLookup returns an array of documents, each having datastream meatdata and datapoints
  vm.store.fillDataset(this.datasetKey, res)
}

/**
 * Reusable fetch for retrieving datapoints based on extended source properties (e.g. datastreamSpecs).
 */
function fetchDatapoints (vm) {
  const ids = getDatastreamIdsForLookup(vm.store.plainState.datastreamsByTagKey, this.datastreamSpecs, this.datastreamFilter, vm.units)
  const query = Object.assign(this.datapointsQuery(vm), {
    _id: ids.join(',')
  })

  logger.log('StationSources:fetchDatapoints::datasetKey,query', this.datasetKey, query)

  if (ids.length === 0) {
    logger.warn('StationSources:fetchDatapoints::noDatastreamsForSource', this)
    return Promise.resolve([])
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
          $or: [
            {source: 'gov.noaa.nws.ndfd.rest.xml', tags: 'dw_Interface_Summarized'},
            {station_id: {$eq: vm.state.station._id}}
          ],
          $limit: 200,
          $select: ['_id', 'attributes', 'datapoints_config', 'name', 'source_type', 'station_id', 'tags']
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

  /*
    Single-value stats
   */

  currentStats: {
    // Extra config
    datasetKey: 'current',
    datastreamFilter: noAttributesFilter,
    datastreamSpecs: [
      {tagKey: 'Average_Air_BarometricPressure', dtUnits: {'PoundForcePerSquareInch': 'imp', 'Millibar': 'met'}},
      {tagKey: 'Average_Air_Direction', dtUnits: {'DegreeAngle': 'all'}},
      {tagKey: 'Average_Air_RelativeHumidity', dtUnits: {'Percent': 'all'}},
      {tagKey: 'Average_Air_Speed', dtUnits: {'MilePerHour': 'imp', 'MeterPerSecond': 'met'}},
      {tagKey: 'Average_Air_Temperature', dtUnits: {'DegreeFahrenheit': 'imp', 'DegreeCelsius': 'met'}},
      {tagKey: 'Average_Solar_PhotosyntheticallyActiveRadiation', dtUnits: {'MicromolePerSquareMeter': 'all'}},
      {tagKey: 'Average_Solar_Radiation', dtUnits: {'WattPerSquareMeter': 'all'}},
      // TODO: Should be Cumulative_Day_Precipitation_Height, InchPerDay/MillimeterPerDay
      {tagKey: 'Cumulative_Day_Precipitation_Height', dtUnits: {'Inch': 'imp', 'Millimeter': 'met'}}
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
      const iso = moment(time).toISOString()
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
      {tagKey: 'Average_Seasonal_Air_Speed', dtUnits: {'MilePerHour': 'imp', 'MeterPerSecond': 'met'}},
      {tagKey: 'Maximum_Seasonal_Air_RelativeHumidity', dtUnits: {'Percent': 'all'}},
      {tagKey: 'Maximum_Seasonal_Air_Speed', dtUnits: {'MilePerHour': 'imp', 'MeterPerSecond': 'met'}},
      {tagKey: 'Maximum_Seasonal_Air_Temperature', dtUnits: {'DegreeFahrenheit': 'imp', 'DegreeCelsius': 'met'}},
      {tagKey: 'Minimum_Seasonal_Air_RelativeHumidity', dtUnits: {'Percent': 'all'}},
      {tagKey: 'Minimum_Seasonal_Air_Speed', dtUnits: {'MilePerHour': 'imp', 'MeterPerSecond': 'met'}},
      {tagKey: 'Minimum_Seasonal_Air_Temperature', dtUnits: {'DegreeFahrenheit': 'imp', 'DegreeCelsius': 'met'}}
    ],
    datapointsQuery (vm) {
      /*
        Monthly seasonal values are stamped with the first day of the current month in the prior year.
       */
      const startOfMonthPriorYear = moment(vm.stationTime).utc().startOf('M').subtract(1, 'y')
      const time = stationMomentToUTCTime(startOfMonthPriorYear, vm.state.station.utc_offset)
      const iso = moment(time).toISOString()
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
      {tagKey: 'Cumulative_Day_Precipitation_Height', dtUnits: {'Inch': 'imp', 'Millimeter': 'met'}}
    ],
    datapointsQuery (vm) {
      const startOfToday = moment(vm.stationTime).utc().startOf('d')
      const startOfYesterday = startOfToday.clone().subtract(1, 'd')
      const startTime = stationMomentToUTCTime(startOfYesterday, vm.state.station.utc_offset)
      const endTime = stationMomentToUTCTime(startOfToday, vm.state.station.utc_offset)
      return {
        time: {
          $gte: moment(startTime).toISOString(),
          $lt: moment(endTime).toISOString()
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
      {tagKey: 'Average_Air_BarometricPressure', dtUnits: {'PoundForcePerSquareInch': 'imp', 'Millibar': 'met'}}
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
      {tagKey: 'Average_Air_Direction', dtUnits: {'DegreeAngle': 'all'}},
      {tagKey: 'Average_Air_Speed', dtUnits: {'MilePerHour': 'imp', 'MeterPerSecond': 'met'}},
      {tagKey: 'Maximum_Air_Speed', dtUnits: {'MilePerHour': 'imp', 'MeterPerSecond': 'met'}}
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
      {tagKey: 'Average_Air_Temperature', dtUnits: {'DegreeFahrenheit': 'imp', 'DegreeCelsius': 'met'}}
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
      {tagKey: 'Average_Soil_Temperature', dtUnits: {'DegreeFahrenheit': 'imp', 'DegreeCelsius': 'met'}}
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
      {tagKey: 'Average_Solar_PhotosyntheticallyActiveRadiation', dtUnits: {'MicromolePerSquareMeter': 'all'}},
      {tagKey: 'Average_Solar_Radiation', dtUnits: {'WattPerSquareMeter': 'all'}}
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
      {tagKey: 'Cumulative_Day_Precipitation_Height', dtUnits: {'Inch': 'imp', 'Millimeter': 'met'}}
    ],
    datapointsQuery: fwdCursorDatapointsQuery,

    // Loader config
    clear: clearDataset,
    guard: fwdCursorDatapointsGuard,
    beforeFetch (vm) {
      if (vm[this.cursorName]) return

      /*
        NOTE: Two years of daily precip. data will be fetched all at once.
       */
      const config = vm.wySeriesConfig
      const newCursor = vm[this.cursorName] = {}
      newCursor.start = config.start
      newCursor.pos = config.end
      newCursor.end = config.end
    },
    fetch: fetchDatapoints,
    afterFetch: afterFetchSeries,
    assign: assignDatapoints
  },

  /*
    Weather forecast data
   */

  forecastSeries: {
    // Extra config
    datasetKey: 'forecast',
    datastreamFilter: noAttributesFilter,
    datastreamSpecs: [
      {tagKey: 'ForecastNWS_Summarized_ConditionsIcon_7Day_12Hourly'},
      // TODO: Remove - may not implement this
      // {tagKey: 'Summarized_ProbabilityOfPrecipitation_7Day_12Hourly', dtUnits: {'Percent': 'all'}},
      {tagKey: 'Summarized_Temperature_7Day_12Hourly_Maximum', dtUnits: {'DegreeCelsius': 'all'}},
      {tagKey: 'Summarized_Temperature_7Day_12Hourly_Minimum', dtUnits: {'DegreeCelsius': 'all'}},
      {tagKey: 'Summarized_Weather_7Day_12Hourly'}
    ],
    datapointsQuery (vm) {
      const startOfToday = moment(vm.stationTime).utc().startOf('d')
      const startTime = stationMomentToUTCTime(startOfToday, vm.state.station.utc_offset)
      const coordinates = vm.state.station.geo.coordinates
      return {
        lat: coordinates[1],
        lng: coordinates[0],
        time: {
          $gte: moment(startTime).toISOString()
        },
        $limit: 20,
        $sort: {time: 1} // ASC
      }
    },

    // Loader config
    clear: clearDataset,
    guard (vm) {
      return vm.store.plainState.datastreams && vm.units && vm.stationTime && vm.state.station.geo && vm.state.station.geo.coordinates && (vm.state.station.geo.coordinates.length > 1) && !vm.state.datasets.forecast
    },
    fetch: fetchDatapoints,
    assign: assignDatapoints
  }
}
