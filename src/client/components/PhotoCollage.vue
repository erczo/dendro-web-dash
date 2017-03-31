<template>
  <div class="d-flex flex-row justify-content-center">
    <div class="d-flex flex-column" :class="media.length > 1 ? 'rounded-left' : 'rounded'" style="overflow: hidden;" v-if="media.length > 0">
      <a role="button" @click.prevent="select(0)">
        <img class="photo-small" :src="isRetina && media[0].sizes.small_2x ? media[0].sizes.small_2x.url : media[0].sizes.small.url">
      </a>
    </div>

    <div class="d-flex flex-column bg-faded rounded-right" style="overflow: hidden; border-left: solid 1px #fff;" v-if="media.length > 1">
      <a role="button" style="position: relative;" v-for="(item, index) in media" v-if="index > 0 && index < 5" @click.prevent="select(index)">
        <img class="photo-thumb" :class="[index > 3 ? 'border-0' : '', index > 3 && media.length > 5 ? 'img-darken' : '']" :src="isRetina && item.sizes.thumb_2x ? item.sizes.thumb_2x.url : item.sizes.thumb.url"></img>

        <div class="d-flex flex-column justify-content-center" style="top: 0; left: 0; position: absolute; height: 100%; width: 100%;" v-if="index > 3 && media.length > 5">
          <span class="text-center text-white font-weight-bold">+{{ media.length - 4 }}</span>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'

export default {
  props: {
    isRetina: Boolean,
    media: Array
  },

  mounted () {
    $(this.$el).find('img').bind('error', (e) => {
      this.$emit('error')
    })
  },

  beforeDestroy () {
    $(this.$el).find('img').unbind()
  },

  methods: {
    select (index) {
      this.$emit('select', index)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.photo-thumb { border-bottom: 1px solid #fff; }
</style>
