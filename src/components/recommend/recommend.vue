<template>
  <div class="recommend">
    <div class="recommend-content">
      <!-- 有回傳值才炫染 -->
      <div v-if="recommends.length" class="slider-wrapper">
        <Slider>
          <div v-for="item in recommends" :key="item.id">
            <a :href="item.linkUrl">
              <img :src="item.picUrl" />
            </a>
          </div>
        </Slider>
      </div>
      <div class="recommend-list">
        <h1 class="list-title">熱門歌單推薦</h1>
        <ul>

        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Slider from 'base/slider/slider'
import { getRecommend } from 'api/recommend'
import { ERR_OK } from 'api/config'

export default {
  data() {
    return {
      recommends: []
    }
  },
  created() {
    this._getRecommend()
  },
  methods: {
    _getRecommend() {
      getRecommend().then(res => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider
        }
      })
    }
  },
  components: {
    Slider
  }
}
</script>

<style scoped>
</style>
