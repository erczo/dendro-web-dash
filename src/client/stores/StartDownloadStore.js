/**
 * Exports a Vue store that encapsulates plain and reactive state for the start download page.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module stores/StartDownloadStore
 */

// Make eslint happy, SEE: http://eslint.org/docs/user-guide/configuring#specifying-globals
/* global Blob, URL */

class StartDownloadStore {
  constructor () {
    this.blobOptions = {type: 'text/csv'}
    this.colSep = ','
    this.rowSep = '\r\n'

    // State that is NOT observed
    this.plainState = {
      blob: null,
      datastreamIds: null,
      datastreamIdsToFieldIndex: null,

      // Datapoints are organized into a dataset; populated by data loading
      dataset: null
    }

    // State that is observed and triggers reactivity in Vue
    this.reactiveState = {
      blobSize: null,
      blobURL: null,
      fieldNames: null
    }
  }

  appendDatasetToBlob () {
    if (!this.plainState.dataset) return

    /*
      Process the dataset keys in ascending time order; concat values to a string buffer
     */
    const dataset = this.plainState.dataset
    const buf = [this.plainState.blob]

    Object.keys(dataset).sort((a, b) => {
      return a - b // Ensure keys are sorted numerically
    }).forEach(key => {
      buf.push((new Date(parseInt(key))).toISOString().substr(0, 19).replace('T', ' ') + this.colSep + dataset[key].join(this.colSep) + this.rowSep)
    })

    this.setBlob(new Blob(buf, this.blobOptions))
  }

  clearBlob () {
    this.clearBlobURL()
    this.setBlob(null)
  }

  clearBlobURL () { this.setBlobURL(null) }

  clearDataset () { this.plainState.dataset = null }

  createBlobURL () {
    const blob = this.plainState.blob
    if (blob) this.setBlobURL(URL.createObjectURL(blob))
  }

  /*
    Populates a structured dataset given an array of result docs.

    Should be followed by a call to appendDatasetToDownload() to incrementally build up a Blob for downloading.
   */
  fillDataset (docs) {
    if (!docs) return

    const numFields = this.reactiveState.fieldNames.length
    const obj = this.plainState.dataset = this.plainState.dataset || {}

    docs.forEach(doc => {
      // Lookup field index in memory
      const index = this.plainState.datastreamIdsToFieldIndex[doc._id]
      if (typeof index !== 'number') return

      if (doc.datapoints && doc.datapoints.data && doc.datapoints.data.length > 0) {
        /*
          Iterate over datapoints; build-out pivot table with 'time' as the key
         */
        doc.datapoints.data.forEach(point => {
          const time = (new Date(point.t)).getTime() + (typeof point.o === 'number' ? point.o * 1000 : 0)
          if (!obj[time]) obj[time] = new Array(numFields).fill(null)
          obj[time][index] = point.v
          console.log('>>>', point.v)
        })
      }
    })
  }

  initForDownloadFields (fields, startIndex = 1) {
    let [blob, ids, idsToFieldIndex, names] = [null, null, null, null]

    if (fields) {
      [ids, idsToFieldIndex, names] = [[], {}, []]

      fields.filter((field, i) => {
        return i >= startIndex && field.selected && field.datastreamId
      }).forEach((field, i) => {
        idsToFieldIndex[field.datastreamId] = i
        ids.push(field.datastreamId)
        names.push(field.name)
      })

      blob = new Blob(['local_date_time' + this.colSep + names.join(this.colSep) + this.rowSep], this.blobOptions)
    }

    [this.plainState.blob, this.plainState.datastreamIds, this.plainState.datastreamIdsToFieldIndex, this.reactiveState.fieldNames] = [blob, ids, idsToFieldIndex, names]
  }

  setBlob (newValue) {
    let size = null

    const oldBlob = this.plainState.blob
    if (oldBlob && typeof oldBlob.close === 'function') oldBlob.close()

    if (newValue) {
      size = newValue.size
    }

    [this.plainState.blob, this.reactiveState.blobSize] = [newValue, size]
  }

  setBlobURL (newValue) {
    const oldURL = this.reactiveState.blobURL
    if (oldURL) URL.revokeObjectURL(oldURL)

    this.reactiveState.blobURL = newValue
  }
}

export default StartDownloadStore
