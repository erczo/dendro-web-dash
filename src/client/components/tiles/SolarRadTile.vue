<template>
  <div class="col-12 col-lg-6 component">
    <div class="d-flex flex-column h-100 rounded tile">

      <div class="d-flex flex-1 flex-row justify-content-center text-center border-bottom">
        <div class="d-flex flex-1 flex-column justify-content-center text-center">
          <h1 class="display-3">756</h1>
          <span class="text-muted">PAR (μmol/m<sup>2</sup>)</span>
        </div>
        <div class="d-flex flex-1 flex-column justify-content-center text-center bg-lighten">
          <h1 class="display-3">695</h1>
          <span class="text-muted">Total Solar (W/m<sup>2</sup>)</span>
        </div>
      </div>

      <div class="d-flex flex-1 flex-column justify-content-center text-center">
        <h2><i class="wi wi-day-cloudy"></i> Partially Cloudy</h2>
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
  background-color: #bf9650;
  color: #fff;
}
</style>
