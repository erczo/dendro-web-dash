/**
 * Cardinal direction data accessor.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/CardinalDirAcc
 */

import math from '../lib/math'
import {DataAccessor} from '../lib/dataaccessor'

const DIR_NAMES = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']

/**
 * Convert wind direction degrees to a directional index [0...15].
 */
function degToIndex (deg) {
  return Math.abs(Math.round((deg % 360 + (deg < 0 ? 360 : 0) - 11.25) / 22.5))
}

class CardinalDirAcc extends DataAccessor {

  roundDeg (n) { return math.round(n, 1) }

  get dirIndex () {
    const raw = this.rawDeg
    if (typeof raw === 'number') return degToIndex(raw)
  }

  get dirName () {
    const i = this.dirIndex
    if (typeof i === 'number') return DIR_NAMES[i]
  }

  get degRound () {
    const n = this.degNum
    if (typeof n === 'number') return this.roundDeg(n)
  }

  get degNum () {
    return this.rawDeg
  }

  get rawDeg () {
    if (this.point) return this.point.v
  }
}

export default CardinalDirAcc
