<script setup lang="ts">
import { NButton, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import axios from 'axios'
import { SvgIcon } from '@/components/common'

import { useAuthStore } from '@/store'

interface Props {
  uploadLimit?: string[]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

interface Emits {
  (ev: 'uploadSuccess', val: string): void
}

const useStore = useAuthStore()
const ms = useMessage()
const token = computed(() => useStore.getToken)
const uploadUrl = ref(`${import.meta.env.VITE_GLOB_API_URL}/upload/file`)
const fileInputRef = ref(null)
const accept = computed(() => {
  const arr = props.uploadLimit || ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
  return arr.join(',')
})

function handleBeforeUpload(file) {
  return new Promise((resolve) => {
    const { size, type } = file
    if (!file)
      ms.error('未获取到文件信息！')
    const allowedTypes = props.uploadLimit || ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(type) && !props.uploadLimit?.includes('*')) {
      ms.error('只能上传指定格式的文件！')
      return
    }
    /* 如果图片大于300k 提示太大 */
    if (size > 1024 * 1024 * 10) {
      ms.error('图片大小不能超过10M')
      return resolve(false)
    }
    resolve(true)
  })
}

async function handleFileChange() {
  try {
    const file = fileInputRef.value.files[0]
    const check = await handleBeforeUpload(file)
    if (!check)
      return
    const form = new FormData()
    form.append('file', file)
    const res = await axios.post(uploadUrl.value, form, { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token.value}` } })
    const url = res?.data?.data
    emit('uploadSuccess', url)
  }
  catch (error) {
    ms.error('上传资源失败！')
  }
}

function openSelectFileDialog(event) {
  event.stopPropagation()
  fileInputRef.value.click()
}
</script>

<template>
  <span class="relative" @click="openSelectFileDialog">
    <span>
      <slot>
        <NButton size="small" strong secondary>
          <SvgIcon icon="prime:upload" class="text-[18px]" />
        </NButton>
      </slot>
      <input id="fileInputRef" ref="fileInputRef" :accept="accept" type="file" style="display: none" @click.stop @change="handleFileChange">
    </span>
  </span>
</template>

<style scoped>

</style>
