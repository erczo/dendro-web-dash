/**
 * Exports a Vue store that encapsulates plain and reactive state for the home page.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module stores/HomeStore
 */

class HomeStore {
  constructor () {
    // State that is NOT observed
    this.plainState = {
    }

    // State that is observed and triggers reactivity in Vue
    this.reactiveState = {
      stations: null,
      unitAbbrs: null
    }
  }

  clearStations () { this.setStations(null) }

  clearUnitVocabulary () { this.setUnitVocabulary(null) }

  setStations (newValue) {
    this.reactiveState.stations = newValue
  }

  setUnitVocabulary (newValue) {
    let abbrs = null

    if (newValue && newValue.terms) {
      abbrs = {}

      newValue.terms.forEach(term => {
        // Create a map from unit label to abbreviation
        abbrs[term.label] = term.abbreviation
      })
    }

    this.reactiveState.unitAbbrs = abbrs
  }
}

export default HomeStore
