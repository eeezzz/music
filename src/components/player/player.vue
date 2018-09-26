<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img with="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
            @touchstart.prevent="middleTouchStart"
            @touchmove.prevent="middleTouchMove"
            @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine" 
                  class="text" 
                  :class="{'current': currentLineNum === index}"
                  v-for="(line, index) in currentLyric.lines" :key="index">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow==='cd'}"></span>
            <span class="dot" :class="{'active': currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <div class="icon" @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></div>
            </div>
          </div>
        </div>
      </div>
    </transition>    
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img  :class="cdCls" width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <ProgressCircle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </ProgressCircle>
        </div>
        <!-- 這裡的click.stop是阻止playlis的click -->
        <div class="control" @click.stop="showPlayList"> 
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <play-list ref="playlist"></play-list>
    <audio ref="audio" :src="currentSong.url" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
    <!-- <audio ref="audio" src="/static/audios/missyou.mp3" ></audio> -->
    <!-- <audio ref="audio" src="http://localhost:82/audios/missyou.mp3" ></audio> -->
  </div>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from 'common/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'
import PlayList from 'components/playlist/playlist'
import {playerMixin} from 'common/js/mixin'
import { Base64 } from 'js-base64'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')

export default {
  mixins: [playerMixin],
  data() {
    return {
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currentLineNum: 0,
      currentShow: 'cd',
      playingLyric: ''
    }
  },
  computed: {
    cdCls() {
      return this.playing ? 'play' : 'play pause'
    },
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    miniIcon() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    disableCls() {
      return this.songReady ? '' : 'disable'
    },
    percent() {
      return this.currentTime / this.currentSong.duration
    },
    ...mapGetters([
      'fullScreen',
      'playlist',
      'currentSong',
      'playing',
      'currentIndex',
      'mode',
      'sequenceList'
    ])
  },
  created() {
    this.touch = {}
  },
  methods: {
    created() {
      this.touch = {}
    },
    back() {
      this.setFullScreen(false)
    },
    open() {
      this.setFullScreen(true)
    },
    enter(el, done) {
      const {x, y, scale} = this._getPosAndScale()
      console.log('x,y,scale', x, y, scale)
      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        80: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      }

      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 800,
          easing: 'linear'
        }
      })

      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter() {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.8s'
      const {x, y, scale} = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    togglePlaying() {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
      console.log('playing', this.playing)
    },
    end() {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    loop() {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    next() {
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex + 1
        if (index === this.playlist.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
      this.songReady = false
    },
    prev() {
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
      this.songReady = false
    },
    ready() {
      this.songReady = true
    },
    error() {
      this.songReady = true
    },
    updateTime(e) {
      this.currentTime = e.target.currentTime
    },
    format(interval) {
      interval = interval | 0
      const minute = interval / 60 | 0
      const second = this._pad(interval % 60)
      return `${minute}:${second}`
    },
    onProgressBarChange(percent) {
      const currentTime = this.currentSong.duration * percent
      this.$refs.audio.currentTime = currentTime
      if (!this.playing) {
        this.togglePlaying()
      }
      if (this.currentLyric) {
        // this.currentLyric.seek(currentTime * 1000)
      }
    },
    changeMode() {
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list)
    },
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    getLyric() {
      // this.currentSong.getLyric().then((lyric) => {
      //   console.log('lyric', lyric)
      //   this.currentLyric = new Lyric(lyric, this.handleLyric)
      //   if (this.playing) {
      //     this.currentLyric.play()
      //   }
      //   // console.log(this.currentLyric)
      // }).catch(() => {
      //   this.currentLyric = null
      //   this.playingLyric = ''
      //   this.currentLineNum = 0
      // })
      let myLyric = 'W3RpOua8lOWRmF0KW2FyOuiWm+S5i+iwpl0KW2FsOue7heWjq10KW2J5Ol0KW29mZnNldDowXQpbMDA6MDAuNTZd5ryU5ZGYIC0g6Jab5LmL6LCmIChKb2tlcikKWzAwOjAyLjQyXeivje+8muiWm+S5i+iwpgpbMDA6MDMuOTld5puy77ya6Jab5LmL6LCmClswMDowNS4zOF3nvJbmm7LvvJrpg5HkvJ8v5byg5a6d5a6HClswMDowNy40NV3liLbkvZzkurrvvJrotbXoi7Hkv4oKWzAwOjA5LjA5XeWQiOWjsO+8mui1teiLseS/igpbMDA6MTAuNDhd5b2V6Z+z5biI77ya546L5pmT5rW3ClswMDoxMS43NF0KWzAwOjEyLjM0Xea3t+mfs+W4iO+8mumyjemUkApbMDA6MTMuODhd5q+N5bim5aSE55CG5bel56iL5biI77ya6bKN6ZSQClswMDoxNi4xMF0KWzAwOjIxLjI1XeeugOWNleeCuQpbMDA6MjIuMjFdClswMDoyNS4xNl3or7Tor53nmoTmlrnlvI/nroDljZXngrkKWzAwOjI4LjI3XQpbMDA6MzAuMjJd6YCS6L+b55qE5oOF57uq6K+355yB55WlClswMDozMy41N13kvaDlj4jkuI3mmK/kuKrmvJTlkZgKWzAwOjM2LjI3XeWIq+iuvuiuoemCo+S6m+aDheiKggpbMDA6MzkuMDhdClswMDo0Mi4yMF3msqHmhI/op4EKWzAwOjQzLjc0XQpbMDA6NDYuMTdd5oiR5Y+q5oOz55yL55yL5L2g5oCO5LmI5ZyGClswMDo0OS40N10KWzAwOjUxLjc0XeS9oOmavui/h+eahOWkquihqOmdogpbMDA6NTQuNjBd5YOP5rKh5aSp6LWL55qE5ryU5ZGYClswMDo1Ny4yMV3op4LkvJfkuIDnnLzog73nnIvop4EKWzAwOjU5LjY4XQpbMDE6MDIuNDZd6K+l6YWN5ZCI5L2g5ryU5Ye655qE5oiR5ryU6KeG6ICM5LiN6KeBClswMTowNy4wMl0KWzAxOjA3LjU2XeWcqOmAvOS4gOS4quacgOeIseS9oOeahOS6uuWNs+WFtOihqOa8lApbMDE6MTIuMTldClswMToxMi44Nl3ku4DkuYjml7blgJnmiJHku6zlvIDlp4vmlLbotbfkuoblupXnur8KWzAxOjE3LjM4XQpbMDE6MTguMDNd6aG65bqU5pe25Luj55qE5pS55Y+Y55yL6YKj5Lqb5ouZ5Yqj55qE6KGo5ryUClswMToyMy40MF3lj6/kvaDmm77nu4/pgqPkuYjniLHmiJHlubLlmJvmvJTlh7rnu4boioIKWzAxOjI3Ljk2XQpbMDE6MjguNjFd5oiR6K+l5Y+Y5oiQ5LuA5LmI5qC35a2Q5omN6IO95bu257yT5Y6M5YCmClswMTozMy4zNF0KWzAxOjMzLjg2XeWOn+adpeW9k+eIseaUvuS4i+mYsuWkh+WQjueahOi/meS6m+mCo+S6mwpbMDE6MzguNDddClswMTozOS40Ml3miY3mmK/ogIPpqowKWzAxOjQxLjQxXQpbMDE6NDQuOTld5rKh5oSP6KeBClswMTo0Ni4zN10KWzAxOjQ5LjA2XeS9oOaDs+aAjuagt+aIkemDvemaj+S+vwpbMDE6NTIuMTNdClswMTo1NS4wMV3kvaDmvJTmioDkuZ/mnInpmZAKWzAxOjU3LjM3XeWPiOS4jeeUqOivtOaEn+iogApbMDI6MDAuMDdd5YiG5byA5bCx5bmz5reh5LqbClswMjowMi44OF0KWzAyOjA1LjM1XeivpemFjeWQiOS9oOa8lOWHuueahOaIkea8lOinhuiAjOS4jeingQpbMDI6MDkuOTJdClswMjoxMC40OF3liKvpgLzkuIDkuKrmnIDniLHkvaDnmoTkurrljbPlhbTooajmvJQKWzAyOjE1LjE1XQpbMDI6MTUuODBd5LuA5LmI5pe25YCZ5oiR5Lus5byA5aeL5rKh5pyJ5LqG5bqV57q/ClswMjoyMC4yNl0KWzAyOjIwLjk0XemhuuedgOWIq+S6uueahOiwjuiogOiiq+WKqOWwseS4jeaYvuW+l+WPr+aAnApbMDI6MjYuMzFd5Y+v5L2g5pu+57uP6YKj5LmI54ix5oiR5bmy5Zib5ryU5Ye657uG6IqCClswMjozMC43OF0KWzAyOjMxLjUyXeaIkeivpeWPmOaIkOS7gOS5iOagt+WtkOaJjeiDvemFjeWQiOWHuua8lApbMDI6MzUuOTVdClswMjozNi43Nl3ljp/mnaXlvZPniLHmlL7kuIvpmLLlpIflkI7nmoTov5nkupvpgqPkupsKWzAyOjQxLjE3XQpbMDI6NDEuOTFd6YO95pyJ5Liq5pyf6ZmQClswMjo0NC40OF0KWzAyOjQ3LjkyXeWFtuWunuWPsOS4i+eahOinguS8l+WwseaIkeS4gOS4qgpbMDI6NTEuODddClswMjo1My4wNF3lhbblrp7miJHkuZ/nnIvlh7rkvaDmnInngrnkuI3oiI0KWzAyOjU3LjI2XQpbMDI6NTguNDFd5Zy65pmv5Lmf5Lmg5oOv5oiR5Lus5p2l5Zue5ouJ5omvClswMzowMi4yMl0KWzAzOjAyLjk3Xei/mOiuoei+g+edgOS7gOS5iApbMDM6MDYuOTJdClswMzowOC44Nl3lhbblrp7or7TliIbkuI3lvIDnmoTkuZ/kuI3op4HlvpcKWzAzOjEzLjI1XQpbMDM6MTQuMTZd5YW25a6e5oSf5oOF5pyA5oCV55qE5bCx5piv5ouW552AClswMzoxOC4yM10KWzAzOjE5LjM5Xei2iua8lOWIsOmHjeWcuuaIj+i2iuWTreS4jeWHuuS6hgpbMDM6MjMuMzBdClswMzoyNC4xOF3mmK/lkKbov5jlgLzlvpcKWzAzOjI3LjQzXQpbMDM6MjkuMTVd6K+l6YWN5ZCI5L2g5ryU5Ye655qE5oiR5bC95Yqb5Zyo6KGo5ryUClswMzozMy43N10KWzAzOjM0LjM2XeWDj+aDheaEn+iKguebrumHjOeahOWYieWuvuS7u+S6uuaMkemAiQpbMDM6MzkuMTddClswMzozOS43MV3lpoLmnpzov5jog73nnIvlh7rmiJHmnInniLHkvaDnmoTpgqPpnaIKWzAzOjQ0LjAzXQpbMDM6NDQuOTNd6K+35Ymq5o6J6YKj5Lqb5oOF6IqC6K6p5oiR55yL5LiK5Y675L2T6Z2iClswMzo1MC4yMF3lj6/kvaDmm77nu4/pgqPkuYjniLHmiJHlubLlmJvmvJTlh7rnu4boioIKWzAzOjU0LjgxXQpbMDM6NTUuNDNd5LiN5Zyo5oSP55qE5qC35a2Q5piv5oiR5pyA5ZCO55qE6KGo5ryUClswNDowMC4wNF0KWzA0OjAxLjMyXeaYr+WboOS4uueIseS9oOaIkeaJjemAieaLqeihqOa8lApbMDQ6MDUuMjJdClswNDowNi4xN13ov5nnp43miJDlhag='
      let lyric = Base64.decode(myLyric)
      this.currentLyric = new Lyric(lyric, this.handleLyric)
      if (this.playing) {
        this.currentLyric.play()
      }
      console.log('mygetLyric', this.currentLyric)
    },
    handleLyric({lineNum, txt}) {
      this.currentLineNum = lineNum
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]  // <p></p>
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      this.playingLyric = txt
    },
    showPlayList() {
      this.$refs.playlist.show()
    },
    middleTouchStart(e) {
      this.touch.initiated = true
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchMove(e) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX
      console.log('deltax', deltaX)
      const deltaY = touch.pageY - this.touch.startY
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.lyricList.$el.style[transitionDuration] = 0
      console.log('offsetWidth', offsetWidth, 'left', left)
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      this.$refs.middleL.style[transitionDuration] = 0
    },
    middleTouchEnd() {
      let offsetWidth
      let opacity
      if (this.currentShow === 'cd') { // 從右向左滑
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else { // 從左向左滑
        if (this.touch.percent < 0.9) {
          offsetWidth = 0
          this.currentShow = 'cd'
          opacity = 1
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      const time = 300
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
    },
    _pad(num, n = 2) {
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),
    _getPosAndScale() {
      // icon width: 40px  padding: 0 10px 0 20px
      const targetWidth = 40
      const paddingLeft = 40
      const paddingBottom = 30
      const paddingTop = 80
      // cd width: 80%
      const width = window.innerWidth * 0.8
      // mini icon 對應 normal 的比率
      const scale = targetWidth / width
      // 計算以normal cd為中心點(0,0), 至mini cd的位移值
      // CSS x 往左是減，所以要取負值
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - paddingBottom - width / 2
      return {
        x, y, scale
      }
    }
  },
  watch: {
    currentSong(newSong, oldSong) {
      // 刪到列表無歌曲
      if (!newSong.id) {
        return
      }
      if (newSong.id === oldSong.id) {
        return
      }
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
      console.log(newSong.id, oldSong.id, newSong.url)
      setTimeout(() => {
        // this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        this.getLyric()
      }, 1000)
    },
    playing(newPlaying) {
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause()
        console.log('wplaying', newPlaying)
      })
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    PlayList
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>