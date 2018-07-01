<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" :class="{active: currentPageIndex === index }" v-for="(item, index) in dots" :key="index"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { addClass } from 'common/js/dom'
import BScroll from 'better-scroll'

export default {
  name: 'slider',
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 4000
    }
  },
  data() {
    return {
      dots: [],
      currentPageIndex: 0
    }
  },
  mounted() {
    // 組件初始化
    setTimeout(() => {
      this._setSliderWidth()
      this._initDots()
      this._initSlider()

      if (this.autoPlay) {
        this._play()
      }
    }, 20)

    window.addEventListener('resize', () => {
      if (!this.slider || !this.slider.enabled) {
        return
      }
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        if (this.slider.isInTransition) {
          this._onScrollEnd()
        } else {
          if (this.autoPlay) {
            this._play()
          }
        }
        this.refresh()
      }, 60)
    })
  },
  activated() {
    this.slider.enable()
    let pageIndex = this.slider.getCurrentPage().pageX
    this.slider.goToPage(pageIndex, 0, 0)
    this.currentPageIndex = pageIndex
    if (this.autoPlay) {
      this._play()
    }
  },
  deactivated() {
    this.slider.disable()
    clearTimeout(this.timer)
  },
  beforeDestroy() {
    this.slider.disable()
    clearTimeout(this.timer)
  },
  methods: {
    refresh() {
      if (this.slider) {
        this._setSliderWidth(true)
        this.slider.refresh()
      }
    },
    // 設定每張圖片寛度及輪播組件總寛度
    _setSliderWidth(isResize) {
      this.children = this.$refs.sliderGroup.children

      let width = 0
      let sliderWidth = this.$refs.slider.clientWidth
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        // 每張圖片加上 .slider-item
        addClass(child, 'slider-item')
        // 設定圖片寛度＝輪播組件（螢幕）寛度
        child.style.width = sliderWidth + 'px'
        width += sliderWidth
      }
      // 因為循環輪播，前後需加上一單位的寛度
      if (this.loop && !isResize) {
        width += 2 * sliderWidth
      }
      // 設定輪播組件總寛度
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    // 初始化 BScroll 輪播組件
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true, // 開啟橫向滾動
        scrollY: false,
        momentum: false, // 關閉快速滑動功能
        snap: {
          // 配置Slide組件用
          loop: this.loop, // 設定是否循環輪播
          threshold: 0.3, // 設定可滾動到下一個的邊界值
          speed: 400
        },
        click: true // 默認會阻止瀏覧器原生的 click 事件
      })

      // 滾動結束時觸發
      this.slider.on('scrollEnd', this._onScrollEnd)

      // 手指/mouse 離開時觸發
      this.slider.on('touchend', () => {
        if (this.autoPlay) {
          this._play()
        }
      })

      // 滾動開始之時觸發
      this.slider.on('beforeScrollStart', () => {
        if (this.autoPlay) {
          clearTimeout(this.timer)
        }
      })
    },

    // 滾動結束時觸發
    _onScrollEnd() {
      // 獲取當前頁面數
      let pageIndex = this.slider.getCurrentPage().pageX
      // 變更 dot 顯示
      this.currentPageIndex = pageIndex
      // 自動輪播則設定Timer, 滾動到下一個頁面
      if (this.autoPlay) {
        this._play()
      }
    },
    // dot數 = 圖片個數
    _initDots() {
      this.dots = new Array(this.children.length)
    },

    // 設定Timer, 滾動到下一個頁面
    _play() {
      clearTimeout(this.timer)

      this.timer = setTimeout(() => {
        this.slider.next()
      }, this.interval)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    position relative
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      transform: translateZ(1px)
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>