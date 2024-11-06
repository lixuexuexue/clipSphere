<script lang="ts" setup>
import { onBeforeMount, onMounted, ref } from 'vue'
import type { UploadFileInfo } from 'naive-ui'
import type { IClip } from '@webav/av-cliper'
import {
  AudioClip,
  EmbedSubtitlesClip,
  ImgClip,
  MP4Clip,
  VisibleSprite,
  renderTxt2ImgBitmap,
} from '@webav/av-cliper'
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

const spriteList: VisibleSprite[] = []

const handleFileRead = async (file: File, type: string) => {
  const reader = new FileReader()

  reader.onload = async (e) => {
    try {
      const result: any = e.target?.result
      if (result) {
        // 创建一个新的 MP4Clip 实例，利用数组缓冲区转换为可流式读取
        let clip: MP4Clip | AudioClip | ImgClip | IClip | EmbedSubtitlesClip
        if (type === 'video') {
          clip = new MP4Clip(arrayBufferToStream(result))
        }
        else if (type === 'audio') {
          clip = new AudioClip(arrayBufferToStream(result))
        }
        else if (type === 'img') {
          clip = new ImgClip(arrayBufferToStream(result))
        }
        else if (type === 'srt') {
          clip = new EmbedSubtitlesClip(result, {
            videoWidth: 1280,
            videoHeight: 720,
            fontSize: 44,
            fontFamily: 'Noto Sans SC',
            strokeStyle: '#000',
            lineWidth: 20,
            lineJoin: 'round',
            lineCap: 'round',
            textShadow: {
              offsetX: 2,
              offsetY: 2,
              blur: 4,
              color: 'rgba(0,0,0,0.25)',
            },
          })
        }

        // 创建一个可见精灵实例，使用刚才创建的 MP4Clip
        const sprite = new VisibleSprite(clip)
        if (type === 'video') {
          // 设置精灵的开始时间
          sprite.time.offset = preDuration.value
          spriteList.push(sprite)
        }

        // 将精灵添加到可视化画布中
        await avCanvas?.addSprite(sprite)
        if (type === 'video') {
          // 记录精灵的持续时间, 拼接视频
          preDuration.value += sprite.time.duration
        }

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

  if (type === 'srt')
    reader.readAsText(file)
  else reader.readAsArrayBuffer(file)
}

const handleVideoChange = async (options: {
  file: UploadFileInfo
  fileList: Array<UploadFileInfo>
  event?: Event
}): Promise<void> => {
  const { file, fileList } = options

  await handleFileRead(file.file, 'video')

  videoList.value = fileList.map((item: UploadFileInfo) => ({
    name: item.name,
    file: item.file,
    url: item.file ? URL.createObjectURL(item.file) : '',
  }))
}

const handleAudioChange = async (options: {
  file: UploadFileInfo
  fileList: Array<UploadFileInfo>
  event?: Event
}): Promise<void> => {
  const { file, fileList } = options

  handleFileRead(file.file, 'audio')
}

const handleImgChange = async (options: {
  file: UploadFileInfo
  fileList: Array<UploadFileInfo>
  event?: Event
}): Promise<void> => {
  const { file, fileList } = options

  handleFileRead(file.file, 'img')
}

const handleAddText = async () => {
  const sprite = new VisibleSprite(
    new ImgClip(
      await renderTxt2ImgBitmap('混剪', 'font-size: 80px; color: red;'),
    ),
  )
  await avCanvas?.addSprite(sprite)
}

const handleSrtChange = async (options: {
  file: UploadFileInfo
  fileList: Array<UploadFileInfo>
  event?: Event
}): Promise<void> => {
  const { file, fileList } = options

  handleFileRead(file.file, 'srt')
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

const test = ref([0, 10])
</script>

<template>
  <div class="flex h-full">
    <div class="w-1/3 flex flex-col">
      <div class="m-4 flex">
        <n-upload
          action=""
          :default-upload="false"
          :headers="{}"
          :data="{}"
          :show-file-list="false"
          :on-change="handleVideoChange"
          accept=".mp4,.mov'"
        >
          <n-button>上传视频</n-button>
        </n-upload>

        <n-upload
          action=""
          :default-upload="false"
          :headers="{}"
          :data="{}"
          :show-file-list="false"
          :on-change="handleAudioChange"
          accept=".m4a,.mp3"
        >
          <n-button>上传音频</n-button>
        </n-upload>

        <n-upload
          action=""
          :default-upload="false"
          :headers="{}"
          :data="{}"
          :show-file-list="false"
          :on-change="handleImgChange"
          accept=".png,.jpg,.jpeg,.gif"
        >
          <n-button>上传图片</n-button>
        </n-upload>

        <n-upload
          action=""
          :default-upload="false"
          :headers="{}"
          :data="{}"
          :show-file-list="false"
          :on-change="handleSrtChange"
          accept=".srt"
        >
          <n-button>上传字幕</n-button>
        </n-upload>

        <n-button @click="handleAddText">
          添加文字
        </n-button>
      </div>

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
      <div ref="canvasWrapper" class="h-2/3 m-4">
        <div ref="avCanvasRef" />
      </div>
      <div class="h-1/3">
        bottom
      </div>
    </div>
  </div>
</template>
