<template>
  <div class="d-flex flex-column h-100 rounded tile" style="z-index: 100;"></div>
</template>

<script>
import loadGoogleMapsAPI from 'load-google-maps-api'

const config = window.CLIENT_CONFIG

export default {
  props: {
    coordinates: Array,
    title: String
  },

  mounted () {
    Promise.resolve(window.google).then(google => {
      return google ? google.maps : loadGoogleMapsAPI(config.googleMapsAPI)
    }).then(maps => {
      this.maps = maps
      this.latLng = new maps.LatLng({lat: this.coordinates[1], lng: this.coordinates[0]})
      this.map = new maps.Map(this.$el, {
        center: this.latLng,
        draggable: false,
        scrollwheel: false,
        zoom: 10
      })
      this.marker = new maps.Marker({
        position: this.latLng,
        map: this.map,
        title: this.title
      })

      // Recenter the map after a few seconds of inactivity
      this.centerChangedListener = () => {
        if (this.recenterTid) clearTimeout(this.recenterTid) // Debounce
        this.recenterTid = setTimeout(() => {
          this.recenterTid = 0
          if (this.map && this.marker) this.map.panTo(this.marker.getPosition())
        }, 3000)
      }

      this.map.addListener('center_changed', this.centerChangedListener)
      this.marker.addListener('click', this.selectMarker)
    }).catch((err) => {
      // TODO: Do more than just log the error?
      console.error(err)
    })
  },

  beforeDestroy () {
    if (this.recenterTid) clearTimeout(this.recenterTid)
    if (this.maps && this.map) this.maps.event.clearInstanceListeners(this.map)
    if (this.maps && this.marker) this.maps.event.clearInstanceListeners(this.marker)
  },

  methods: {
    selectMarker () {
      this.$emit('select-marker', this.coordinates)
    }
  },

  watch: {
    coordinates (newCoordinates) {
      if (this.maps && this.map && this.marker) {
        this.latLng = new this.maps.LatLng({lat: newCoordinates[1], lng: newCoordinates[0]})
        this.marker.setPosition(this.latLng)
        this.map.panTo(this.latLng)
      }
    },
    title (newTitle) {
      if (this.maps && this.map && this.marker) {
        this.marker.setTitle(newTitle)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
