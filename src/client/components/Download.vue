<template>
  <div class="component p-fixed">
    <section>
      <div class="container-fluid">
        <div class="row py-2 border-bottom">
          <div class="col-12 text-muted">Download Datapoints</div>
        </div>
      </div>
    </section>

    <section class="py-3" v-if="!fields || fields.length === 0">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12">
            <h2>Nothing to download</h2>
            <p class="text-muted">Try adding a few stations or datastreams to your download to continue.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-3" v-if="fields && fields.length > 0">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h5>Date Range</h5>
          </div>
        </div>

        <!-- Date range -->
        <div class="row py-2 justify-content-md-center">
          <div class="col-12 col-md-3 py-1">
            <date-input-group
              class="input-group-md"
              left-addon="["
              :min-value="extent && extent.left"
              :max-value="range.end"
              :value="range.start"
              @input="value => { store.setRangeStart(value) }"></date-input-group>
          </div>

          <div class="col-12 col-md-3 py-1 text-center">
            <div class="btn-group w-100">
              <button class="btn btn-secondary btn-md dropdown-toggle w-100" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {{ state.preset ? state.preset.name : 'Custom' }}
              </button>
              <div class="dropdown-menu">
                <a class="dropdown-item" role="button" @click.prevent="store.setPreset(preset)" v-for="preset in store.orderedPresets">
                  <i class="fa fa-check" :class="[preset === state.preset ? '' : 'invisible']" aria-hidden="true"></i> {{ preset.name }}
                </a>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-3 py-1">
            <date-input-group
              class="input-group-md"
              input-class="text-right" right-addon="]"
              :min-value="range.start"
              :max-value="extent && extent.right"
              :value="range.end"
              @input="value => { store.setRangeEnd(value) }"></date-input-group>
          </div>
        </div>

        <!-- Slider -->
        <div class="row pt-2">
          <div class="col-12 col-md-10 offset-md-1">
            <input type="text" class="slider" ref="slider" />
          </div>
        </div>

        <div class="row noselect">
          <div class="col-6 col-md-5 offset-md-1">
            <small class="border-left pl-2">{{ leftExtentFormat }}</small>
          </div>
          <div class="col-6 col-md-5 text-right">
            <small class="border-right pr-2">{{ rightExtentFormat }}</small>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-faded" v-if="fields && fields.length > 0">
      <div class="container">
        <div class="row">
          <div class="col-md-6 py-3">
            <ul class="list-group">
              <li class="list-group-item text-white bg-success"><small>SUMMARY</small></li>
              <li class="list-group-item justify-content-between">
                Fields
                <span class="badge badge-default badge-pill">{{ selectedFieldCount }}</span>
              </li>
              <li class="list-group-item justify-content-between">
                Days of data
                <span class="badge badge-default badge-pill">{{ selectedDays }}</span>
              </li>
              <li class="list-group-item justify-content-between">
                File type
                <span class="">CSV</span>
              </li>
            </ul>
          </div>

          <div class="col-md-6 py-3 d-flex flex-column justify-content-center align-items-center">
            <button type="button" class="btn btn-success btn-lg" @click="startDownload">
              <i class="fa fa-lg fa-arrow-down" aria-hidden="true"></i> Start Download
            </button>

            <!-- <a :href="csvUrl" download="test.csv">File Link</a> -->
          </div>
        </div>
      </div>
    </section>

    <section class="py-3"  v-if="fields && fields.length > 0">
      <div class="container">
<!--
        <div class="row">
          <div class="col-12">
            <h5>Output Fields</h5>
          </div>
        </div>
 -->
        <div class="row py-2">
          <div class="col-12 col-md-6 py-1">
            <input type="text" class="form-control form-control-md" placeholder="Filter fields" v-model="filterText" />
          </div>
        </div>

        <div class="row" style="min-height: 50vh;">
          <div class="col-12">
            <table class="table table-striped table-responsive">
              <thead>
                <tr>
                  <th>
                    <label class="form-check-label">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        ref="checkAllInput"
                        @change="store.setFieldsSelected(filteredFields, $event.target.checked)" />
                    </label>
                  </th>
                  <th class="w-100">Output field</th>
                </tr>
              </thead>

              <tbody v-if="filteredFields && filteredFields.length > 0">
                <tr v-for="field in filteredFields">
                  <td>
                    <label class="form-check-label" v-if="!field.required">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :checked="field.selected"
                        @change="store.setFieldSelected(field, $event.target.checked)"
                        xv-model="field.selected" />
                    </label>
                  </td>
                  <td>{{ field.name }}<em v-if="field.required"> (required)</em></td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <td></td>
                  <td>No fields found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import $ from 'jquery'
import debounce from 'lodash.debounce'
// import moment from 'moment'
import logger from '../lib/logger'

import 'bootstrap-slider'
import 'bootstrap-slider/dist/css/bootstrap-slider.css'

import DateInputGroup from './inputs/DateInputGroup'

// Make eslint happy, SEE: http://eslint.org/docs/user-guide/configuring#specifying-globals
// /* global Blob, URL */

