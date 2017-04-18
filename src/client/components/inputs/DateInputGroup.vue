<template>
  <div class="input-group">
    <span class="input-group-addon" v-if="leftAddon.length > 0">{{ leftAddon }}</span>
    <input
      type="text"
      class="form-control"
      aria-label="Date"
      ref="input"
      :class="inputClass"
      :placeholder="outputFormat"
      @input="updateValue($event.target.value)"
      @blur="formatValue" />
    <span class="input-group-addon" v-if="rightAddon.length > 0">{{ rightAddon }}</span>
  </div>
</template>

<script>
import moment from 'moment'

const INPUT_FORMATS = [
  'M/D/YYYY',
  'D-M-YYYY',
  'D.M.YYYY'
]
const OUTPUT_FORMAT = 'MM/DD/YYYY'

export default {
  props: {
    leftAddon: {
      type: String,
      default: ''
    },
    rightAddon: {
      type: String,
      default: ''
    },
    inputClass: {
      type: String,
      default: ''
    },
    inputFormats: {
      type: Array,
      default () {
        return INPUT_FORMATS
      }
    },
    outputFormat: {
      type: String,
      default: OUTPUT_FORMAT
    },
    minValue: {
      type: Object,
      default: null
    },
    maxValue: {
      type: Object,
      default: null
    },
    value: {
      type: Object,
      default: null
    }
  },

  mounted () {
    this.formatValue()
  },

  methods: {
    updateValue (newValue) {
      let m = moment(newValue, this.inputFormats).utc().startOf('d')

      if (!m.isValid()) return
      if (this.minValue && m.isBefore(this.minValue)) return
      if (this.maxValue && m.isAfter(this.maxValue)) return

      this.$emit('input', m.clone())
    },
    formatValue () {
      // HACK: Weird Safari bug leaves placeholder around sometimes - so we assign this twice
      this.$refs.input.value = this.$refs.input.value = this.value && this.value.isValid() ? this.value.format(this.outputFormat) : ''
    }
  },

  watch: {
    value (newValue) {
      const m = moment(this.$refs.input.value, this.inputFormats).utc().startOf('d')
      if (!m.isSame(newValue)) this.formatValue()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
