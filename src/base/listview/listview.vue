<template>
  <scroll class="listview" 
          ref="listview" 
          :data="data" 
          :listenScroll="listenScroll"
          :probeType = "probeType"
          @scroll="scroll">
    <ul>
      <li v-for="(group, index) in data" :key="index" class="list-group" ref="listGroup">
        <!-- map[key].title (熱門, a, b... z) -->
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <!-- map[key].items -->
          <li @click="selectItem(item)" v-for="(item, index) in group.items" :key="index" class="list-group-item">
            <img class="avatar" v-lazy="item.avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li v-for="(item,index) in shortcutList" 
            :key="index" 
            class="item" 
            :class="{'current': currentIndex === index}"
            :data-index="index">
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}}</div>
    </div>
    <div v-show="!data.length" class="loading-container">
      <Loading></Loading>
    </div>
  </scroll>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import {getData} from 'common/js/dom'

const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30

export default {
  data() {
    return {
      // 記錄事件scroll的值
      scrollY: -1,
      // 當前第幾個
      currentIndex: 0,
      // 標頭偏移值
      diff: -1
    }
  },
  props: {
    data: Array,
    default: []
  },
  computed: {
    // 取 title 的第一個字
    shortcutList() {
      return this.data.map((group) => {
        return group.title.substr(0, 1)
      })
    },
    fixedTitle() {
      // 讓固定標題，在第一個標題在下拉時，不會出現
      if (this.scrollY > 0) {
        return
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  created() {
    // 在data裡的值，會被監控著。
    // 為了增加一些效能，一些無需關注的值，可以在created設定
    this.touch = {}
    this.listenScroll = true
    this.listHeight = []
    this.probeType = 3 // 重要
  },
  methods: {
    selectItem(item) {
      this.$emit('select', item)
    },
    // 取得點擊的data-index值，再直接滾動到對應的listGroup
    onShortcutTouchStart(e) {
      console.log('touched', e.target)
      let anchorIndex = getData(e.target, 'index')
      // 記錄按下去的Y坐標(pageY)、map[index]中的index
      let firstTouch = e.touches[0]
      // pageY 指整個document的Y坐標值
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    onShortcutTouchMove(e) {
      console.log('onmove')
      let firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0 // math.floor()
      console.log(delta)
      // getAttribute取出的為字串，需以parseInt轉為數值
      let anchorIndex = delta + parseInt(this.touch.anchorIndex)
      this._scrollTo(anchorIndex)
    },
    scroll(pos) {
      this.scrollY = pos.y
      console.log('Y', this.scrollY)
    },
    _scrollTo(index) {
      // console.log(index)
      // 處理touch 在熱和Z 導至的null
      if (!index && index !== 0) {
        return
      }
      // 處理touchmove移到熱門上面時
      if (index < 0) {
        index = 0
      }
      // if (index < 0) {
      //   index = 0
      // } else if (index > this.listHeight.length - 2) {
      //   index = this.listHeight.length - 2
      // }
      // watch裡的scrollY才能改變currentIndex
      // 所以touch後，需要手動趨動 this.scrollY
      this.scrollY = -this.listHeight[index]
      // this.$refs.listview 是 scroll 組件
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
    },
    _calculateaHeight() {
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      // 開頭的高度
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        // 加上每一個元素高度
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  },
  // scroll事件會造成watch
  watch: {
    data() {
      setTimeout(() => {
        this._calculateaHeight()
      }, 20)
    },
    scrollY(newY) {
      // newY 為負，愈往下負愈大
      const listHeight = this.listHeight
      // 當滾動到頂部
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 在中間部份滾動
      for (let i = 0; i < listHeight.length; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        // console.log('h', height1, height2)
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          this.diff = height2 - (-newY)
          // console.log('currentIndex', this.currentIndex)
          return
        }
      }
      // 滾動到底部
      this.currentIndex = listHeight.length - 2
    },
    diff(newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      // 不在改變範圍內，直接返回，減少DOM操作頻度
      if (this.fixedTop === fixedTop) {
        console.log('this', this.fixedTop, fixedTop)
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
    }
  },
  components: {
    Scroll,
    Loading
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
