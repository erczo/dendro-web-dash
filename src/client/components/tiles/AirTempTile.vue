<template>
  <div class="col col-sm-12 col-lg-4 flex-col">
    <div class="flex-1 flex-col tile air-temp-tile">

      <div class="flex-2-cell flex-col cell-border-bottom cell-align-middle text-xs-center">
        <h1 class="display-3"><i class="wi wi-thermometer-exterior"></i> 17°C</h1>
        <span class="text-muted">Air Temperature</span>
      </div>

      <div class="flex-2-cell flex-row">
        <div class="flex-2-cell flex-col cell-align-middle text-xs-center bg-darken">
          <h2>-5°</h2>
          <span class="text-muted">Seasonal Low</span>
        </div>
        <div class="flex-2-cell flex-col cell-align-middle text-xs-center bg-lighten">
          <h2>28°</h2>
          <span class="text-muted">Seasonal High</span>
        </div>
      </div>

      <div class="flex-1-cell flex-col cell-align-middle text-muted text-xs-center">
        October
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
.air-temp-tile {
  background-color: #509ebf;
  color: #fff;
}
</style>
