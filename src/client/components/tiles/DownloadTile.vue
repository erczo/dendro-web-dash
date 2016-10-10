<template>
  <div class="col col-sm-12 flex-col">
    <div class="flex-1 flex-col tile download-tile">

      <div class="flex-1-cell flex-col cell-align-middle text-xs-center" style="padding: 1rem;">
        <h3>Want more data? Search and download here.</h3>
      </div>

      <div class="flex-1-cell flex-row" style="flex-wrap: wrap;">

        <div class="flex-1-cell flex-col cell-align-middle" style="align-items: center; padding: 1rem;">
          <div class="btn-group" role="group" aria-label="Download dropdown">
            <button type="button" class="btn btn-lg btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Download Last 2 Weeks
            </button>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="#">Download as CSV</a>
              <a class="dropdown-item" href="#">Download as JSON</a>
              <a class="dropdown-item" href="#">Download as XML</a>
            </div>
          </div>
        </div>

        <div class="flex-1-cell flex-col cell-align-middle" style="align-items: center; padding: 1rem;">
          <div class="btn-group" role="group" aria-label="Download dropdown">
            <button type="button" class="btn btn-lg btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Search All Data
            </button>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="#">Search using Chrongraf</a>
              <a class="dropdown-item" href="#">Search using Grafana</a>
              <a class="dropdown-item" href="#">Query ODM Database</a>
            </div>
          </div>
        </div>

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
.download-tile {
  /*background-color: #fff;*/
  border: none;
  overflow: visible;
}
</style>
