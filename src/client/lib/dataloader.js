/**
 * Data loader class to manage fetching from configured sources.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/dataloader
 */

const NEVER_FETCHED = new Date(8640000000000000)

class DataLoader {
  constructor (sources) {
    this.isLoading = false
    this.maxIterations = 9
    this.sources = sources
  }

  /**
   * Clear targets and their respective state variables on a given Vue model. Do this for sources having a key
   * matched by the specified predicate.
   */
  clear (vm, pred = true) {
    const predFn = typeof pred === 'function' ? pred : function (sourceKey) {
      return (pred === true) || (sourceKey === pred)
    }
    const sources = this.sources
    const sourceKeys = Object.keys(sources).filter(predFn)

    sourceKeys.forEach(sourceKey => {
      // TODO: Remove - for debug only
      console.log('Clearing', sourceKey)

      const fetchedAtKey = `${sourceKey}FetchedAt`
      const errorKey = `${sourceKey}Error`
      const loadingKey = `${sourceKey}Loading`
      const readyKey = `${sourceKey}Ready`
      const source = sources[sourceKey]
      vm[fetchedAtKey] = NEVER_FETCHED
      vm[errorKey] = null
      vm[loadingKey] = false
      vm[readyKey] = false

      if (Array.isArray(source.targets)) {
        source.targets.forEach(target => { vm[target] = null })
      }
    })

    return this
  }

  /**
   * Load sources by assigning state on a given Vue model. Only sources with a passing guard (returning true)
   * will be processed.
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
      const errorKey = `${sourceKey}Error`
      const loadingKey = `${sourceKey}Loading`
      const readyKey = `${sourceKey}Ready`
      const source = sources[sourceKey]
      const fetchedAt = vm[fetchedAtKey] = new Date()
      vm[errorKey] = null
      vm[loadingKey] = true
      vm[readyKey] = false

      const fetch = Promise.resolve(source.fetch(vm)).then(res => {
        if (vm[fetchedAtKey] !== fetchedAt) return // Cancelled

        vm[loadingKey] = false

        // Process results
        if (typeof source.afterFetch === 'function') res = source.afterFetch(res)
        if (!res) throw Error(`Not found: ${sourceKey}`)

        // Assign targets
        res = typeof source.assign === 'function' ? source.assign(vm, res) : [res]
        if (Array.isArray(source.targets) && Array.isArray(res)) {
          source.targets.forEach((target, i) => { vm[target] = res[i] })
        }

        vm[readyKey] = true
      }).catch(err => {
        // TODO: Remove - for debug only
        console.log('Fetch error', err)

        if (vm[fetchedAtKey] !== fetchedAt) return // Cancelled

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

export {
  DataLoader,
  NEVER_FETCHED
}
