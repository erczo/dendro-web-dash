/**
 * Generic temperature data accessor.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/TempAcc
 */

import math from '../lib/math'
import {DataAccessor} from '../lib/dataaccessor'

const ROUND_DEG = {
  imp: (n) => { return math.round(n, 1) },
  met: (n) => { return math.round(n, 1) }
}

const UNIT_TO_DEG_NUM = {
  imp: (u) => { return u.toNumber('degF') },
  met: (u) => { return u.toNumber('degC') }
}

const RAW_DEG_TO_UNIT = {
  DegreeFahrenheit: (raw) => { return math.unit(raw, 'degF') },
  DegreeCelsius: (raw) => { return math.unit(raw, 'degC') },
  Undefined: (raw) => { return raw }
}

class TempAcc extends DataAccessor {

  set doc (newDoc) {
    super.doc = newDoc

    // Configure unit conversion based on current doc
    const dtUnit = this.dtUnit
    if (dtUnit) this.rawDegToUnit = RAW_DEG_TO_UNIT[dtUnit]
  }

  roundDeg (n) { return ROUND_DEG[this.vm.units](n) }

  unitToDegNum (u) { return UNIT_TO_DEG_NUM[this.vm.units](u) }

  get degRound () {
    const n = this.degNum
    if (typeof n === 'number') return this.roundDeg(n)
  }

  get degNum () {
    const u = this.degUnit
    if (u) return this.unitToDegNum(u)
  }

  get degUnit () {
    const raw = this.rawDeg
    if (typeof raw === 'number') return this.rawDegToUnit(raw)
  }

  get rawDeg () {
    if (this.point) return this.point.v
  }
}

export default TempAcc