import {DataLoader} from '../lib/dataloader'
import SystemTimeSources from '../sources/SystemTimeSources'

let dataLoader

export default {
  components: {
    DateInputGroup
  },

  props: {
    // Download 'cart'
    downloadStore: Object,

    // Misc
    units: String
  },

  data () {
    return {
      filterText: '',
      filteredFields: null,

      csvUrl: ''
    }
  },

  created () {
    dataLoader = new DataLoader(this, SystemTimeSources)
    dataLoader.clear().load().then(() => {
      logger.log('Download:created::vm', this)
    })

    this.debouncedFilter = debounce(() => {
      const filterText = this.filterText.trim()
      const regex = new RegExp(filterText, 'i')

      this.filteredFields = this.fields.filter(field => {
        return filterText.length === 0 || regex.test(field.name)
      })
    }, 400)
  },

  mounted () {
    // Start with all fields; fires watcher
    this.filteredFields = this.fields
  },

  beforeDestroy () {
    // TODO: Implement
    // dataLoader.cancel()
    dataLoader = null

    this.debouncedFilter.cancel()

    if (this.rangeSlider) this.rangeSlider.slider('destroy')
    this.rangeSlider = null
  },

  computed: {
    extent () {
      return this.state.extent
    },
    fields () {
      return this.state.fields
    },
    leftExtentFormat () {
      if (this.extent) return this.extent.left.format('MM/DD/YYYY')
    },
    rightExtentFormat () {
      if (this.extent) return this.extent.right.format('MM/DD/YYYY')
    },
    range () {
      return this.state.range
    },
    selectedDays () {
      const range = this.range
      if (range.start && range.end) {
        return Math.max(1, range.end.diff(range.start, 'days'))
      }
      return 0
    },
    selectedFieldCount () {
      if (this.fields) {
        return this.fields.filter(field => { return field.selected }).length
      }
      return 0
    },
    state () {
      return this.store.reactiveState
    },
    store () {
      return this.downloadStore
    }
  },

  methods: {
    configureSlider () {
      if (!this.rangeSlider) {
        // Lazy init
        this.rangeSlider = $(this.$refs.slider).slider({
          enabled: false,
          id: 'downloadRangeSlider',
          max: 4,
          min: 0,
          range: true,
          tooltip: 'hide',
          value: [1, 2]
        }).on('change', this.sliderChange)
      }

      if (!this.rangeSlider) return

      if (this.extent) {
        const days = this.extent.right.diff(this.extent.left, 'days')
        this.rangeSlider.slider('setAttribute', 'max', days).slider('enable')
      } else {
        this.rangeSlider.slider('disable')
      }
    },
    sliderChange (e) {
      const left = this.extent.left
      const newValue = e.value.newValue
      this.store.setRange(left.clone().add(newValue[0], 'd'), left.clone().add(newValue[1], 'd'))
    },
    startDownload () {
      // TODO: Finish download!
      // this.fields.forEach(field => {
      //   field.selected = !field.selected
      // })
      // const cols = Array.from(Array(100).keys())

      // let blob = new Blob([''], {type: 'text/csv'})

      // for (let i = 0; i < 1000; i++) {
      //   const rows = []
      //   for (let j = 0; j < 10000; j++) {
      //     rows.push(cols)
      //   }

      //   let bigStr = ''

      //   rows.forEach(row => {
      //     bigStr += row.join(',') + '\r\n'
      //   })

      //   blob = new Blob([blob, bigStr], {type: 'text/csv'})
      // }

      // this.csvBlob = blob
      // this.csvUrl = URL.createObjectURL(this.csvBlob)

      // window.alert('Ready!')
    },
    updateCheckAll () {
      let optionalCount = this.filteredFields.filter(field => {
        return !field.required
      }).length
      let selectedCount = this.filteredFields.filter(field => {
        return !field.required && field.selected
      }).length

      this.$refs.checkAllInput.checked = selectedCount > 0
      this.$refs.checkAllInput.indeterminate = selectedCount > 0 && selectedCount < optionalCount
    },
    updateSlider () {
      if (!this.rangeSlider || !this.extent) return

      this.rangeSlider.slider('setValue', [
        this.range.start.diff(this.extent.left, 'days'),
        this.range.end.diff(this.extent.left, 'days')
      ])
    }
  },

  watch: {
    extent (newExtent) {
      this.configureSlider()
      this.updateCheckAll()
    },
    filteredFields: 'updateCheckAll',
    filterText (newFilterText) {
      this.debouncedFilter()
    },
    'range.start': 'updateSlider',
    'range.end': 'updateSlider'
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#downloadRangeSlider {
  width: 100% !important;
}
#downloadRangeSlider .slider-handle {
  background: #dc635c;
}
#downloadRangeSlider .slider-selection {
  background: #dc7d5c;
}
#downloadRangeSlider.slider-disabled .slider-handle,
#downloadRangeSlider.slider-disabled .slider-selection {
  display: none;
}
</style>
