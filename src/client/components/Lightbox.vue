<template>
  <div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="lightbox" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-body">

          <div class="carousel slide" data-ride="carousel" v-if="media.length > 0">
            <div class="carousel-inner" role="listbox">
              <div class="carousel-item active">
                <img class="d-block img-fluid" height="1080" width="1080" :src="isRetina && media[currentIndex].sizes.large_2x ? media[currentIndex].sizes.large_2x.url : media[currentIndex].sizes.large.url">
              </div>
            </div>

            <a class="carousel-control-prev" role="button" v-if="media.length > 1" @click.prevent="goToPrev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" role="button" v-if="media.length > 1" @click.prevent="goToNext">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
// TODO: Add onload handler with spinner
import $ from 'jquery'

export default {
  props: {
    isRetina: Boolean,
    media: Array,
    options: Object
  },

  data () {
    return {
      currentIndex: 0
    }
  },

  methods: {
    goToNext () {
      this.currentIndex = (this.currentIndex + 1) % this.media.length
    },
    goToPrev () {
      this.currentIndex = (this.currentIndex > 0 ? this.currentIndex : this.media.length) - 1
    }
  },

  watch: {
    options (newOptions) {
      if (newOptions && (typeof newOptions.index === 'number')) {
        this.currentIndex = newOptions.index
        $(this.$el).modal({}) // Use defaults
      } else {
        $(this.$el).modal('hide')
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* PATCH: https://github.com/twbs/bootstrap/issues/21658 */
.carousel-item.active,
.carousel-item-next,
.carousel-item-prev {
  display: block;
}
</style>
