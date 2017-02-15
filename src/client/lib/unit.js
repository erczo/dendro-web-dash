/*
  Strategies for handling lookups based on the user's units selection.
 */
const UNIT_STRATEGIES = {
  // e.g. if Imperial is selected, then use Imperial datastreams with Metric as fallback
  imp: ['imp', 'met'],
  met: ['met', 'imp']
}

export {
  UNIT_STRATEGIES
}
