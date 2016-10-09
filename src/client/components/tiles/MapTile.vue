<template>
  <div class="col col-sm-12 col-lg-4 flex-col">
    <div class="flex-1 tile map-tile"></div>
  </div>
</template>

<script>
// TODO: Move the API key to configuration
// TODO: Deal with resize, see: https://developers.google.com/maps/documentation/javascript/3.exp/reference#event

import loadGoogleMapsAPI from 'load-google-maps-api'

export default {
  props: {
    lat: Number,
    lng: Number,
    title: String
  },

  mounted () {
    this.position = {lat: this.lat, lng: this.lng}

    Promise.resolve(window.google)
      .then(google => {
        return google ? google.maps : loadGoogleMapsAPI({
          key: 'AIzaSyC8zfohXmxg5VzAg9G2rCypfKmU-KpOv6k'
        })
      })
      .then(maps => {
        this.map = new maps.Map(this.$el.getElementsByClassName('map-tile')[0], {
          center: this.position,
          draggable: false,
          scrollwheel: false,
          zoom: 10
        })
        return new maps.Marker({
          position: this.position,
          map: this.map,
          title: this.title
        })
      }).catch((err) => {
        console.error(err)
      })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  
</style>
