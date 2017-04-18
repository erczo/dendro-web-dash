/**
 * Exports a Vue store that encapsulates plain and reactive state for the download page.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module stores/DownloadStore
 */

import moment from 'moment'

const MIN_TIME = Date.UTC(1000, 0, 1)
const MAX_TIME = Date.UTC(3000, 0, 1)

const LEFT_EXT_LIMIT = Date.UTC(1970, 0, 1)

const presets = {
  recentDay: {
    name: 'Recent day',
    range (extent) {
      return [extent.right, extent.right]
    }
  },
  recentTwoWeeks: {
    name: 'Recent 2 weeks',
    range (extent) {
      // TODO: Finish
      return [extent.right.clone().subtract(14, 'd'), extent.right]
    }
  },
  recentMonth: {
    name: 'Recent month',
    range (extent) {
      // TODO: Finish
      return [extent.right.clone().startOf('M'), extent.right]
    }
  },
  recentYear: {
    name: 'Recent year',
    range (extent) {
      // TODO: Finish
      return [extent.right.clone().startOf('Y'), extent.right]
    }
  }
}

const orderedPresets = [
  presets.recentDay,
  presets.recentTwoWeeks,
  presets.recentMonth,
  presets.recentYear
]

/**
 * Create a friendly output field name.
 */
function getFieldName (station, datastream) {
  const parts = [
    station.slug.replace(/\W+/g, '_'),
    datastream.__dsKey.toLowerCase(),
    datastream.__dtUnit.toLowerCase()
  ]

  if (datastream.__attrsInfo && datastream.__attrsInfo.text) parts.push(datastream.__attrsInfo.text.replace(/\W+/g, '_'))

  return parts.join('_')
}

class DownloadStore {
  constructor () {
    this.presets = presets
    this.orderedPresets = orderedPresets

    // State that is NOT observed
    this.plainState = {
      fieldsByDatastreamId: null
    }

    // State that is observed and triggers reactivity in Vue
    this.reactiveState = {
      extent: null,
      fields: null,
      preset: null,
      range: {
        start: null,
        end: null
      },

      systemTime: null
    }
  }

  addFieldsForStationDatastreams (station, datastreams) {
    if (!station || !datastreams) return

    const offset = station.utc_offset
    const adjust = typeof offset === 'number' ? offset * 1000 : 0

    let fields = []

    datastreams.forEach(datastream => {
      const field = this.plainState.fieldsByDatastreamId && this.plainState.fieldsByDatastreamId[datastream._id]

      // Add new fields, or set selected for existing ones
      if (field) {
        field.selected = true
      } else {
        let minBeginsAt = MAX_TIME
        let maxEndsBefore = MIN_TIME

        // Compute the datastream's time extent
        const config = datastream.datapoints_config
        if (config) {
          config.forEach(inst => {
            const beginsAt = inst.begins_at ? (new Date(inst.begins_at)).getTime() : MIN_TIME
            const endsBefore = inst.ends_before ? (new Date(inst.ends_before)).getTime() : MAX_TIME

            minBeginsAt = Math.min(minBeginsAt, beginsAt)
            maxEndsBefore = Math.max(maxEndsBefore, endsBefore)
          })
        }

        fields.push({
          datastreamId: datastream._id,
          stationId: station._id,
          name: getFieldName(station, datastream),
          selected: true,
          timeAdjust: adjust,
          timeExtent: [
            // Shift to universal station time
            minBeginsAt + adjust,
            maxEndsBefore + adjust
          ]
        })
      }

      // Sort by field name
      fields = fields.sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })
    })

    this.appendFields(fields)
  }

  appendFields (newValue) {
    if (!newValue) return

    const byId = this.plainState.fieldsByDatastreamId

    newValue.forEach(field => {
      if (field.datastreamId) byId[field.datastreamId] = field
    })

    // SEE: https://vuejs.org/v2/guide/list.html#Caveats
    this.reactiveState.fields.push.apply(this.reactiveState.fields, newValue)

    this.updateExtent()
  }

  clearFields () { this.setFields(null) }

  clearRange () { this.setRange(null, null) }

  clearSystemTime () { this.setSystemTime(null) }

  initFields () {
    this.clearFields()

    this.setFields([{
      name: 'local_date_time',
      required: true,
      selected: true
    }, {
      name: 'utc_date_time',
      selected: false
    }, {
      name: 'utc_offset',
      selected: false
    }])
  }

  setExtent (newValue) {
    this.reactiveState.extent = newValue

    if (newValue) {
      const preset = this.reactiveState.preset
      const range = this.reactiveState.range

      if (preset) {
        this.setPreset(preset)
      } else if (range.start && range.end) {
        this.setRange(range.start, range.end)
      } else {
        this.setPreset(presets.recentTwoWeeks)
      }
    }
  }

  setFields (newValue) {
    let byId = null

    if (newValue) {
      byId = {}

      newValue.forEach(field => {
        if (field.datastreamId) byId[field.datastreamId] = field
      })
    }

    [this.plainState.fieldsByDatastreamId, this.reactiveState.fields] = [byId, newValue]

    this.updateExtent()
  }

  setFieldSelected (field, selected) {
    field.selected = selected

    this.updateExtent()
  }

  setFieldsSelected (fields, selected) {
    fields.forEach(field => {
      field.selected = selected || field.required
    })

    this.updateExtent()
  }

  setPreset (newValue) {
    const extent = this.reactiveState.extent
    if (extent && newValue) {
      this.setRange.apply(this, newValue.range(extent))
    }

    this.reactiveState.preset = newValue
  }

  setRange (newStart, newEnd) {
    this.setRangeStart(newStart)
    this.setRangeEnd(newEnd)
  }

  setRangeEnd (newValue) {
    let m = null

    if (newValue) m = moment(newValue).utc()

    const extent = this.reactiveState.extent
    if (extent && m && m.isAfter(extent.right)) {
      m = extent.right.clone()
    }

    [this.reactiveState.preset, this.reactiveState.range.end] = [null, m]
  }

  setRangeStart (newValue) {
    let m = null

    if (newValue) m = moment(newValue).utc()

    const extent = this.reactiveState.extent
    if (extent && m && m.isBefore(extent.left)) {
      m = extent.left.clone()
    }

    [this.reactiveState.preset, this.reactiveState.range.start] = [null, m]
  }

  setSystemTime (newValue) {
    let now = null

    if (newValue && newValue.now) {
      now = (new Date(newValue.now)).getTime()
    }

    this.reactiveState.systemTime = now

    this.updateExtent()
  }

  updateExtent () {
    let extent = null

    const fields = this.reactiveState.fields
    const sysTime = this.reactiveState.systemTime

    if (fields && sysTime) {
      let min, max

      fields.forEach(field => {
        const adj = field.timeAdjust
        const ext = field.timeExtent

        if (field.selected && ext) {
          // Clamp the field extent to [LEFT_EXT_LIMIT, CurrentStationTime]
          const extL = Math.max(ext[0], LEFT_EXT_LIMIT)
          const extR = Math.min(ext[1], sysTime + adj)

          // Then determine the largest extent serviced by all fields
          min = typeof min === 'number' ? Math.min(min, extL) : extL
          max = typeof max === 'number' ? Math.max(max, extR) : extR
        }
      })

      if (typeof min === 'number' && typeof max === 'number') {
        extent = {
          left: moment(min).utc().startOf('d'),
          right: moment(max).utc().startOf('d')
        }
      }
    }

    this.setExtent(extent)
  }
}

export default DownloadStore
