<template>
  <div class="col col-sm-12 col-lg-4 flex-col">
    <div class="flex-1 flex-col tile wind-speed-tile">

      <div class="flex-1-cell flex-col cell-border-bottom cell-align-middle text-xs-center">
        <h1 class="display-4">9.2 NE <i class="wi wi-wind from-45-deg"></i></h1>
        <span class="text-muted">Wind Speed (m/s)</span>
      </div>

      <div class="flex-1-cell">
        <table class="table table-sm wind-speed-table">
          <tbody>
            <tr class="bg-lighten">
              <th class="text-muted" scope="row">Daytime Average</th>
              <td class="h2 text-xs-right">3.6</td>
            </tr>
            <tr class="bg-darken">
              <th class="text-muted" scope="row">Nighttime Average</th>
              <td class="h2 text-xs-right">0.3</td>
            </tr>
            <tr>
              <th class="text-muted" scope="row">Seasonal Gusts</th>
              <td class="h2 text-xs-right">15.2</td>
            </tr>
          </tbody>
        </table>
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
.wind-speed-tile {
  background-color: #9081bf;
  color: #fff;
}
</style>
