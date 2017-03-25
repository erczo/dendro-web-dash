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
      datastreamsById: null
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
    const obj = this.reactiveState.datasets[datasetKey] = {}

    if (!docs) return

    docs.forEach(doc => {
      const datastream = this.plainState.datastreamsById[doc._id]
      if (!datastream) return
      const dsKey = datastream.__dsKey
      if (!dsKey) return

      // Link the result doc to its datastream
      doc.datastream = datastream

      // Thin-out the result doc
      delete doc.attributes
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
    let [byDsKey, byId] = [null, null]

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

    [this.plainState.datastreams, this.plainState.datastreamsByDsKey, this.plainState.datastreamsById] = [newValue, byDsKey, byId]
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
