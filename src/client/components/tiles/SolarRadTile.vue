<template>
  <div class="col col-sm-12 col-lg-6 flex-col">
    <div class="flex-1 flex-col tile solar-rad-tile">

      <div class="flex-1-cell flex-row cell-border-bottom">
        <div class="flex-2-cell flex-col cell-align-middle text-xs-center">
          <h1 class="display-3">756</h1>
          <span class="text-muted">PAR (μmol/m<sup>2</sup>)</span>
        </div>
        <div class="flex-2-cell flex-col cell-align-middle text-xs-center bg-lighten">
          <h1 class="display-3">695</h1>
          <span class="text-muted">Total Solar (W/m<sup>2</sup>)</span>
        </div>
      </div>

      <div class="flex-1-cell flex-col cell-align-middle text-xs-center">
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
.solar-rad-tile {
  background-color: #bf9650;
  color: #fff;
}
</style>
