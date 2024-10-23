<script setup lang='ts'>
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { NScrollbar, useMessage } from 'naive-ui'
import { PersonAddOutline } from '@vicons/ionicons5'
import { useRoute, useRouter } from 'vue-router'
import { fetchQueryMenuAPI } from '@/api/config'


import { useAppStore, useAuthStore, useGlobalStoreWithOut } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const appStore = useAppStore()
const authStore = useAuthStore()
const useGlobalStore = useGlobalStoreWithOut()
const message = useMessage()
const track = ref(null)
appStore.setEnv()

const avatar = computed(() => authStore.userInfo.avatar)
const route = useRoute()
const router = useRouter()
const show = ref(false)
const isLogin = computed(() => authStore.isLogin)
const darkMode = computed(() => appStore.theme === 'dark')
const env = computed(() => appStore.env)
const logInIcon = shallowRef(PersonAddOutline)

const menuList = ref<MenuItem[]>([])

async function queryMenu() {
  const res: any = await fetchQueryMenuAPI({ menuPlatform: 1 })
  if (!res.success)
    return
  menuList.value = res.data
  nextTick(() => {
    calcExceededTotalWidth()
  })
}

interface MenuItem {
  menuName: string
  menuPath: string
  menuIcon: string
  menuTipText: string
  menuIframeUrl: string
  isJump: boolean
  isNeedAuth: boolean
  menuActiveIcon: string
  useIconType: number
  imgIcon?: string
  activeImgIcon?: string
}
const isNeedScroll = ref(false)

onMounted(() => {
  // queryMenu()
})

const signInStatus = computed(() => Number(authStore.globalConfig?.signInStatus) === 1)

function toggleLogin() {
  if (isLogin.value)
    authStore.logOut()

  else
    authStore.setLoginDialog(true)
}

function checkMode() {
  const mode = darkMode.value ? 'light' : 'dark'
  appStore.setTheme(mode)
}

function setting() {
  if (!isLogin.value)
    authStore.setLoginDialog(true)

  else
    show.value = true
}
const { isMobile } = useBasicLayout()

const activeRoutePath = computed(() => {
  return route.path
})

function toPath(name: string) {
  router.push({ name })
}

const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return {
      paddingBottom: 'env(safe-area-inset-bottom)',
    }
  }
  return {}
})

const getMobileLayoutClass = computed(() => {
  if (isMobile.value)
    return ['flex-rol', 'w-full', 'border-0']
  return ['flex-col', 'w-sider']
})

const getIconMobileLayoutClass = computed(() => {
  if (isMobile.value)
    return ['flex', 'flex-rol', 'items-center', 'pt-0', 'w-full']
  return ['flex', 'flex-col', 'pt-1', 'items-center']
})

const iframeSrc = computed(() => useGlobalStore.iframeUrl)

function handleClickMenu(menu: MenuItem) {
  const { menuPath, menuName, isJump, menuIframeUrl, isNeedAuth } = menu
  if (isNeedAuth && !isLogin.value) {
    message.warning('请先登录后访问！')
    authStore.setLoginDialog(true)
    return
  }
  useGlobalStore.updateIframeUrl('')

  if (menuPath) {
    return router.push({ path: menuPath })
  }
  else {
    if (isJump) {
      window.open(menuIframeUrl)
    }
    else {
      useGlobalStore.updateIframeUrl(menuIframeUrl)
      router.push({ path: '/extend' })
    }
  }
}

function calcExceededTotalWidth() {
  if (!track.value)
    return
  const { clientHeight = 0, scrollHeight = 0 } = track.value
  isNeedScroll.value = scrollHeight > clientHeight
}

watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val)
    appStore.setSiderDrawCollapsed(val)
  },
  {
    immediate: true,
    flush: 'post',
  },
)
</script>

<template>
  <div class="flex min-w-[81px] ml-[15px] shadow box-border rounded-md bg-white  dark:bg-[#2D2D2D] " :class="getMobileLayoutClass" :style="mobileSafeArea">
    <main ref="track" class="flex-1  flex-grow-1 mb-5 overflow-auto " :class="[getIconMobileLayoutClass]">
      <NScrollbar :size="1">
      </NScrollbar>
    </main>
  </div>
</template>

<style lang="less">
.btns{
  //box-shadow: 0 1px 6px #8068f7;
}

.sidebar{
	overflow: hidden;
	width: calc(100% - 5px);
}
.sidebar:hover{
	width: 100%;
	overflow: overlay;
}

.overlay{
	overflow: hidden;
}
.overlay:hover{
	width: 100%;
	overflow: overlay;
}

.active_bar{
	border-width: 1.5px;
}
</style>
