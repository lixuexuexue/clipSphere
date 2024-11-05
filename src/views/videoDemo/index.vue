<script lang="ts" setup>
import { onBeforeMount, onMounted, ref } from 'vue'
import type { UploadFileInfo } from 'naive-ui'
import { MP4Clip, VisibleSprite } from '@webav/av-cliper'
import { AVCanvas } from '@webav/av-canvas'

const videoList: any = ref([])

const avCanvasRef = ref<HTMLElement | null>(null)
let avCanvas: AVCanvas | null = null

const tlData = ref([
  { id: '1-video', actions: [] },
  { id: '2-audio', actions: [] },
  { id: '3-img', actions: [] },
  { id: '4-text', actions: [] },
])

const arrayBufferToStream = (buffer: ArrayBuffer) => {
  // 将ArrayBuffer转换为Uint8Array
  const uint8Array = new Uint8Array(buffer)
  // 创建一个新的ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      // 将Uint8Array的内容分块发送到ReadableStream
      controller.enqueue(uint8Array)
      controller.close()
    },
  })
  return stream
}

const addSprite2Track = (trackId: string, sprite: VisibleSprite, name = '') => {
  const track = tlData.value.find(item => item.id === trackId)
  if (track) {
    const start
      = sprite.time.offset === 0
        ? Math.max(...track.actions.map(item => item.end), 0)
        : sprite.time.offset
    sprite.time.offset = start

    // if (sprite.time.duration === Infinity) {
    //   sprite.time.duration = 10e6;
    // }

    const action = {
      id: Math.random().toString(),
      start: start / 1e6,
      end: (start + sprite.time.duration) / 1e6,
      effectId: '',
      name,
    }

    track.actions.push(action)
    tlData.value = tlData.value
      .filter(item => item !== track)
      .concat(track)
      .sort((a, b) => a.id.charCodeAt(0) - b.id.charCodeAt(0))

    return action
  }
}

const preDuration = ref<number>(0)

const spriteList = ref<Array<VisibleSprite>>([])

const handleChange = async (options: {
  file: UploadFileInfo
  fileList: Array<UploadFileInfo>
  event?: Event
}): Promise<void> => {
  const { file, fileList } = options

  const reader = new FileReader()

  reader.onload = async (e) => {
    try {
      const arrayBuffer = e.target?.result as ArrayBuffer
      if (arrayBuffer) {
        // 创建一个新的 MP4Clip 实例，利用数组缓冲区转换为可流式读取
        const clip = new MP4Clip(arrayBufferToStream(arrayBuffer))
        // 创建一个可见精灵实例，使用刚才创建的 MP4Clip
        const sprite = new VisibleSprite(clip)
        // 设置精灵的开始时间
        sprite.time.offset = preDuration.value
        spriteList.value.push(sprite)
        // 将精灵添加到可视化画布中
        await avCanvas?.addSprite(sprite)
        // 记录精灵的持续时间, 拼接视频
        preDuration.value += sprite.time.duration
        // addSprite2Track('1-video', sprite, 'video')
      }
      else {
        console.error('读取文件失败: ArrayBuffer 为 null')
      }
    }
    catch (error) {
      console.error('处理视频文件时发生错误:', error)
    }
  }

  reader.readAsArrayBuffer(file.file)

  videoList.value = fileList.map((item: UploadFileInfo) => ({
    name: item.name,
    file: item.file,
    url: item.file ? URL.createObjectURL(item.file) : '',
  }))
}

const playing = ref<boolean>(false)
const setPlaying = (isPlaying: boolean) => {
  playing.value = isPlaying
}

const initAvCanvas = () => {
  if (avCanvasRef.value === null)
    return
  avCanvas?.destroy()
  const cvs = new AVCanvas(avCanvasRef.value, {
    bgColor: '#000000',
    width: 1920,
    height: 1080,
  })

  avCanvas = cvs

  cvs.on('playing', () => {
    setPlaying(true)
  })
  cvs.on('paused', () => {
    setPlaying(false)
  })
}

const startTime = ref<number>(0)
let startOffsetTime = 0

const generateVideo = () => {
  if (playing.value) {
    avCanvas?.pause()
    startOffsetTime = new Date().getTime() - startTime.value + startOffsetTime
  }
  else {
    startTime.value = new Date().getTime()
    avCanvas?.play({ start: startOffsetTime * 1e3 })
  }

  // console.log(spriteList.value)
}

onMounted(() => {
  initAvCanvas()
})

onBeforeMount(() => {
  avCanvas?.destroy()
})
</script>

<template>
  <div class="flex h-full">
    <div class="w-1/3 flex flex-col">
      <n-upload
        class="m-4"
        action=""
        :default-upload="false"
        :headers="{}"
        :data="{}"
        :show-file-list="false"
        :on-change="handleChange"
        accept=".mp4"
      >
        <n-button>上传文件</n-button>
      </n-upload>

      <div class="overflow-x-auto flex-1">
        <div
          v-for="item in videoList"
          :key="item.id"
          class="m-4 flex flex-col items-center"
        >
          <div class="text-center mb-2">
            {{ item.name }}
          </div>
          <video
            class="w-52"
            :src="item.url"
            :muted="false"
            controls
            controlslist="nodownload noplaybackrate"
            disablePictureInPicture
          />
        </div>
      </div>

      <div class="m-4 flex">
        <n-button class="flex-1" type="primary" @click="generateVideo">
          合成视频
        </n-button>
      </div>
    </div>

    <div class="flex-1">
      <div class="h-2/3 m-4">
        <div ref="avCanvasRef" />
      </div>
      <div class="h-1/3">
        bottom
      </div>
    </div>
  </div>
</template>
