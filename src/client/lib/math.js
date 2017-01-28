/**
 * Math.js exported with custom bundling.
 * SEE: https://github.com/josdejong/mathjs/blob/2b95c65a30a84cdd0d48a3994e194ea339ef9c87/docs/custom_bundling.md
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/utils
 */

import core from 'mathjs/core'

const math = core.create()
math.import(require('mathjs/lib/type/unit'))
math.import(require('mathjs/lib/function/unit'))
math.import(require('mathjs/lib/function/arithmetic/round'))

export default math
