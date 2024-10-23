<script setup lang='ts'>
import { NButton, NModal, NScrollbar, NSkeleton } from 'naive-ui'
import { computed, ref } from 'vue'
import { marked } from 'marked'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useAuthStore, useGlobalStoreWithOut } from '@/store'
import { fetchGetGlobalNoticeAPI } from '@/api/global'
import noticeImg from '@/assets/notice.png'
import type { ResData } from '@/api/types'
import { ss } from '@/utils/storage'
import { SvgIcon } from '@/components/common'

defineProps<Props>()

const authStore = useAuthStore()

const logoPath = computed(() => authStore.globalConfig.clientLogoPath)

interface Props {
  visible: boolean
}

interface Notice {
  noticeInfo: string
  noticeTitle: string
}

const notice = ref<Notice>({
  noticeInfo: '',
  noticeTitle: '',
})
const { isMobile } = useBasicLayout()
const appStore = useAppStore()
const useGlobalStore = useGlobalStoreWithOut()
const loading = ref(true)
const darkMode = computed(() => appStore.theme === 'dark')
const theme = computed(() => appStore.theme)

const html = computed(() => {
  if (!notice.value.noticeInfo)
    return ''
  return marked(notice.value.noticeInfo)
})

function handleCloseDialog() {
  loading.value = true
}

function handleClose() {
  useGlobalStore.updateNoticeDialog(false)
}

async function queryNotice() {
  const res: ResData = await fetchGetGlobalNoticeAPI()
  const { success, data } = res
  if (success)
    notice.value = data
}

async function openDrawerAfter() {
  await queryNotice()
  loading.value = false
}

function handleReminder() {
  useGlobalStore.updateNoticeDialog(false)
  ss.set('showNotice', Date.now() + 24 * 60 * 60 * 1000)
}
</script>

<template>
  <NModal
    :show="visible" class="noticeDialog h-full w-11/12 md:w-3/5" :on-after-enter="openDrawerAfter" :on-after-leave="handleCloseDialog" :style="{
      backgroundColor: appStore.theme === 'dark' ? '#181c22' : '#fff',
    }"
  >
    <div class="px-[15px] rounded-[13px] relative">
      <div class="h-[100px] flex justify-between items-center" :class="isMobile ? '' : 'px-[30px]'">
        <div class="flex items-center">
          <span>
            <img :src="logoPath" class="w-[40px]">
          </span>
          <!-- <span class="text-[24px] ml-3 mr-5 font-medium"> {{ authStore.globalConfig?.siteName }}</span> -->
          <span v-if="notice.noticeTitle && !loading" class="text-[24px] text-primary  ml-5 font-medium italic">{{ notice?.noticeTitle }}</span>
          <NSkeleton v-if="loading && !notice?.noticeTitle" class="ml-5" height="40px" width="150px" />
        </div>
        <span v-if="!isMobile">
          <img :src="noticeImg" class="w-[90px]">
        </span>
        <span class="absolute right-[12px] top-[12px] rounded-sm hover:bg-[#e8e8e8] transition-all cursor-pointer p-[2px]">
          <SvgIcon icon="ic:twotone-close" class="text-[20px]" @click="handleClose" />
        </span>
      </div>
      <!-- <div v-if="loading">
        <NSkeleton text width="30%" />
      </div> -->
      <!-- <template v-else>
        <div class="flex">
          <SvgIcon icon="prime:bell" class="text-2xl mr-2" /> <span class="text-xl">{{ notice.noticeTitle }}</span>
        </div>
      </template> -->
      <div v-if="loading && !html" class="px-[20px]">
        <NSkeleton text :repeat="15" />
      </div>
      <div :class="[isMobile ? 'p-[0px]  max-h-[calc(100vh-200px)]' : 'p-[0px]', darkMode ? 'text-[#fff]' : 'text-[#000]']">
        <NScrollbar>
          <div :class="[isMobile ? 'p-[0px]  max-h-[calc(100vh-200px)]' : 'p-[0px]  max-h-[55vh]', darkMode ? 'text-[#fff]' : 'text-[#000]']" class=" markdown-body markdown-body-generate pb-5" v-html="html" />
        </NScrollbar>
      </div>
      <div class="flex w-full pb-2 pt-5 px-5 items-end  justify-end ">
        <!-- <span class="text-[12px] cursor-pointer text-gray-400" @click="handleReminder">
          今日不再提示
        </span> -->

        <NButton type="primary" ghost size="small" class="!ml-[15px]" @click="handleClose">
          我已知晓
        </NButton>
        <NButton type="primary" strong size="small" class="!ml-[15px]" @click="handleReminder">
          今日不再提示
        </NButton>
      </div>
    </div>
  </NModal>
</template>

<style scoped>
:deep(.n-card__content){
	padding: 0 !important;
}
:deep(.markdown-body) {
 background: none;
}
</style>
