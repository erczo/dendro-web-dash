<template>
  <div class="col-12 col-lg-4 component">
    <div class="d-flex flex-column h-100 rounded tile">

      <div class="d-flex flex-1 flex-column justify-content-center text-center border-bottom">
        <h1 class="display-3">67 <i class="wi wi-humidity"></i></h1>
        <span class="text-muted">Humidity</span>
      </div>

      <div class="d-flex flex-1 flex-row">
        <div class="d-flex flex-1 flex-column justify-content-center text-center bg-darken">
          <h2>14.4%</h2>
          <span class="text-muted">Seasonal Low</span>
        </div>
        <div class="d-flex flex-1 flex-column justify-content-center text-center bg-lighten">
          <h2>99.6%</h2>
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
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tile {
  background-color: #509ebf;
  color: #fff;
}
</style>
