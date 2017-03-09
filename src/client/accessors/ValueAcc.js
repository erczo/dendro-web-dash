/**
 * Generic value data accessor.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/ValueAcc
 */

import math from '../lib/math'
import {DataAccessor} from '../lib/dataaccessor'

class ValueAcc extends DataAccessor {
  constructor (...args) {
    super(...args)

    this.options = Object.assign({
      round: 0
    }, this.options)
  }

  roundVal (n) { return math.round(n, this.options.round) }

  get valRound () {
    const n = this.valNum
    if (typeof n === 'number') return this.roundVal(n)
  }

  get valNum () {
    return this.rawVal
  }

  get rawVal () {
    if (this.point) return this.point.v
  }
}

export default ValueAcc
