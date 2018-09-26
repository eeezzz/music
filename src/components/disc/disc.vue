<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
    <!-- <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list> -->
  </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from 'components/music-list/music-list'
// import {getSongList} from 'api/recommend'
// import {ERR_OK} from 'api/config'
import { mapGetters } from 'vuex'
import { createSong } from 'common/js/song'

export default {
  computed: {
    title() {
      return this.disc.dissname
    },
    bgImage() {
      return this.disc.imgurl
    },
    ...mapGetters(['disc'])
  },
  data() {
    return {
      songs: []
    }
  },
  created() {
    this._getSongList()
  },
  methods: {
    _getSongList() {
      if (!this.disc.dissid) {
        this.$router.push('/recommend')
        return
      }
      // getSongList(this.disc.dissid).then((res) => {
      //   if (res.code === ERR_OK) {
      //     console.log('res', res)
      //     this.songs = this._normalizeSongs(res.cdlist[0].songlist)
      //   }
      // })
      // return new Song({
      //   id: musicData.songid,
      //   mid: musicData.songmid,
      //   singer: filterSinger(musicData.singer),
      //   name: musicData.songname,
      //   album: musicData.albumname,
      //   // duration: musicData.interval,
      //   duration: 234,
      //   image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
      //   // url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`
      //   // url: `http://localhost:8080/static/audios/missyou.mp3`
      //   // url: `http://192.168.1.81:8080/static/audios/${musicData.songid}.mp3`
      //   url: `http://localhost:8080/static/audios/${musicData.songid}.mp3`
      // })
      let songlist = [
        {
          songid: '47sunsong',
          songmid: '111',
          singer: [{ name: '222' }],
          songname: '小太陽CD片頭曲',
          albumname: '小太陽CD片頭曲',
          interval: 61,
          albummid: '47sunsong-2'
        },
        {
          songid: '1808Family',
          songmid: '111',
          singer: [{ name: '222' }],
          songname: '甜蜜一家踢足球',
          albumname: '甜蜜一家踢足球',
          interval: 331,
          albummid: '1808Family-2'
        },
        {
          songid: '1808Animal',
          songmid: '111',
          singer: [{ name: '222' }],
          songname: '哇！動物大驚奇馬',
          albumname: '哇！動物大驚奇馬',
          interval: 216,
          albummid: '1808Animal-2'
        },
        {
          songid: '1808story',
          songmid: '111',
          singer: [{ name: '222' }],
          songname: '故事小屋小馬馬拉松',
          albumname: '故事小屋小馬馬拉松',
          interval: 432,
          albummid: '1808story-2'
        },
        {
          songid: '1808Emily',
          songmid: '111',
          singer: [{ name: '222' }],
          songname: '艾蜜莉校外教學',
          albumname: '艾蜜莉校外教學',
          interval: 273,
          albummid: '1808Emily-2'
        },
        {
          songid: '1808Song',
          songmid: '111',
          singer: [{ name: '222' }],
          songname: '兒歌點點名天黑黑',
          albumname: '兒歌點點名天黑黑',
          interval: 164,
          albummid: '1808Song-2'
        },
        {
          songid: '1808Health',
          songmid: '111',
          singer: [{ name: '222' }],
          songname: '小太陽保健室天會預測風雲？颱風來囉！',
          albumname: '小太陽保健室天會預測風雲？颱風來囉！',
          interval: 420,
          albummid: '1808Health-2'
        },
        {
          songid: '1808Philosophy',
          songmid: '111',
          singer: [{ name: '222' }],
          songname: '小小哲學家為什麼有時候我們會感覺美好？',
          albumname: '小小哲學家為什麼有時候我們會感覺美好？',
          interval: 210,
          albummid: '1808Philosophy-2'
        },
        {
          songid: '1808Samsam',
          songmid: '111',
          singer: [{ name: '222' }],
          songname: '閃閃小超人閃閃家族',
          albumname: '閃閃小超人閃閃家族',
          interval: 251,
          albummid: '1808Samsam-2'
        }
      ]
      this.songs = this._normalizeSongs(songlist)
      // console.log('songs', this.songs)
    },
    _normalizeSongs(list) {
      // console.log('songlist', list)
      let ret = []
      list.forEach(musicData => {
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  },
  components: {
    MusicList
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s;
}

.slide-enter, .slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>