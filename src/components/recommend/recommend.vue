<template>
  <div class="recommend">
      <!-- 避免scroll高度不對，在slider以圖片load, 在歌單以數據變更，來執行 refresh -->
      <scroll ref="scroll" class="recommend-content" :data="discList">
        <div>
          <!-- 有回傳值才渲染 -->
          <div v-if="recommends.length" class="slider-wrapper">
            <Slider>
              <div v-for="item in recommends" :key="item.id">
                <a :href="item.linkUrl">
                  <!-- 當圖片load時，也通知 scroll 更新 -->
                  <img @load="loadImg" :src="item.picUrl" />
                </a>
              </div>
            </Slider>
          </div>
          <div class="recommend-list">
          <h1 class="list-title">熱門歌單推薦</h1>
          <ul>
            <li @click="selectItem(item)" v-for="(item, index) in discList" :key="index">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl"/>
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
          </div>
        </div>
        <div class="loading-container" v-show="!discList.length">
          <loading></loading>
        </div>
      </scroll>
      <router-view></router-view>
  </div>
</template>

<script>
import Slider from 'base/slider/slider'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import { getRecommend, getDiscList } from 'api/recommend'
import { ERR_OK } from 'api/config'
import {mapMutations} from 'vuex'

export default {
  data() {
    return {
      recommends: [],
      discList: []
    }
  },
  created() {
    this._getRecommend()
    setTimeout(() => {
      this._getDiscList()
    }, 1000)
  },
  methods: {
    selectItem(item) {
      console.log('selectItem')
      this.$router.push({
        path: `/recommend/${item.dissid}`
      })
      this.setDisc(item)
    },
    _getRecommend() {
      getRecommend().then(res => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider
        }
      })
    },
    _getDiscList() {
      getDiscList().then(res => {
        if (res.code === ERR_OK) {
          this.discList = res.data.list
        }
      })
    },
    loadImg() {
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh()
        this.checkLoaded = true
      }
    },
    ...mapMutations({
      setDisc: 'SET_DISC'
    })
  },
  components: {
    Slider,
    Scroll,
    Loading
  }
}
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'

  *
    border 1px solid yellow

  .recommend
    position fixed
    width 100%
    top 88px
    bottom 0
    .recommend-content
      height 100%
      overflow hidden
      .recommend-list
        .list-title
          height 65px
          line-height 65px
          text-align center
          font-size $font-size-medium
          color $color-theme
        .item
          display: flex
          box-sizing border-box
          // text-align center
          padding 0 20px 20px 20px
          .icon
            padding-right 20px
          .text
            display flex
            flex-direction column
            justify-content space-between
            font-size $font-size-medium
            .name
              color: $color-text
              // margin-bottom 10px
            .desc
              color: $color-text-d
      .loading-container
        position absolute
        width 100%
        top 50%
        transform translateY(-50%)


</style>

