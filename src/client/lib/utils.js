/**
 * Web dashboard utilities and helpers.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/utils
 */

const TAG_PREFIX_REGEX = /^(ds|dt)_\w+$/

/**
 * Convert vocabulary tags to a shortened, standardized key.
 */
function tagsToKey (tags) {
  return tags.filter(tag => {
    return TAG_PREFIX_REGEX.test(tag)
  }).sort().map(tag => {
    return tag.split('_').pop()
  }).join('_')
}

/**
 * Convert wind direction degrees to a directional index [0...15].
 */
function windDegToIndex (deg) {
  return Math.abs(Math.round((deg % 360 + (deg < 0 ? 360 : 0) - 11.25) / 22.5))
}

export {
  tagsToKey,
  windDegToIndex
}
