/**
 * Generic data object accessor.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/DataObjAcc
 */

import {DataAccessor} from '../lib/dataaccessor'

class DataAcc extends DataAccessor {

  get rawData () {
    if (this.point) return this.point.d
  }
}

export default DataAcc
