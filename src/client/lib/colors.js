/**
 * App colors.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/colors
 */

import chroma from 'chroma-js'

const WHEEL = {
  // Color wheel colors, 12 plus 1 extra WHEEL_BLUE_BLUE_GREEN
  // SEE: http://www.malanenewman.com/images/colorwheel_warm_cool.gif
  RED: '#dc635c',
  RED_ORANGE: '#dc7d5c',
  ORANGE: '#dcac5c',
  YELLOW_ORANGE: '#dcd095',
  YELLOW: '#d8dc5c',
  YELLOW_GREEN: '#aedc5c',
  GREEN: '#5cdc71',
  BLUE_GREEN: '#5cdcbf',
  BLUE_BLUE_GREEN: '#5cb6dc',
  BLUE: '#5ca1dc',
  BLUE_VIOLET: '#a695dc',
  VIOLET: '#af7abe',
  RED_VIOLET: '#dc95b6'
}

const BOOTSTRAP = {
  RED: WHEEL.RED,
  ORANGE: WHEEL.ORANGE,
  YELLOW: WHEEL.YELLOW,
  GREEN: WHEEL.YELLOW_GREEN,
  BLUE: WHEEL.BLUE,
  TEAL: WHEEL.BLUE_GREEN,
  PINK: WHEEL.RED_VIOLET,
  PURPLE: WHEEL.BLUE_VIOLET
}

const TILE = {
  AIR_MOIST: chroma(WHEEL.BLUE).darken(0.5).hex(),
  AIR_PRES: chroma(WHEEL.BLUE).darken(0.5).hex(),
  AIR_TEMP: chroma(WHEEL.BLUE).darken(0.5).hex(),
  NOTIFY_OFFLINE: chroma(WHEEL.RED).darken(0.5).hex(),
  NOTIFY_ONLINE: chroma(WHEEL.YELLOW_GREEN).darken(0.5).hex(),
  PRECIP: chroma(WHEEL.BLUE_GREEN).darken(0.5).hex(),
  SOLAR: chroma(WHEEL.ORANGE).darken(0.5).hex(),
  WIND: chroma(WHEEL.BLUE_VIOLET).darken(0.5).hex()
}

export default {
  BOOTSTRAP,
  TILE,
  WHEEL
}
