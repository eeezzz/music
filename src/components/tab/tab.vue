<template>
  <div class="tab">
    <router-link tag="div" class="tab-item" to="/recommend">
      <span class="tab-link">推薦</span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/singer">
      <span class="tab-link">歌手</span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/rank">
      <span class="tab-link">排手</span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/search">
      <span class="tab-link">搜索</span>
    </router-link>
  </div>
</template>

<script>
  export default {

  }
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  *
    border 1px solid white
    margin 0
    padding 0

  .tab
    display flex
    height 44px
    justify-content space-around
    align-items center
    font-size $font-size-medium
    .tab-item
      .tab-link
        color $color-text-l
        padding-bottom 5px
      &.router-link-active
        .tab-link
          color $color-theme
          border-bottom 2px solid $color-theme



</style>

