<template>
  <div class="col-12 col-lg-6 component">
    <div class="d-flex flex-column h-100 rounded tile">

      <div class="d-flex flex-1 flex-column justify-content-center text-center">
        <h1 class="display-3">0 <i class="wi wi-raindrops"></i></h1>
        <span class="text-muted">Current Precipitation (mm/hr)</span>
      </div>

      <div class="d-flex flex-1 flex-column justify-content-center text-center bg-darken">
        <h1 class="display-4">0</h1>
        <span class="text-muted">Yesterday’s (mm/24hr)</span>
      </div>

    </div>
  </div>
</template>

<script>
// TODO: Finish
// TODO: Make colors props?
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tile {
  background-color: #50bfa6;
  color: #fff;
}
</style>
