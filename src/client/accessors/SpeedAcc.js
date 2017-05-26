/**
 * Generic speed data accessor.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/SpeedAcc
 */

import math from '../lib/math'
import {DataAccessor} from '../lib/dataaccessor'

const ROUND_SPD = {
  imp: (n) => { return math.round(n, 1) },
  met: (n) => { return math.round(n, 1) }
}

const UNIT_TO_SPD_NUM = {
  imp: (u) => { return u.toNumber('mi/h') },
  met: (u) => { return u.toNumber('m/s') }
}

const RAW_SPD_TO_UNIT = {
  MilePerHour: (raw) => { return math.unit(raw, 'mi/h') },
  MeterPerSecond: (raw) => { return math.unit(raw, 'm/s') },
  Undefined: (raw) => { return raw }
}

class SpeedAcc extends DataAccessor {
  set doc (newDoc) {
    super.doc = newDoc

    // Configure unit conversion based on current doc
    const dtUnit = this.dtUnit
    if (dtUnit) this.rawSpdToUnit = RAW_SPD_TO_UNIT[dtUnit]
  }

  roundSpd (n) { return ROUND_SPD[this.vm.units](n) }

  unitToSpdNum (u) { return UNIT_TO_SPD_NUM[this.vm.units](u) }

  get spdRound () {
    const n = this.spdNum
    if (typeof n === 'number') return this.roundSpd(n)
  }

  get spdNum () {
    const u = this.spdUnit
    if (u) return this.unitToSpdNum(u)
  }

  get spdUnit () {
    const raw = this.rawSpd
    if (typeof raw === 'number') return this.rawSpdToUnit(raw)
  }

  get rawSpd () {
    if (this.point) return this.point.v
  }
}

export default SpeedAcc
