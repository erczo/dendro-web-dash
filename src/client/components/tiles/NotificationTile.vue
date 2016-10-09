<template>
  <div class="col col-sm-12 col-lg-4 flex-col">
    <div class="flex-1 flex-col tile notification-tile">

      <div class="flex-1-cell flex-col cell-border-bottom cell-align-middle status-cell status-cell-offline text-xs-center">
<!-- 
        <h2><i class="fa fa-check-circle-o" aria-hidden="true"></i> Online</h2>
        <span class="text-muted">Last offline: 11/11 11:22</span>
-->
        <h3><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Offline</h3>
        <span class="text-muted">Last online: 11/11 11:22 AM</span>
      </div>

      <!-- Events -->
      <div class="flex-4-cell cell-events" style="overflow-y: scroll; height: 0;">
        <table class="table table-sm table-hover events-table">
          <tbody>
            <tr>
              <th scope="row"><i class="fa fa-lg fa-exclamation-triangle text-danger" aria-hidden="true"></i></th>
              <td>5 min ago</td>
              <td>This is a notification that something went horribly wrong</td>
            </tr>
            <tr>
              <th scope="row"><i class="fa fa-lg fa-check-circle-o text-success" aria-hidden="true"></i></th>
              <td>Today 9:00 AM</td>
              <td>Things are cool again here!</td>
            </tr>
            <tr>
              <th scope="row"><i class="fa fa-lg fa-exclamation-triangle text-danger" aria-hidden="true"></i></th>
              <td>9/20 10:42 PM</td>
              <td>This is another notification that something went horribly wrong, oh dear!</td>
            </tr>
            <tr>
              <th scope="row"><i class="fa fa-lg fa-exclamation-triangle text-danger" aria-hidden="true"></i></th>
              <td>9/20 10:42 PM</td>
              <td>This is another notification that something went horribly wrong, oh dear!</td>
            </tr>
            <tr>
              <th scope="row"><i class="fa fa-lg fa-exclamation-triangle text-danger" aria-hidden="true"></i></th>
              <td>9/20 10:42 PM</td>
              <td>This is another notification that something went horribly wrong, oh dear!</td>
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
.notification-tile {
  background-color: #fff;
}
</style>
