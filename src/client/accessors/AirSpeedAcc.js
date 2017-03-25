/**
 * Air (wind) speed data accessor.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module accessors/AirSpeedAcc
 */

import SpeedAcc from './SpeedAcc'

/**
 * Convert wind speed ranges to a force index [0...3] where:
 *
 *  (n, 3] m/s  blue    calm to light breeze
 *  (3, 5] m/s  green   gentle breeze
 *  (5, 8] m/s  yellow  moderate breeze
 *  (8, m] m/s  orange  strong breeze to gale
 */
function meterPerSecToIndex (mps) {
  if (mps <= 3) return 0
  if (mps > 3 && mps <= 5) return 1
  if (mps > 5 && mps <= 8) return 2
  return 3
}

class AirSpeedAcc extends SpeedAcc {

  get spdIndex () {
    const u = this.spdUnit
    if (u) return meterPerSecToIndex(u.toNumber('m/s'))
  }
}

export default AirSpeedAcc
