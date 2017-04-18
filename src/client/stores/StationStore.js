/**
 * Exports a Vue store that encapsulates plain and reactive state for the station dashboard.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module stores/StationStore
 */

import {hashString} from '../lib/murmurhash3'

const DS_REGEX = /^ds_\w+$/
const DT_UNIT_REGEX = /^dt_Unit_\w+$/

/**
 * Evaluate attributes for a datastream and generate info suitable for display and sorting.
 */
function getAttrsInfo (attrs, unitAbbrs) {
  const info = {
    hash: 0, // Non-cryptographic hash for uniquing
    index: 0, // Sort index
    text: '' // Descriptive text
  }

  if (typeof attrs !== 'object') return info

  // TODO: Not sure if this is performant; but it does what we want
  const data = JSON.stringify(attrs)
  info.hash = hashString(data, data.length, 0)

  const firstKey = Object.keys(attrs)[0]
  if (!firstKey) return info

  const ary = []
  const obj = attrs[firstKey]

  // Infer a sort index and description based on numeric fields
  if (obj.delta && obj.delta.length > 1) {
    info.index = parseFloat(`${obj.delta[0]}.${obj.delta[1]}`)
    ary.push(`${obj.delta[0]}-${obj.delta[1]}`)
  } else if (obj.range && obj.range.length > 1) {
    info.index = parseFloat(`${obj.range[0]}.${obj.range[1]}`)
    ary.push(`${obj.range[0]}...${obj.range[1]}`)
  } else if (obj.value) {
    info.index = obj.value
    ary.push(`${obj.value}`)
  }

  // Lookup an abbreviation given the unit
  if (obj.unit && unitAbbrs[obj.unit]) ary.push(unitAbbrs[obj.unit])

  info.text = ary.join(' ')

  return info
}

/**
 * Create a standardized, shortened key representing 'ds' vocabulary tags.
 */
function getDsKey (tags) {
  return tags.filter(tag => {
    return DS_REGEX.test(tag)
  }).sort().map(tag => {
    return tag.split('_').pop()
  }).join('_')
}

/**
 * Extract the 'dt-unit' vocabulary term label from datastream tags.
 */
function getDtUnit (tags) {
  const found = tags.find(tag => {
    return DT_UNIT_REGEX.test(tag)
  })
  if (found) return found.split('_').pop()
}

class StationStore {
  constructor () {
    // State that is NOT observed
    this.plainState = {
      datastreams: null,
      datastreamsByDsKey: null,
      datastreamsById: null,

      // Recent datapoint time for each datastream; includes _max
      timestamps: null
    }

    // State that is observed and triggers reactivity in Vue
    this.reactiveState = {
      contactOrgIds: null,
      contactOrgs: null,
      contactPersonIds: null,
      contactPersons: null,

      // Datapoints are organized into datasets; populated by data loading
      datasets: {
        airPres: null,
        airSpeed: null,
        airTemp: null,
        current: null,
        seasonal: null,
        soilTemp: null,
        solarRad: null,
        wyPrecip: null,
        yesterday: null
      },

      station: null,
      systemTime: null,
      unitAbbrs: null
    }
  }

  clearContactOrgs () { this.setContactOrgs(null) }

  clearContactPersons () { this.setContactPersons(null) }

  clearDataset (datasetKey) { this.reactiveState.datasets[datasetKey] = null }

  clearDatastreams () { this.setDatastreams(null) }

  clearStation () { this.setStation(null) }

  clearSystemTime () { this.setSystemTime(null) }

  clearUnitVocabulary () { this.setUnitVocabulary(null) }

  setContactOrgs (newValue) {
    this.reactiveState.contactOrgs = newValue
  }

  setContactPersons (newValue) {
    this.reactiveState.contactPersons = newValue
  }

