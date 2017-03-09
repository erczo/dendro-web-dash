/**
 * Generic length data accessor.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/LengthAcc
 */

import math from '../lib/math'
import {DataAccessor} from '../lib/dataaccessor'

const ROUND_LEN = {
  imp: (n) => { return math.round(n, 1) },
  met: (n) => { return math.round(n, 0) }
}

const UNIT_TO_LEN_NUM = {
  imp: (u) => { return u.toNumber('in') },
  met: (u) => { return u.toNumber('mm') }
}

const RAW_LEN_TO_UNIT = {
  Inch: (raw) => { return math.unit(raw, 'in') },
  Millimeter: (raw) => { return math.unit(raw, 'mm') },
  Undefined: (raw) => { return raw }
}

class LengthAcc extends DataAccessor {

  set doc (newDoc) {
    super.doc = newDoc

    // Configure unit conversion based on current doc
    const dtUnit = this.dtUnit
    if (dtUnit) this.rawLenToUnit = RAW_LEN_TO_UNIT[dtUnit]
  }

  roundLen (n) { return ROUND_LEN[this.vm.units](n) }

  unitToLenNum (u) { return UNIT_TO_LEN_NUM[this.vm.units](u) }

  get lenRound () {
    const n = this.lenNum
    if (typeof n === 'number') return this.roundLen(n)
  }

  get lenNum () {
    const u = this.lenUnit
    if (u) return this.unitToLenNum(u)
  }

  get lenUnit () {
    const raw = this.rawLen
    if (typeof raw === 'number') return this.rawLenToUnit(raw)
  }

  get rawLen () {
    if (this.point) return this.point.v
  }
}

export default LengthAcc
