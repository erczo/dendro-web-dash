/**
 * Utility class for fetching data and populating model state based on configured sources.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/dataloader
 */

import logger from './logger'

const NEVER_FETCHED = 8640000000000000

let nextId = 1

/**
 * Get model property keys for a given sourceKey.
 */
function propKeys (sourceKey) {
  return {
    error: `${sourceKey}Error`,
    fetchedAt: `${sourceKey}FetchedAt`,
    loading: `${sourceKey}Loading`,
    ready: `${sourceKey}Ready`
  }
}

class DataLoader {
  constructor (vm, sources) {
    this.id = nextId++
    this.maxFetches = 200 // Approximate upper limit
    this.sources = sources
    this.vm = vm

    vm.dataLoading = false
  }

  /**
   * Clear state for all sources where the specified predicate is true.
   */
  clear (pred = true) {
    const predFn = typeof pred === 'function' ? pred : function (sourceKey) {
      return (pred === true) || (sourceKey === pred)
    }
    const sources = this.sources
    const vm = this.vm

    Object.keys(sources).filter(predFn).forEach(sourceKey => {
      const keys = propKeys(sourceKey)
      const source = sources[sourceKey]

      logger.log(`DataLoader(${this.id})#clear::sourceKey`, sourceKey)

      vm[keys.error] = null
      vm[keys.loading] = false
      vm[keys.ready] = false
      vm[keys.fetchedAt] = NEVER_FETCHED

      // Invoke clear hook
      if (typeof source.clear === 'function') source.clear(vm)
    })

    return this
  }

  /**
   * Cancel loading immediately and clean up.
   */
  destroy () {
    logger.log(`DataLoader(${this.id})#destroy`)

    this.destroyed = true
    this.sources = null
    this.vm = null
  }

  get isLoading () { return this.vm.dataLoading }
  set isLoading (newIsLoading) {
    if (this.vm) this.vm.dataLoading = newIsLoading

    if (newIsLoading) logger.time(`DataLoader(${this.id}).load`)
    else logger.timeEnd(`DataLoader(${this.id}).load`)
  }

  *_workerGen (done) {
    this.isLoading = true
    this.numFetches = 0

    const sources = this.sources
    const vm = this.vm

    let count = 0
    let tasks = Promise.resolve()

    // TODO: Add cancel capability
    do {
      const fetches = Object.keys(sources).filter(sourceKey => {
        const keys = propKeys(sourceKey)
        const source = sources[sourceKey]

        if (vm[keys.loading] === true) return false // Already loading source?

        // Evaluate guard condition
        return typeof source.guard === 'function' ? source.guard(vm) : true
      }).map(sourceKey => {
        const keys = propKeys(sourceKey)
        const source = sources[sourceKey]

        logger.log(`DataLoader(${this.id})#load:beforeFetch::sourceKey`, sourceKey)

        vm[keys.error] = null
        vm[keys.loading] = true
        vm[keys.ready] = false

        // Optional beforeFetch hook
        if (typeof source.beforeFetch === 'function') source.beforeFetch(vm)

        const fetchedAt = vm[keys.fetchedAt] = (new Date()).getTime()

        // Invoke fetch async
        return Promise.resolve(source.fetch(vm)).then(res => {
          if (this.destroyed) return // Destroyed?

          vm[keys.loading] = false

          if (vm[keys.fetchedAt] !== fetchedAt) return // Preempted?

          logger.log(`DataLoader(${this.id})#load:afterFetch::sourceKey`, sourceKey)

          // Process results
          if (typeof source.afterFetch === 'function') res = source.afterFetch(vm, res)
          if (!res) throw Error(`Not found: ${sourceKey}`)

          // Assign targets
          if (typeof source.assign === 'function') source.assign(vm, res)

          vm[keys.ready] = true
        }).catch(err => {
          if (this.destroyed) return // Destroyed?

          vm[keys.loading] = false

          if (vm[keys.fetchedAt] !== fetchedAt) return // Preempted?

          logger.error('DataLoader#load:catch::sourceKey,err', sourceKey, err)

          vm[keys.error] = err.message
        }).then(() => {
          if (this.destroyed) return // Destroyed?

          return vm.$nextTick()
        }).then(() => {
          this._worker.next()
        })
      })

      if (fetches.length > 0) {
        count++
        tasks = tasks.then(() => {
          return Promise.all(fetches)
        }).then(() => {
          if (--count === 0) this._worker.next()
        })
      }

      // Safety net
      if ((this.numFetches += fetches.length) > this.maxFetches) {
        logger.warn(`DataLoader(${this.id})#load:break::numFetches,maxFetches`, this.numFetches, this.maxFetches)
        break
      }

      if (count > 0) yield null // Chill until a promised fetch resolves
    } while (count > 0 && !this.destroyed)

    tasks.then(() => {
      logger.log(`DataLoader(${this.id})#load:done::numFetches`, this.numFetches)

      this.isLoading = false
      done(true)
    })
  }

  /**
   * Begin loading for all sources. Uses a generator to manage the tasks.
   */
  load () {
    return new Promise((resolve) => {
      if (this.isLoading || this.destroyed) {
        resolve(false)
      } else {
        this._worker = this._workerGen(resolve)
        this._worker.next()
      }
    })
  }
}

export {
  DataLoader,
  NEVER_FETCHED
}
