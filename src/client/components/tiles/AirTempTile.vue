<template>
  <div class="col-12 col-lg-4 component">
    <div class="d-flex flex-column h-100 rounded tile">

      <div class="d-flex flex-1 flex-column justify-content-center text-center border-bottom">
        <h1 class="display-3">{{degrees}} <i class="wi wi-celsius"></i></h1>
        <span class="text-muted">Air Temperature</span>
      </div>

      <div class="d-flex flex-1 flex-row">
        <div class="d-flex flex-1 flex-column justify-content-center text-center bg-darken">
          <h2>3.5°</h2>
          <span class="text-muted">Seasonal Low</span>
        </div>
        <div class="d-flex flex-1 flex-column justify-content-center text-center bg-lighten">
          <h2>36.6°</h2>
          <span class="text-muted">Seasonal High</span>
        </div>
      </div>

      <div class="d-flex flex-column justify-content-center py-2 text-center text-muted">
        October          
      </div>

    </div>
  </div>
</template>

<script>
// TODO: Finish
// TODO: Make colors props?

export default {
  props: {
    degrees: Number
  }
  // mounted () {
  //   this.position = {lat: this.lat, lng: this.lng}

  //   Promise.resolve(window.google)
  //     .then(google => {
  //       return google ? google.maps : loadGoogleMapsAPI({
  //         key: 'AIzaSyC8zfohXmxg5VzAg9G2rCypfKmU-KpOv6k'
  //       })
  //     })
  //     .then(maps => {
  //       this.map = new maps.Map(this.$el.getElementsByClassName('tile')[0], {
  //         center: this.position,
  //         draggable: false,
  //         scrollwheel: false,
  //         zoom: 10
  //       })
  //       return new maps.Marker({
  //         position: this.position,
  //         map: this.map,
  //         title: this.title
  //       })
  //     }).catch((err) => {
  //       console.error(err)
  //     })
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tile {
  background-color: #509ebf;
  color: #fff;
}
</style>
