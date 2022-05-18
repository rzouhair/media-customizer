<script setup lang="ts">
import type { Ref } from 'vue'
import axios from 'axios'
import YouTube from 'vue3-youtube'
import { Trash } from '@vicons/tabler'
import { useMessage } from 'naive-ui'
import { toggleDark } from '~/composables'
import { deleteTimestamp as deleteTs, getTimestamps, timestampsCollection, updateTimestamp, useLoadTimestamps } from '~/firebase'

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

const loading = ref(false)
const newVideoId = ref('')
const searchInput = ref('')
const { t } = useI18n()

const message = useMessage()

const vars: Ref<YT.PlayerVars> = ref({
  loop: 1,
})

const timeStampsPerVideo: Ref<any[]> = ref([])
const filteredTimestamps = computed(() => timeStampsPerVideo.value.filter((ts: any) => ts.title?.toLowerCase().includes(searchInput.value.toLowerCase())))

const submitVideo = async () => {
  const videoId = newVideoId.value.replace('https://', '').replace('www.youtube.com/watch?v=', '')
  console.log(videoId)
  const videoResp = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=AIzaSyCwk7uCR8zZLOg38CuqUg5aZHmlmbRvkDk`)

  timeStampsPerVideo.value.push({
    id: newVideoId.value,
    title: videoResp.data?.items?.[0].snippet.title,
    loop: 1,
    autoplay: 1,
    timestamps: [],
  })

  newVideoId.value = ''
}

const start = ({ video, timestamp }: any) => {
  showFrame.value = false
  src.value = `${BASE_URL}=${video.id}`
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
    youtube.value.playVideo()
    youtube.value.unMute()
  }, 1500)
}

const StateChange = (state: any) => {
  if (state.data === 0) {
    state.target.playVideo()
    state.target.seekTo(vars.value.start, true)
  }
}

const requestPiP = () => {
  const iframe = youtube.value.player.i
  console.log(youtube.value)
}

const deleteTimestamp = async (video: any, index: any) => {
  try {
    loading.value = true
    timeStampsPerVideo.value[video].timestamps.splice(index, 1)
  }
  catch (error) {
    message.error(`An error occurred ${error}`)
    console.error(`An error occurred ${error}`)
  }
  finally {
    loading.value = false
  }
}

const currentVideo: Ref<number | null> = ref(null)
const currentTimestamp: Ref<number | null> = ref(null)

const selectedTitle: Ref<string | null> = ref('')
const videoIdByTitle = computed(() => timeStampsPerVideo.value.indexOf(timeStampsPerVideo.value.find((ts: any) => ts.title.toLowerCase() === selectedTitle.value?.toLowerCase())))

const selectVideo = (title: string) => {
  selectedTitle.value = title
  const index = videoIdByTitle.value
  selectedTitle.value = currentVideo.value === index ? null : title
  currentVideo.value = currentVideo.value === index ? null : index
}

const synchronize = async () => {
  try {
    loading.value = true
    await Promise.all(timeStampsPerVideo.value.map((timestamp: any) => updateTimestamp(timestamp.id, timestamp)))
  }
  catch (error) {
    message.error(`An error occurred ${error}`)
    console.error(`An error occurred ${error}`)
  }
  finally {
    loading.value = false
  }
}

const timestamps = useLoadTimestamps()

watch(() => timestamps.value, (ts) => {
  timeStampsPerVideo.value = ts
}, { immediate: true, deep: true })

onBeforeMount(async () => {
  try {
    loading.value = true
    const timestamps = await getTimestamps()
    timeStampsPerVideo.value = timestamps.docs.map(timestamp => ({ id: timestamp.id, ...timestamp.data() }))
  }
  catch (error) {
    message.error(`An error occurred ${error}`)
    console.error(`An error occurred ${error}`)
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div :class="{ 'pointer-events-none opacity-70': loading }" class="duration-200 transition-all">
    <button class="icon-btn mb-4 !outline-none text-xl bg-transparent" :title="t('button.toggle_dark')" @click="toggleDark()">
      <div i="carbon-sun dark:carbon-moon" />
    </button>
    <n-button class="w-full mb-2" type="error" @click="synchronize">
      Synchronize
    </n-button>
    <div class="flex items-center justify-center min-w-[320px] min-h-[180px] bg-black">
      <YouTube
        v-if="showFrame"
        ref="youtube"
        :src="src"
        :vars="vars"
        @state-change="StateChange"
      />
    </div>
    <n-button @click="requestPiP">
      Request PiP
    </n-button>
    <div class="dark:bg-dark-700 bg-light-500 px-4 py-2 rounded-lg mt-4">
      <p class="font-bold text-center w-full text-lg mb-1">
        Add a new video
      </p>
      <div class="flex items-center flex-col mb-2">
        <n-input v-model:value="newVideoId" type="text" placeholder="Youtube video's ID" />
        <n-button class="w-full mt-2" type="info" @click="submitVideo">
          Submit
        </n-button>
      </div>
    </div>

    <div class="dark:bg-dark-700 bg-light-500 px-4 py-2 rounded-lg mt-6">
      <n-input v-model:value="searchInput" mt-2 placeholder="Search value" />
      <n-button
        class="w-full mt-2"
        type="primary"
        :disabled="currentVideo === null"
        @click="timeStampsPerVideo[currentVideo || 0].timestamps.push(
          {
            id: `${timeStampsPerVideo[currentVideo || 0].id}-${(currentVideo || 0)}-${timeStampsPerVideo[currentVideo || 0].timestamps.length}`,
            name: '',
            end: null,
            start: null,
            autoplay: 1,
          },
        )"
      >
        Add
      </n-button>
      <div v-for="(video) in filteredTimestamps" :key="video.id" class="flex items-center mt-2">
        <p class="w-full text-left font-bold whitespace-nowrap max-w-50 mr-4 overflow-hidden">
          {{ video.title }}
        </p>
        <n-button strong secondary :type="selectedTitle === video.title ? 'error' : 'primary'" class="mb-2 ml-auto" @click="selectVideo(video.title)">
          {{ selectedTitle === video.title ? 'Selected' : 'Select' }}
        </n-button>
      </div>
    </div>

    <div v-if="currentVideo != null" class="mt-6 dark:bg-dark-700 bg-light-500 px-2 py-2 rounded-lg flex flex-col gap-2">
      <n-button type="primary" class="w-full" @click="start({ video: timeStampsPerVideo[currentVideo || 0], timestamp: { end: null, start: null, autoplay: 1, loop: 1 } })">
        Start
      </n-button>

      <div v-for="(timestamp, key) in timeStampsPerVideo[currentVideo].timestamps" :key="key" class="dark:bg-dark-300 bg-light-800 py-2 px-4 rounded-md">
        <div class="flex items-center">
          <p class="text-lg flex-1" @click="currentTimestamp = currentTimestamp === timestamp.id ? null : timestamp.id">
            <span class="font-bold">{{ timestamp.name !== '' ? timestamp.name : '---' }}</span>
          </p>
          <n-button
            v-show="currentTimestamp !== timestamp.id"
            type="primary"
            class="w-[fit-content]"
            :disabled="timestamp.start === null || timestamp.end === null"
            @click="start({ video: timeStampsPerVideo[currentVideo || 0], timestamp })"
          >
            Start
          </n-button>
          <n-button
            strong
            secondary
            class="px-2 ml-2"
            type="error"
            @click="deleteTimestamp(currentVideo, key)"
          >
            <template #icon>
              <n-icon>
                <Trash />
              </n-icon>
            </template>
          </n-button>
        </div>
        <div v-if="currentTimestamp === timestamp.id">
          <div class="flex w-full flex-col items-start justify-start mb-2">
            <p class="font-bold" style="font-weight: 800;">
              Name
            </p>
            <n-input v-model:value="timestamp.name" class="w-[fit-content]" type="text" />
          </div>
          <div class="flex w-full flex-col items-start justify-start mb-2">
            <p class="font-bold" style="font-weight: 800;">
              Start in seconds
            </p>
            <n-input-number v-model:value="timestamp.start" class="w-full" type="text" />
          </div>
          <div class="flex w-full flex-col items-start justify-start">
            <p class="font-bold" style="font-weight: 800;">
              End in seconds
            </p>
            <n-input-number v-model:value="timestamp.end" class="w-full" type="text" />
          </div>
          <n-button
            type="primary"
            class="w-full mt-2 mb-1"
            :disabled="timestamp.start === null || timestamp.end === null"
            @click="start({ video: timeStampsPerVideo[currentVideo || 0], timestamp })"
          >
            Start
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
