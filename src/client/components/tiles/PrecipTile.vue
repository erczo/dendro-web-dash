<template>
  <div class="col col-sm-12 col-lg-6 flex-col">
    <div class="flex-1 flex-col tile precip-tile">

      <div class="flex-1-cell flex-col cell-align-middle text-xs-center">
        <h1 class="display-3">2.2 <i class="wi wi-raindrops"></i></h1>
        <span class="text-muted">Current Precipitation (mm/hr)</span>
      </div>

      <div class="flex-1-cell flex-col cell-align-middle text-xs-center bg-darken">
        <h1 class="display-4">2.2</h1>
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
.precip-tile {
  background-color: #50bfa6;
  color: #fff;
}
</style>
