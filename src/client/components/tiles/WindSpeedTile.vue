<template>
  <div class="col-12 col-lg-4 component">
    <div class="d-flex flex-column h-100 rounded tile">

      <div class="d-flex flex-1 flex-column justify-content-center text-center border-bottom">
        <h1 class="display-4">1.2 <i class="wi wi-wind from-293-deg"></i> <small>WNW</small></h1>
        <span class="text-muted">Wind Speed (m/s)</span>
      </div>

      <div class="d-flex flex-1 flex-row">
        <table class="table table-sm">
          <tbody>
            <tr class="bg-lighten">
              <th class="text-muted" scope="row">Daytime Average</th>
              <td class="h2 text-right">1.3</td>
            </tr>
<!-- NOTE: Not implemented -->
<!-- 
            <tr class="bg-darken">
              <th class="text-muted" scope="row">Nighttime Average</th>
              <td class="h2 text-right">0.3</td>
            </tr>
 -->
            <tr>
              <th class="text-muted" scope="row">Seasonal Gusts</th>
              <td class="h2 text-right">6.9</td>
            </tr>
          </tbody>
        </table>
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
.table th,
.table td {
  border-top: none;
  padding: 0.3rem 0.6rem;
  vertical-align: middle;
}
.table.table-sm th {
  font-weight: normal;
}

.tile {
  background-color: #9081bf;
  color: #fff;
}
</style>
