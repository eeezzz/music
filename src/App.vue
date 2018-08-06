<template>
  <div id="app">
    <m-header></m-header>
    <Tab></Tab>
    <!-- 將dom, 緩存到內存中 -->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script type="text/ecmascript-6">
  import MHeader from 'components/m-header/m-header'
  import Tab from 'components/tab/tab'

  export default {
    components: {
      MHeader,
      Tab
    }
  }
</script>

<style scoped lang="stylus">
  @import "~common/stylus/variable"

  // #app
  //   color: $color-theme
</style>
