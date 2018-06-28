<template>
  <div class="m-header">
    <div class="icon"></div>
    <h1 class="text">Chicken Music</h1>
  </div>
</template>

<script>
  export default {

  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  *
    border 1px solid white
    margin 0
    padding 0

  // .m-header
  //   color $color-theme
  //   text-align center
  //   height 44px
  //   // display inline-block
  //   .icon
  //     display inline-block
  //     // vertical-align top
  //     margin-top 6px
  //     margin-right 9px
  //     width 30px
  //     height 30px
  //     bg-image('logo')
  //     background-size 30px 32px
  //   .text
  //     display inline-block
  //     vertical-align top
  //     line-height 44px
  //     font-size $font-size-largex

    .m-header
      color $color-theme
      text-align center
      height 44px
      .icon
        display inline-block
        vertical-align top
        width 30px
        height 30px
        margin-top 6px
        margin-right 9px
        bg-image('logo')
        background-size 30px 30px
      .text
        display inline-block
        vertical-align top
        line-height 44px
        font-size $font-size-large

</style>
