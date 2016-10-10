<template>
  <div class="col col-sm-12 col-lg-4 flex-col">
    <div class="flex-1 flex-col tile humidity-tile">

      <div class="flex-2-cell flex-col cell-border-bottom cell-align-middle text-xs-center">
        <h1 class="display-3"><small><i class="wi wi-humidity"></i></small> 56%</h1>
        <span class="text-muted">Humidity</span>
      </div>

      <div class="flex-2-cell flex-row">
        <div class="flex-2-cell flex-col cell-align-middle text-xs-center bg-darken">
          <h2>11%</h2>
          <span class="text-muted">Seasonal Low</span>
        </div>
        <div class="flex-2-cell flex-col cell-align-middle text-xs-center bg-lighten">
          <h2>100%</h2>
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
.humidity-tile {
  background-color: #509ebf;
  color: #fff;
}
</style>
