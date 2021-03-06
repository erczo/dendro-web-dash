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
      organization: null,
      stations: null,
      unitAbbrs: null
    }
  }

  appendStations (newValue) {
    if (!newValue) return

    // SEE: https://vuejs.org/v2/guide/list.html#Caveats
    this.reactiveState.stations.push.apply(this.reactiveState.stations, newValue)
  }

  clearOrganization () { this.setOrganization(null) }

  clearStations () { this.setStations(null) }

  clearUnitVocabulary () { this.setUnitVocabulary(null) }

  setOrganization (newValue) {
    this.reactiveState.organization = newValue
  }

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
