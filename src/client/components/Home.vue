<template>
  <div class="c-home">
    <section id="banner">
      <div class="container">
        <div class="row">
          <div class="col-sm-12">
            <h2>Dashboard Directory</h2>
          </div>
        </div>

        <div class="row">

          <div class="col col-sm-12 col-lg-4">
            <h3>Blue Oak Ranch</h3>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import services from '../services'

const stations = services.station.find({
  $sort: {
    name: 1
  }
})
console.log('STATIONS', stations)
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
