/**
 * Generic pressure data accessor.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/PresAcc
 */

import math from '../lib/math'
import {DataAccessor} from '../lib/dataaccessor'

const ROUND_PRES = {
  imp: (n) => { return math.round(n, 3) },
  met: (n) => { return math.round(n, 1) }
}

const UNIT_TO_PRES_NUM = {
  imp: (u) => { return u.toNumber('psi') },
  met: (u) => { return u.toNumber('mbar') }
}

const RAW_PRES_TO_UNIT = {
  PoundForcePerSquareInch: (raw) => { return math.unit(raw, 'psi') },
  Millibar: (raw) => { return math.unit(raw, 'mbar') },
  Undefined: (raw) => { return raw }
}

class PresAcc extends DataAccessor {

  set doc (newDoc) {
    super.doc = newDoc

    // Configure unit conversion based on current doc
    const dtUnit = this.dtUnit
    if (dtUnit) this.rawPresToUnit = RAW_PRES_TO_UNIT[dtUnit]
  }

  roundPres (n) { return ROUND_PRES[this.vm.units](n) }

  unitToPresNum (u) { return UNIT_TO_PRES_NUM[this.vm.units](u) }

  get presRound () {
    const n = this.presNum
    if (typeof n === 'number') return this.roundPres(n)
  }

  get presNum () {
    const u = this.presUnit
    if (u) return this.unitToPresNum(u)
  }

  get presUnit () {
    const raw = this.rawPres
    if (typeof raw === 'number') return this.rawPresToUnit(raw)
  }

  get rawPres () {
    if (this.point) return this.point.v
  }
}

export default PresAcc
