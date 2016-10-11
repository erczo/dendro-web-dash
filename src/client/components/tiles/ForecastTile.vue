<template>
  <div class="col col-sm-12 flex-col">
    <div class="flex-1 flex-col tile forecast-tile">

      <div class="flex-1-cell flex-col cell-border-bottom cell-align-middle forcast-header-cell text-xs-center">
        <h3>NOAA Forecast</h3>
      </div>

      <div class="flex-4-cell flex-col cell-align-middle" style="overflow-x: scroll; height: 0;">
        <table class="table table-sm forecast-table">
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
.forcast-header-cell {
  background-color: #999;
  color: #fff;
}

.forecast-table {
  font-size: 86%;
}
.forecast-table .wi {
  color: #999;
  font-size: 200%;
  font-weight: bold;
}
.forecast-table td {
  border-top: none;
  border-right: 1px solid #e1e1e1;
  vertical-align: middle;
}
.forecast-table.table-sm td {
  padding: 0.3rem 0.6rem;
  text-align: center;
}

.forecast-tile {
  background-color: #fff;
}
</style>
