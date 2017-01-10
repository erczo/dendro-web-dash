<template>
  <div class="col-12 component">
    <div class="d-flex flex-column h-100 rounded tile">

      <div class="d-flex flex-column justify-content-center py-2 text-center border-bottom" style="background-color: #999;">
        <h3>NOAA Forecast</h3>
      </div>

      <div class="d-flex flex-1 flex-column justify-content-center" style="overflow-x: scroll; height: 0;">
        <table class="table table-sm">
          <tbody>
            <tr>
              <td><i class="wi wi-day-cloudy"></i></td>
              <td><i class="wi wi-day-cloudy"></i></td>
              <td><i class="wi wi-day-cloudy"></i></td>
              <td><i class="wi wi-day-cloudy"></i></td>
              <td><i class="wi wi-day-cloudy"></i></td>
              <td><i class="wi wi-day-sunny"></i></td>
              <td style="border-right: none"><i class="wi wi-day-cloudy"></i></td>
            </tr>
            <tr>
              <td>19°C<br />Today</td>
              <td>16°C<br />Tue</td>
              <td>18°C<br />Wed</td>
              <td>21°C<br />Thu</td>
              <td>24°C<br />Fri</td>
              <td>22°C<br />Sat</td>
              <td style="border-right: none">22°C<br />Sun</td>
            </tr>
          </tbody>
        </table>
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
h3 {
  color: #fff;
}

.table {
  font-size: 86%;
}
.table .wi {
  color: #999;
  font-size: 200%;
  font-weight: bold;
}
.table td {
  border-top: none;
  border-right: 1px solid #e1e1e1;
  vertical-align: middle;
}
.table.table-sm td {
  padding: 0.3rem 0.6rem;
  text-align: center;
}

.tile {
  background-color: #fff;
}
</style>
