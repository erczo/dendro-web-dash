/**
 * Utility class for fetching data and populating model state based on configured sources.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/dataloader
 */

import logger from './logger'

const NEVER_FETCHED = 8640000000000000

// TODO: Refactor this to use generators?
class DataLoader {
  constructor (vm, sources) {
    this._isLoading = false
    this.maxIterations = 10
    this.sources = sources
    this.vm = vm
  }

  /**
   * Clear state for all sources where the specified predicate is true.
   */
  clear (pred = true) {
    const predFn = typeof pred === 'function' ? pred : function (sourceKey) {
      return (pred === true) || (sourceKey === pred)
    }
    const sources = this.sources
    const sourceKeys = Object.keys(sources).filter(predFn)
    const vm = this.vm

    sourceKeys.forEach(sourceKey => {
      logger.log('DataLoader#clear::sourceKey', sourceKey)

      const fetchedAtKey = `${sourceKey}FetchedAt`
      const errorKey = `${sourceKey}Error`
      const loadingKey = `${sourceKey}Loading`
      const readyKey = `${sourceKey}Ready`
      vm[fetchedAtKey] = NEVER_FETCHED
      vm[errorKey] = null
      vm[loadingKey] = false
      vm[readyKey] = false

      // Custom clearing
      const source = sources[sourceKey]
      if (typeof source.clear === 'function') source.clear(vm)
    })

    return this
  }

  get isLoading () { return this._isLoading }
  set isLoading (newIsLoading) {
    this._isLoading = newIsLoading

    if (newIsLoading) logger.time('DataLoader.load')
    else logger.timeEnd('DataLoader.load')
  }

  /**
   * Begin loading for all sources. Runs recursively until all guards are false (or maxIterations is reached).
   */
  load (options, iter = 0) {
    if (iter === 0) {
      if (this.isLoading) return Promise.resolve() // We're already loading
      this.isLoading = true
    }

    const vm = this.vm
    const sources = this.sources
    const sourceKeys = Object.keys(sources).filter(sourceKey => {
      const loadingKey = `${sourceKey}Loading`
      if (vm[loadingKey] === true) return false

      const source = sources[sourceKey]
      return typeof source.guard === 'function' ? source.guard(vm) : true
    })

    if (sourceKeys.length === 0) {
      return Promise.resolve()
    }

    const fetches = []

    sourceKeys.forEach(sourceKey => {
      logger.log('DataLoader#load::sourceKey,iter', sourceKey, iter)

      const fetchedAtKey = `${sourceKey}FetchedAt`
      const errorKey = `${sourceKey}Error`
      const loadingKey = `${sourceKey}Loading`
      const readyKey = `${sourceKey}Ready`
      vm[errorKey] = null
      vm[loadingKey] = true
      vm[readyKey] = false

      const source = sources[sourceKey]
      if (typeof source.beforeFetch === 'function') source.beforeFetch(vm)

      const fetchedAt = vm[fetchedAtKey] = (new Date()).getTime()
      const fetch = Promise.resolve(source.fetch(vm)).then(res => {
        if (vm[fetchedAtKey] !== fetchedAt) return // Cancelled

        vm[loadingKey] = false

        // Process results
        if (typeof source.afterFetch === 'function') res = source.afterFetch(vm, res)
        if (!res) throw Error(`Not found: ${sourceKey}`)

        // Assign targets
        if (typeof source.assign === 'function') source.assign(vm, res)

        vm[readyKey] = true
      }).catch(err => {
        logger.log('DataLoader#load::error', err)

        if (vm[fetchedAtKey] !== fetchedAt) return // Cancelled

        vm[loadingKey] = false
        vm[errorKey] = err.message
      }).then(() => {
        return vm.$nextTick()
      }).then(() => {
        // TODO: Rework so that only the number of failed calls are restricted
        if (iter < this.maxIterations) return this.load(options, iter + 1)
      })

      fetches.push(fetch)
    })

    return Promise.all(fetches).then(() => {
      if (iter === 0) this.isLoading = false
    })
  }
}

export {
  DataLoader,
  NEVER_FETCHED
}
