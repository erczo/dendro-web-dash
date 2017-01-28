/**
 * Data loader class to manage fetching from configured sources.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/dataloader
 */

class DataLoader {
  constructor (sources) {
    this.isLoading = false
    this.maxIterations = 9
    this.sources = sources
  }

  /**
   * Load sources by assigning state on a given Vue model. Only sources with
   * a passing guard (returning true) will be processed.
   *
   * Runs recursively until all guards are false (or maxIterations is hit).
   */
  load (vm, options, iter = 0) {
    if (iter === 0 && this.isLoading) return Promise.resolve()

    this.isLoading = true

    const sources = this.sources
    const sourceKeys = Object.keys(sources).filter(sourceKey => {
      const guard = sources[sourceKey].guard
      return typeof guard === 'function' ? guard(vm) : true
    })

    if (sourceKeys.length === 0 || iter > this.maxIterations) {
      this.isLoading = false
      return Promise.resolve()
    }

    const fetches = []

    sourceKeys.forEach(sourceKey => {
      // TODO: Remove - for debug only
      console.log('Fetching', sourceKey, iter)

      const fetchedAtKey = `${sourceKey}FetchedAt`
      const loadingKey = `${sourceKey}Loading`
      const readyKey = `${sourceKey}Ready`
      const errorKey = `${sourceKey}Error`
      const source = sources[sourceKey]

      vm[fetchedAtKey] = new Date()
      vm[loadingKey] = true
      vm[readyKey] = false
      vm[errorKey] = null

      const fetch = Promise.resolve(source.fetch(vm)).then(res => {
        vm[loadingKey] = false

        if (typeof source.afterFetch === 'function') res = source.afterFetch(res)
        if (!res) {
          throw Error(`Not found: ${sourceKey}`)
        } else if (typeof source.assign === 'function') {
          source.assign(vm, res)
          vm[readyKey] = true
        } else if (typeof source.target === 'string') {
          vm[source.target] = res
          vm[readyKey] = true
        }
      }).catch(err => {
        vm[loadingKey] = false
        vm[errorKey] = err.message
      })

      fetches.push(fetch)
    })

    return Promise.all(fetches).then(() => {
      // Allow for DOM updates; requires Vue
      // TODO: Allow Vue to be optional
      return vm.$nextTick()
    }).then(() => {
      return this.load(vm, options, iter + 1)
    })
  }
}

export { DataLoader }
