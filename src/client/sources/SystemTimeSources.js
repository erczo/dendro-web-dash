/**
 * Exports DataLoader sources for system time.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module sources/SystemTimeSources
 */

import services from '../lib/services'

/**
 * Data source definitions for system time; used to configure a DataLoader.
 */
export default {

  /*
    Top-level datasets: stations, etc.
   */

  systemTime: {
    // Loader config
    clear (vm) {
      vm.store.clearSystemTime()
    },
    guard (vm) {
      return !vm.state.systemTime
    },
    fetch (vm) {
      return services.systemTime.get('utc')
    },
    afterFetch (vm, res) {
      if (res) return res
    },
    assign (vm, systemTime) {
      vm.store.setSystemTime(systemTime)
    }
  }
}
