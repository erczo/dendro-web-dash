<template>
  <div id="app">
    <header>
      <nav class="navbar navbar-inverse fixed-top">
        <div class="container">

          <!-- TODO: Remove this -->
          <!-- Reserve Name -->
          <!-- <a class="navbar-brand" href="http://www.blueoakranchreserve.org/" target="_blank"><span class="hidden-sm-down">Blue Oak Ranch Reserve </span><i class="fa fa-external-link" aria-hidden="true"></i></a> -->

          <a class="navbar-brand" href="/"><i class="fa fa-pagelines" aria-hidden="true"></i> <span class="hidden-xs-down">Dendro</span></a>

          <!-- Nav Toolbar -->
          <div class="btn-toolbar float-right" role="toolbar" aria-label="Navigation toolbar">

            <!-- Alert Badge -->
            <div class="btn-group mr-1" role="group" aria-hidden="true">
              <button type="button" class="btn btn-outline-secondary border-0 text-white">
                <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                <span class="badge badge-pill badge-danger" style="vertical-align: top">5</span>
              </button>
            </div>

            <!-- Units Dropdown -->
            <div class="btn-group" role="group" aria-label="Units dropdown">
              <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="hidden-xs-down">Units: </span>Metric
              </button>
              <div class="dropdown-menu">
                <a class="dropdown-item" href="#">English</a>
                <a class="dropdown-item" href="#">Metric</a>
              </div>
            </div>
          </div>

        </div>
      </nav>
    </header>

    <!-- Component matched by the route will render here -->
    <router-view></router-view>

    <footer>
      <div class="container-fluid">
        <div class="row">

          <div class="col-12">
            <div class="text-center">
              <small>Problems viewing this page? Email&nbsp;<a href="mailto:collin@berkeley.edu">collin@berkeley.edu</a></small>
            </div>
          </div>

        </div>
      </div>
    </footer>
  </div>
</template>

<script>
// TODO: Import these from tiles.vue?
// TODO: Move navbar and profile into components
// TODO: Refactor styles for components
// TODO: Add page footer
</script>

<style>
body {
  background-color: #fff;
}

.bg-darken { background-color: rgba(0, 0, 0, 0.1); }
.bg-lighten { background-color: rgba(255, 255, 255, 0.1); }

.flex-1 { flex: 1 0 auto; }
.flex-2 { flex: 2 0 auto; }
.flex-3 { flex: 3 0 auto; }
.flex-4 { flex: 4 0 auto; }

.img-profile {
  width: 240px;
  height: 240px;
}

.text-inverse { color: #fff;   }
.text-thin { font-weight: 300; }

.tile {
  /*border: 1px solid #e1e1e1;*/
  /*border-radius: 0.3rem;*/
  overflow: hidden;
}
.tile table {
  margin-bottom: 0;
}
.tile h1,
.tile h2,
.tile h3,
.tile .h1,
.tile .h2,
.tile .h3 {
  /* OPTIONAL */
  /*text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.2);*/
}
.tile .border-bottom {
  border-bottom: 1px solid #eceeef;
}
.tile .border-top {
  border-top: 1px solid #eceeef;
}
.tile .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}

header .navbar {
  background-color: rgba(80, 139, 191, 0.96);
  border-bottom: 1px solid rgb(80, 139, 191)
}

footer {
  background-color: #eee;
  padding: 1rem 0;
}
</style>
