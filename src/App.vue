<script setup lang="ts">
import { NConfigProvider, NGlobalStyle, dateZhCN } from 'naive-ui'
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ClientJS } from 'clientjs'
import { ss } from './utils/storage'
import { NaiveProvider } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import { useAppStore, useAuthStore, useGlobalStoreWithOut } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const client = new ClientJS()
const fingerprint = client.getFingerprint()
const authStore = useAuthStore()
const useGlobalStore = useGlobalStoreWithOut()
const router = useRouter()
useGlobalStore.updateFingerprint(fingerprint)
const { theme, lightThemeOverrides, darkThemeOverrides } = useTheme()
const { language } = useLanguage()
const appStore = useAppStore()
const { isMobile } = useBasicLayout()
const homePath = computed(() => authStore.globalConfig?.clientHomePath)
const faviconPath = computed(() => authStore.globalConfig?.clientFavoIconPath || '')
const isAutoOpenNotice = computed(() => Number(authStore.globalConfig?.isAutoOpenNotice) === 1)
const clientAtmosphere = computed(() => authStore.globalConfig?.clientAtmosphere || '')

async function loadBaiduCode() {
  const baiduCode: any = authStore.globalConfig?.baiduCode || ''
  if (!baiduCode)
    return
  const scriptElem = document.createElement('script')
  const escapedCode = baiduCode.replace(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi, '$1')
  scriptElem.innerHTML = escapedCode
  document.head.appendChild(scriptElem)
}

function setDocumentTitle() {
  document.title = ''
}

const themeOverrides = computed(() => {
  const config = !theme.value ? lightThemeOverrides : darkThemeOverrides
  return config
})

function goHome() {
  homePath.value && router.push(homePath.value)
}

function noticeInit() {
  const showNotice = ss.get('showNotice')
  if (!showNotice && isAutoOpenNotice.value) {
    useGlobalStore.updateNoticeDialog(true)
  }
  else {
    if (Date.now() > Number(showNotice) && isAutoOpenNotice.value)
      useGlobalStore.updateNoticeDialog(true)
  }
}

/* 动态设置网站ico svg格式 */
const link = document.createElement('link')
link.rel = 'shortcut icon'
link.href = faviconPath.value
link.type = 'image/svg+xml'
document.getElementsByTagName('head')[0].appendChild(link)
window.YunZhiAi = {
  log() {},
}

const dynamicLoadScript = (name) => {
  try {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `/js/${name}.js`
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  catch (error) {}
}

watch(() => clientAtmosphere.value, (val) => {
  if (!val)
    return
  dynamicLoadScript(val)
}, { immediate: true })

onMounted(async () => {
  // appStore.setTheme('dark')
  goHome()
  loadBaiduCode()
  setDocumentTitle()
  noticeInit()
})
</script>

<template>
  <NConfigProvider
    class="h-full" :class=" [isMobile ? 'mobile' : ''] "
    :theme="theme"
    :theme-overrides="themeOverrides"
    :locale="language"
    :date-locale="dateZhCN"
    preflight-style-disabled
  >
    <NaiveProvider>
      <RouterView />
    </NaiveProvider>
    <NGlobalStyle />
  </NConfigProvider>
</template>

<style>
/* 去掉自动填充的颜色 */
input:-webkit-autofill {
	background: transparent;
	-webkit-box-shadow: 0 0 0 1000px transparent inset;
}
</style>
