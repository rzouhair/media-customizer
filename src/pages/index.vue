<script setup lang="ts">
import type { Ref } from 'vue'
import axios from 'axios'
import YouTube from 'vue3-youtube'

interface Video {
  id: string
  loop: number
  start: number
  end: number
  autoplay: number
}

const BASE_URL = 'https://www.youtube.com/watch?v'

const youtube: Ref<any> = ref(null)
const showFrame: Ref<boolean> = ref(false)
const src: Ref<string> = ref('')

const newVideoId = ref('')

const vars: Ref<YT.PlayerVars> = ref({
  loop: 1,
})

const timeStampsPerVideo: Ref<Video[]> = ref([
  {
    id: 'iVChyaHLH68',
    loop: 1,
    start: 1195,
    end: 1200,
    autoplay: 1,
  },
])

const submitVideo = async () => {
  const test = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${newVideoId.value}&key=AIzaSyCwk7uCR8zZLOg38CuqUg5aZHmlmbRvkDk`)

  newVideoId.value = ''

  console.log(test.data?.items?.[0].snippet.title)
}

const start = (timestamp: Video) => {
  showFrame.value = false
  src.value = `${BASE_URL}=${timestamp.id}`
  vars.value = {
    loop: 1,
    end: timestamp.end,
    start: timestamp.start,
    autoplay: timestamp.autoplay,
  }

  setTimeout(() => {
    showFrame.value = true
    youtube.value.unMute()
  }, 500)
}

const StateChange = (state: any) => {
  if (state.data === 0) {
    state.target.playVideo()
    state.target.seekTo(10, true)
  }
}

onBeforeMount(async () => {
})
</script>

<template>
  <div>
    <div>
      <p>Add a new video</p>
      <input v-model="newVideoId" type="text">
      <button @click="submitVideo">
        Submit
      </button>
    </div>
    <YouTube
      v-if="showFrame"
      ref="youtube"
      :src="src"
      :vars="vars"
      @state-change="StateChange"
    />

    <div v-for="timestamp in timeStampsPerVideo" :key="timestamp.id">
      <p>{{ timestamp.id }}</p>
      <button @click="start(timestamp)">
        Start
      </button>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
