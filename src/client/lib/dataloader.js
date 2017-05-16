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

class DataFetchTask {
  constructor (vm, keys) {
    this.time = (new Date()).getTime()
    this.keys = keys
    this.vm = vm
  }

  run (source) {
    this.vm[this.keys.fetchedAt] = this.time

    return Promise.resolve(source.fetch(this.vm)).then(res => {
      if (this.vm[this.keys.fetchedAt] === this.time) {
        return {
          preempted: false,
          result: res
        }
      }

      return {
        preempted: true
      }
    })
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

  * _workerGen (done) {
    this.isLoading = true

    logger.log(`DataLoader(${this.id})#worker`)

    const sources = this.sources
    const vm = this.vm

    let count = 0
    let total = 0

    do {
      yield setTimeout(() => { this._worker.next() }, 500)

      Object.keys(sources).filter(sourceKey => {
        const keys = propKeys(sourceKey)
        const source = sources[sourceKey]

        if (vm[keys.loading]) return false // Already loading source?

        // Evaluate guard condition
        return typeof source.guard === 'function' ? !!source.guard(vm) : true
      }).map(sourceKey => {
        const keys = propKeys(sourceKey)
        const source = sources[sourceKey]

        count++
        total++

        logger.log(`DataLoader(${this.id})#worker:beforeFetch::sourceKey,count,total`, sourceKey, count, total)

        vm[keys.error] = null
        vm[keys.loading] = true
        vm[keys.ready] = false

        // Optional beforeFetch hook
        if (typeof source.beforeFetch === 'function') source.beforeFetch(vm)

        return (new DataFetchTask(vm, keys)).run(source).then(state => {
          logger.log(`DataLoader(${this.id})#worker:afterFetch::sourceKey,state`, sourceKey, state)

          vm[keys.loading] = false

          if (this.destroyed || !state || state.preempted) return

          // Process results
          let res = state.result
          if (typeof source.afterFetch === 'function') res = source.afterFetch(vm, res)
          if (!res) throw Error(`Not found: ${sourceKey}`)

          // Assign targets
          if (typeof source.assign === 'function') source.assign(vm, res)

          vm[keys.ready] = true
        }).catch(err => {
          logger.error(`DataLoader(${this.id})#worker:catch::sourceKey,err`, sourceKey, err)

          if (this.destroyed) return

          vm[keys.loading] = false
          vm[keys.error] = err.message
        }).then(() => {
          count--
        })
      })

      // Safety net
      if (total > this.maxFetches) {
        logger.warn(`DataLoader(${this.id})#worker:break::total,maxFetches`, total, this.maxFetches)
        break
      }
    } while (count > 0 && !this.destroyed)

    logger.log(`DataLoader(${this.id})#worker:done::total`, total)

    this.isLoading = false
    done(true)
  }

  /**
   * Begin loading for all sources. Uses a generator to manage the tasks.
   */
  load () {
    logger.log(`DataLoader(${this.id})#load`)

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
