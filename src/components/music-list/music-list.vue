<template>
  <div class="music-list">
    <div class="back" @click="back">
     <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div class="play" v-show="songs.length>0">
          <i class="icon-play"></i>
          <p class="text">隨機播放全部</p>
        </div>
      </div>
      <div class="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <Scroll class="list" @scroll="scroll" :data="songs" :probe-type="probeType" :listen-scroll="listenScroll" ref="list">
      <div class="song-list-wrapper">
        <song-list @select="selectItem" :songs="songs"></song-list>
      </div>
    </Scroll>
  </div>
</template>

<script>
  import SongList from 'base/song-list/song-list'
  import Scroll from 'base/scroll/scroll'
  import {mapActions} from 'vuex'

  const RESERVED_HEIGHT = 40

  export default {
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      title: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        scrollY: 0
      }
    },
    created() {
      this.probeType = 3
      this.listenScroll = true
    },
    mounted () {
      this.imageHeight = this.$refs.bgImage.clientHeight
      this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
      // list 實為 Scroll 組件，所以需要再以 $el 取得DOM，指到對應元素。
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    methods: {
      scroll(pos) {
        this.scrollY = pos.y
      },
      back() {
        this.$router.back()
      },
      // song-list的回呼
      selectItem(item, index) {
        // 呼叫Action, 變更vuex裡的數據
        this.selectPlay({
          list: this.songs,
          index
        })
      },
      ...mapActions([
        'selectPlay'
      ])
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      }
    },
    watch: {
      scrollY(newY) {
        // 愈往上滾 newY 負愈大
        let translateY = Math.max(this.minTranslateY, newY)
        let zIndex = 0
        let scale = 1
        // console.log('translateY->', translateY, this.minTranslateY, newY)
        this.$refs.layer.style['transform'] = `translate3d(0,${translateY}px,0`
        const percent = Math.abs(newY / this.imageHeight)
        if (newY > 0) {
          zIndex = 10
          scale = 1 + percent
        }
        if (newY < this.minTranslateY) {
          zIndex = 10
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
        } else {
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
        }
        this.$refs.bgImage.style.zIndex = zIndex
        this.$refs.bgImage.style['transform'] = `scale(${scale})`
      }
    },
    components: {
      Scroll,
      SongList
    }
  }
</script>

<style lang='stylus' scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      border: 1px solid yellow
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      // z-index 10
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      border 1px solid red
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      // overflow hidden
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
