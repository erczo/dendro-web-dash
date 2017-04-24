<template>
  <div class="component p-fixed">
    <section>
      <div class="container-fluid">
        <div class="row py-2 border-bottom">
          <div class="col-12 text-muted">Download Datapoints</div>
        </div>
      </div>
    </section>

    <section class="py-3" v-if="!hasFields">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12">
            <h2>Nothing to download</h2>
            <p class="text-muted">Try adding a few stations or datastreams to your download to continue.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-3" v-if="hasFields">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h5>Date Range</h5>
          </div>
        </div>

        <!-- Date range -->
        <div class="row py-1">
          <div class="col-12 col-md-3 py-1">
            <date-input-group
              left-addon="["
              :output-format="outputFormat"
              :min-value="extent && extent.left"
              :max-value="range.end"
              :value="range.start"
              @input="value => { store.setRangeStart(value) }"></date-input-group>
          </div>

          <div class="col-12 col-md-3 py-1">
            <date-input-group
              input-class="text-right" right-addon="]"
              :output-format="outputFormat"
              :min-value="range.start"
              :max-value="extent && extent.right"
              :value="range.end"
              @input="value => { store.setRangeEnd(value) }"></date-input-group>
          </div>

          <div class="col-12 col-md-3 py-1">
            <div class="btn-group xw-100">
              <button class="btn btn-secondary btn-md dropdown-toggle w-100 border-0" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {{ state.preset ? state.preset.name : 'Custom' }}
              </button>
              <div class="dropdown-menu">
                <a class="dropdown-item" role="button" @click.prevent="store.setPreset(preset)" v-for="preset in store.orderedPresets">
                  <i class="fa fa-check" :class="[preset === state.preset ? '' : 'invisible']" aria-hidden="true"></i> {{ preset.name }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Slider -->
        <div class="row pt-2">
          <div class="col-12">
            <input type="text" class="slider" ref="slider" />
          </div>
        </div>

        <div class="row noselect">
          <div class="col-6">
            <small class="border-left pl-2">{{ leftExtentFormat }}</small>
          </div>
          <div class="col-6 text-right">
            <small class="border-right pr-2">{{ rightExtentFormat }}</small>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-faded" v-if="hasFields">
      <div class="container">
        <div class="row">
          <div class="col-md-6 py-3">
            <ul class="list-group">
              <li class="list-group-item text-white bg-success small">SUMMARY</li>
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
            <button type="button" class="btn btn-success btn-lg" :disabled="selectedDatastreamFieldCount === 0" @click="$router.push({name: 'startDownload'})">
              <i class="fa fa-lg fa-arrow-down" aria-hidden="true"></i> Start Download
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="py-3"  v-if="hasFields">
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

              <tbody v-if="hasFilteredFields">
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
import logger from '../lib/logger'

import 'bootstrap-slider'
import 'bootstrap-slider/dist/css/bootstrap-slider.css'

import DateInputGroup from './inputs/DateInputGroup'

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
      filteredFields: null
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
    dataLoader.destroy()
    dataLoader = null

    this.debouncedFilter.cancel()

    if (this.rangeSlider) this.rangeSlider.slider('destroy')
    this.rangeSlider = null
  },

  computed: {
    extent () {
      return this.state.extent
    },
    fieldCount () {
      const fields = this.fields
      if (fields) return fields.length
      return 0
    },
    fields () {
      return this.state.fields
    },
    filteredFieldCount () {
      const fields = this.filteredFields
      if (fields) return fields.length
      return 0
    },
    hasFields () {
      return this.fieldCount > 0
    },
    hasFilteredFields () {
      return this.filteredFieldCount > 0
    },
    leftExtentFormat () {
      const extent = this.extent
      if (extent) return extent.left.format(this.outputFormat)
    },
    rightExtentFormat () {
      const extent = this.extent
      if (extent) return extent.right.format(this.outputFormat)
    },
    range () {
      return this.state.range
    },
    outputFormat () {
      switch (this.units) {
        case 'imp':
          return 'MM/DD/YYYY'
        case 'met':
          return 'DD-MM-YYYY'
      }
    },
    selectedDays () {
      const range = this.range
      if (range.start && range.end) return Math.max(1, range.end.diff(range.start, 'days'))
      return 0
    },
    selectedDatastreamFieldCount () {
      const fields = this.fields
      if (fields) return fields.filter(field => { return field.selected && field.datastreamId }).length
      return 0
    },
    selectedFieldCount () {
      const fields = this.fields
      if (fields) return fields.filter(field => { return field.selected }).length
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
      let slider = this.rangeSlider

      if (!slider) {
        // Lazy init
        slider = this.rangeSlider = $(this.$refs.slider).slider({
          enabled: false,
          id: 'downloadRangeSlider',
          max: 4,
          min: 0,
          range: true,
          tooltip: 'hide',
          value: [1, 2]
        }).on('change', this.sliderChange)
      }

      if (!slider) return

      const extent = this.extent
      if (extent) {
        const days = extent.right.diff(extent.left, 'days')
        slider.slider('setAttribute', 'max', days).slider('enable')
      } else {
        slider.slider('disable')
      }
    },
    sliderChange (e) {
      const [left, newValue] = [this.extent.left, e.value.newValue]
      this.store.setRange(left.clone().add(newValue[0], 'd'), left.clone().add(newValue[1], 'd'))
    },
    updateCheckAll () {
      const fields = this.filteredFields

      let optionalCount = fields.filter(field => { return !field.required }).length
      let selectedCount = fields.filter(field => { return !field.required && field.selected }).length

      this.$refs.checkAllInput.checked = selectedCount > 0
      this.$refs.checkAllInput.indeterminate = selectedCount > 0 && selectedCount < optionalCount
    },
    updateSlider () {
      const [extent, range, slider] = [this.extent, this.range, this.rangeSlider]

      if (!slider || !extent) return

      slider.slider('setValue', [
        range.start.diff(extent.left, 'days'),
        range.end.diff(extent.left, 'days')
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
