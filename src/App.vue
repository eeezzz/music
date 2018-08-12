<template>
  <div id="app">
    <m-header></m-header>
    <Tab></Tab>
    <!-- 將dom, 緩存到內存中 -->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script type="text/ecmascript-6">
  import MHeader from 'components/m-header/m-header'
  import Tab from 'components/tab/tab'
  import Player from 'components/player/player'

  export default {
    components: {
      MHeader,
      Tab,
      Player
    }
  }
</script>

<style scoped lang="stylus">
  @import "~common/stylus/variable"

  // #app
  //   color: $color-theme
</style>
