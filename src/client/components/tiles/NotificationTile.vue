<template>
  <div class="col-12 col-lg-4 component">
    <div class="d-flex flex-1 flex-column h-100 rounded tile">

      <!-- Status -->
      <div class="d-flex flex-1 flex-column justify-content-center text-center border-bottom status-cell status-cell-offline">
<!-- 
        <h2><i class="fa fa-check-circle-o" aria-hidden="true"></i> Online</h2>
        <span class="text-muted">Last offline: 11/11 11:22</span>
-->
        <h3><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Offline</h3>
        <span class="text-muted">Last online: 10/11 11:22 AM</span>
      </div>

      <!-- Events -->
      <div class="d-flex flex-4 flex-column" style="overflow-y: scroll; height: 0;">
        <table class="table table-sm table-hover">
          <tbody>
            <tr>
              <th scope="row"><i class="fa fa-lg fa-exclamation-triangle text-danger" aria-hidden="true"></i></th>
              <td>5 min ago</td>
              <td>Deliberately offline for demo.</td>
            </tr>
            <tr>
              <th scope="row"><i class="fa fa-lg fa-check-circle-o text-success" aria-hidden="true"></i></th>
              <td>Today 9:00 AM</td>
              <td>NL115 ethernet module replaced. System back online.</td>
            </tr>
            <tr>
              <th scope="row"><i class="fa fa-lg fa-exclamation-triangle text-danger" aria-hidden="true"></i></th>
              <td>9/20 10:42 PM</td>
              <td>Network disconnect. No data lost.</td>
            </tr>
            <tr>
              <th scope="row"><i class="fa fa-lg fa-exclamation-triangle text-danger" aria-hidden="true"></i></th>
              <td>9/10 8:50 AM</td>
              <td>Annual calibration. System down for 2 hours.</td>
            </tr>
            <tr>
              <th scope="row"><i class="fa fa-lg fa-exclamation-triangle text-danger" aria-hidden="true"></i></th>
              <td>9/10 8:50 AM</td>
              <td>Annual calibration. System down for 2 hours.</td>
            </tr>
            <tr>
              <th scope="row"><i class="fa fa-lg fa-exclamation-triangle text-danger" aria-hidden="true"></i></th>
              <td>9/10 8:50 AM</td>
              <td>Annual calibration. System down for 2 hours.</td>
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
.table {
  font-size: 86%;
}
.table th,
.table td {
  vertical-align: middle;
}
.table.table-sm th {
  padding: 0.3rem 0.6rem;
  text-align: center;
}

.tile {
  background-color: #fff;
}

.status-cell {
  color: #fff;
}
.status-cell-offline {
  background-color: #bf5750;
}
.status-cell-online {
  background-color: #97bf50;
}
</style>
