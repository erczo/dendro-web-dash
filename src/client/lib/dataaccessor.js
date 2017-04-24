/**
 * Utility class for navigating and accessing datapoints stored in the model.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/dataaccessor
 */

/*
  NOTE: A data accessor is instantiated to read 'like' result docs under a given tagKey.

  Datasets are organized in the model as shown:
    datasets: {
      DATASET_KEY: {
        TAG_KEY: [DOC, DOC, ...]
        ]
      }
    }

  Where an individual document (DOC) containing datapoints is strucured as:
    {
      METADATA_FIELD,
      ...,
      datapoints: {
        data: [POINT, POINT, ...]
      }
    }
 */

class DataAccessor {
  constructor (vm, tagKey, options) {
    this.dataSortPredicate = this.docsSortPredicate = null
    this.tagKey = tagKey
    this.options = options
    this.vm = vm

    this.init()
  }

  init (dataset) {
    this.dataset = dataset
    return this
  }

  get dataset () { return this._dataset }
  set dataset (newDataset) {
    const d = this._dataset = newDataset
    this.docs = d && d[this.tagKey] ? d[this.tagKey] : []
  }

  get docs () { return this._docs }
  set docs (newDocs) {
    const d = this._docs = (typeof this.docsSortPredicate === 'function') ? newDocs.sort(this.docsSortPredicate) : newDocs
    this.doc = d && (d.length > 0) ? d[0] : {}
  }

  get doc () { return this._doc }
  set doc (newDoc) {
    const d = this._doc = newDoc
    this.data = d && d.datapoints && d.datapoints.data ? d.datapoints.data : []
  }

  get data () { return this._data }
  set data (newData) {
    const d = this._data = (typeof this.dataSortPredicate === 'function') ? newData.sort(this.dataSortPredicate) : newData
    this.point = d && (d.length > 0) ? d[0] : null
  }

  get dtUnit () {
    return (this._doc && this._doc.datastream ? this._doc.datastream.__dtUnit : null) || 'Undefined'
  }

  get time () {
    if (this.point) return (new Date(this.point.t)).getTime() + (typeof this.point.o === 'number' ? this.point.o * 1000 : 0)
  }
}

export {
  DataAccessor
}
