<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { SvgIcon } from '@/components/common'

import { useAuthStore } from '@/store'

interface Props {
  modelValue: any
  size?: number
}

interface Emits {
  (ev: 'update:modelValue', val: string): void
  (ev: 'selectSuccess', val: string): void
  (ev: 'deleteBase'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const useStore = useAuthStore()
const ms = useMessage()
const token = computed(() => useStore.getToken)
const uploadUrl = ref(`${import.meta.env.VITE_GLOB_API_URL}/upload/local`)
const fileInputRef = ref(null)
const accept = computed(() => {
  const arr = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
  return arr.join(',')
})

function handleBeforeUpload(file) {
  return new Promise((resolve) => {
    const { size, type } = file
    if (!file)
      ms.error('未获取到文件信息！')
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']
    if (!allowedTypes.includes(type) && !props.uploadLimit?.includes('*')) {
      ms.error('只能上传指定格式的文件！')
      return
    }
    if (size > 1024 * 1024 * 5) {
      ms.error('图片大小不能超过5M')
      return resolve(false)
    }
    resolve(true)
  })
}

function removeBase64Prefix(base64String) {
  // 使用正则表达式匹配并移除"data:image/png;base64,"前缀
  return base64String.replace(/^data:image\/[a-z]+;base64,/, '')
}

async function handleFileChange() {
  try {
    const file = fileInputRef.value.files[0]
    const check = await handleBeforeUpload(file)
    if (!check)
      return
    // 转换图片为Base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target.result.toString()
      emit('update:modelValue', base64)
      emit('selectSuccess', base64)
    }
    reader.readAsDataURL(file)

    // const form = new FormData()
    // form.append('file', file)
    // const res = await axios.post(uploadUrl.value, form, { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token.value}` } })
    // const url = res?.data?.data
    // emit('uploadSuccess', url)
  }
  catch (error) {
    ms.error('上传资源失败！')
  }
}

function deleteImg() {
  emit('update:modelValue', '')
  emit('deleteBase')
}

function openSelectFileDialog(event) {
  event.stopPropagation()
  fileInputRef.value.click()
}
</script>

<template>
  <span
    :class="[modelValue ? 'border-none' : 'border-dashed']"
    :style="{
      width: `${size || 100}px`,
      height: `${size || 100}px`,
    }"
    class="upload relative inline-block border  dark:border-[#31353b] rounded  overflow-hidden hover:border-primary dark:hover:border-primary hover:text-primary"
  >
    <span>
      <input
        id="fileInputRef" ref="fileInputRef" :accept="accept" type="file" style="display: none" @click.stop
        @change="handleFileChange"
      >
    </span>
    <div v-if="modelValue" class="absolute left-0 top-0 w-full h-full rounded">
      <img :src="modelValue" alt="" class="w-full h-full object-cover rounded">
    </div>
    <div class="mask absolute left-0 top-0 w-full h-full flex justify-center items-center rounded">
      <div class="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 rounded">
        <SvgIcon icon="ep:delete" class="uploadIcon text-[16px] text-white cursor-pointer" @click="deleteImg" />
      </div>
    </div>
    <div
      v-if="!modelValue"
      class=" absolute left-0 top-0 w-full h-full bg-[#fafafc] dark:bg-[#272a30] flex justify-center items-center cursor-pointer"
      @click="openSelectFileDialog"
    >
      <slot>
        <SvgIcon icon="prime:upload" class="uploadIcon text-[18px] text-gray-300 " />
      </slot>
    </div>
  </span>
</template>

<style lang="scss" scoped>
.mask {
	opacity: 0;
}

.upload {
	transition: all 0.3s;

	&:hover {
		.uploadIcon {
			// @apply text-primary;
		}

		.mask {
			opacity: 1;
		}
	}
}
</style>
