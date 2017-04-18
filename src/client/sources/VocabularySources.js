/**
 * Exports DataLoader sources for controlled vocabulary.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module sources/VocabularySources
 */

import services from '../lib/services'

/**
 * Data source definitions for controlled vocabulary; used to configure a DataLoader.
 */
export default {

  /*
    Top-level datasets: stations, etc.
   */

  unitVocabulary: {
    // Loader config
    clear (vm) {
      vm.store.clearUnitVocabulary()
    },
    guard (vm) {
      return !vm.state.unitAbbrs
    },
    fetch (vm) {
      return services.vocabulary.get('dt-unit')
    },
    afterFetch (vm, res) {
      if (res) return res
    },
    assign (vm, vocabulary) {
      vm.store.setUnitVocabulary(vocabulary)
    }
  }
}