  setDataset (datasetKey, docs) {
    if (!docs) return

    /*
      NOTE: We start with an empty object and THEN assign properties. This is important since we intentionally want
      to avoid observing every datapoint. Simply put, we are leveraging the fact that Vue cannot detect property
      addition or deletion - you must use $set to achieve that.

      SEE: https://vuejs.org/v2/guide/reactivity.html
     */
    const obj = this.reactiveState.datasets[datasetKey] = {}

    docs.forEach(doc => {
      // Lookup datastream in memory
      const datastream = this.plainState.datastreamsById[doc._id]
      if (!datastream) return
      const dsKey = datastream.__dsKey
      if (!dsKey) return

      // Link the result doc to its datastream
      doc.datastream = datastream

      // Maintain latest time of datapoints for notifications
      // TODO: Only concerned about 'sensor' types now; resolve this with proper event logging
      if (datastream.source_type !== 'sensor') {
        // Exclude types other than sensor
      } else if (doc.datapoints && doc.datapoints.data && doc.datapoints.data.length > 0) {
        // We count on the fact that datapoints are either sorted ASC or DESC by time
        const data = doc.datapoints.data
        const firstPoint = data[0]
        const lastPoint = data[data.length - 1]
        const firstTime = (new Date(firstPoint.t)).getTime() + (typeof firstPoint.o === 'number' ? firstPoint.o * 1000 : 0)
        const lastTime = (new Date(lastPoint.t)).getTime() + (typeof lastPoint.o === 'number' ? lastPoint.o * 1000 : 0)

        this.plainState.timestamps[doc._id] = Math.max(this.plainState.timestamps[doc._id] || 0, firstTime, lastTime)
        this.plainState.timestamps._max = Math.max(this.plainState.timestamps._max || 0, firstTime, lastTime)
      } else {
        this.plainState.timestamps[doc._id] = this.plainState.timestamps[doc._id] || 0
      }

      // Thin-out the result doc
      delete doc.attributes
      delete doc.station_id
      delete doc.tags
      delete doc._id

      /*
        Coalese result docs under dsKey within the dataset.
       */

      if (!obj[dsKey]) obj[dsKey] = []
      obj[dsKey].push(doc)
    })
  }

  setDatastreams (newValue) {
    let [byDsKey, byId] = [null, null, null]

    if (newValue) {
      byDsKey = {}
      byId = {}

      newValue.forEach(datastream => {
        const dsKey = getDsKey(datastream.tags)

        datastream.__attrsInfo = getAttrsInfo(datastream.attributes, this.reactiveState.unitAbbrs)
        datastream.__dtUnit = getDtUnit(datastream.tags)
        datastream.__dsKey = dsKey

        /*
          'Index' datastreams by dsKey and _id for faster lookup elsewhere.
         */

        if (!byDsKey[dsKey]) byDsKey[dsKey] = []
        byDsKey[dsKey].push(datastream)

        byId[datastream._id] = datastream

        // Thin-out the datastream
        delete datastream.tags
      })
    }

    [this.plainState.datastreams, this.plainState.datastreamsByDsKey, this.plainState.datastreamsById, this.plainState.timestamps] = [newValue, byDsKey, byId, {}]
  }

  setStation (newValue) {
    let [orgIds, personIds] = [null, null]

    if (newValue && newValue.members) {
      [orgIds, personIds] = [[], []]

      newValue.members.filter(member => {
        return member.roles.indexOf('contact') > -1
      }).forEach(member => {
        if (member.organization_id) orgIds.push(member.organization_id)
        if (member.person_id) personIds.push(member.person_id)
      })
    }

    [this.reactiveState.station, this.reactiveState.contactOrgIds, this.reactiveState.contactPersonIds] = [newValue, orgIds, personIds]
  }

  setSystemTime (newValue) {
    let now = null

    if (newValue && newValue.now) {
      now = (new Date(newValue.now)).getTime()
    }

    this.reactiveState.systemTime = now
  }

  setUnitVocabulary (newValue) {
    let abbrs = null

    if (newValue && newValue.terms) {
      abbrs = {}

      newValue.terms.forEach(term => {
        // Create a map from unit label to abbreviation
        abbrs[term.label] = term.abbreviation
      })
    }

    this.reactiveState.unitAbbrs = abbrs
  }
}

export default StationStore
