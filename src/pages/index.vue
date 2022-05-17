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

const timeStampsPerVideo: Ref<any[]> = ref([
  {
    id: 'BDllaGN-4nY',
    title: 'Video 1',
    loop: 1,
    autoplay: 1,
    timestamps: [
      {
        name: '5th 1/8',
        start: 872,
        end: 1082,
      },
      {
        name: '6th 1/8',
        start: 1082,
        end: 1292,
      },
    ],
  },
])

const submitVideo = async () => {
  const videoResp = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${newVideoId.value}&key=AIzaSyCwk7uCR8zZLOg38CuqUg5aZHmlmbRvkDk`)

  timeStampsPerVideo.value.push({
    id: newVideoId.value,
    title: videoResp.data?.items?.[0].snippet.title,
    loop: 1,
    autoplay: 1,
    timestamps: [],
  })

  newVideoId.value = ''
}

const start = (timestamp: Video) => {
  console.log(timestamp)
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
  }, 500)

  setTimeout(() => {
    youtube.value.unMute()
  }, 1500)
}

const StateChange = (state: any) => {
  if (state.data === 0) {
    state.target.playVideo()
    state.target.seekTo(vars.value.start, true)
  }
}

const currentVideo: Ref<number | null> = ref(null)
const selectVideo = (index: number) => currentVideo.value = index

/* <button v-if="video.timestamps.length === 0" @click="start(video)">
  Start
</button>

<div v-for="(timestamp, key) in video.timestamps" v-else :key="key">
  <p>{{ timestamp.name }} || start: {{ timestamp.start }} || end: {{ timestamp.end }}</p>
  <button @click="start({ ...video, timestamp })">
    Start
  </button>
</div> */
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

    <div v-for="(video, index) in timeStampsPerVideo" :key="video.id">
      <p>{{ video.title }}</p>
      <button @click="selectVideo(index)">
        Select
      </button>
    </div>

    <div v-if="currentVideo">
      <button v-if="timeStampsPerVideo[currentVideo].timestamps.length === 0" @click="start(timeStampsPerVideo[currentVideo || -1])">
        Start
      </button>

      <div v-for="(timestamp, key) in timeStampsPerVideo[currentVideo].timestamps" v-else :key="key" class="bg-white">
        <p>{{ timestamp.name }} || start: {{ timestamp.start }} || end: {{ timestamp.end }}</p>
        <button @click="start({ ...video, timestamp })">
          Start
        </button>
        <button
          @click="timeStampsPerVideo[currentVideo || 0].timestamps.push(
            {
              name: '',
              end: '',
              start: '',
              autoplay: 1,
            },
          )"
        >
          Add
        </button>
        <div>
          <p>Name</p>
          <input v-model="timestamp.name" type="text">
          <p>Start in seconds</p>
          <input v-model="timestamp.start" type="text">
          <p>End in seconds</p>
          <input v-model="timestamp.end" type="text">
          <button @click="start({ ...video, timestamp })">
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
