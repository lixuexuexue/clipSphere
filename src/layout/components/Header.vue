<script setup lang="ts">
import { NAvatar, NButton, NDropdown, useMessage } from 'naive-ui'
import { computed, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { SvgIcon } from '@/components/common'
import defaultAvatar from '@/assets/defaultAvatar.png'
import { useAppStore, useAuthStore, useGlobalStoreWithOut } from '@/store'

const appStore = useAppStore()
const authStore = useAuthStore()
const router = useRouter()
const avatar = computed(() => authStore.userInfo.avatar || defaultAvatar)
const username = computed(() => authStore.userInfo.username)
const isLogin = computed(() => authStore.isLogin)
const useGlobalStore = useGlobalStoreWithOut()
const darkMode = computed(() => appStore.theme === 'dark')
const ms = useMessage()
const { isMobile } = useBasicLayout()
const vipStatus = computed(() => Number(authStore.globalConfig?.vipStatus) === 1)
const globaelConfig = computed(() => authStore.globalConfig)
const iscustomLinkUrl = computed(() => globaelConfig.value?.customLinkUrl)

const options = computed(() => {
  if (isLogin.value) {
    return [
      {
        label: '个人中心',
        key: 'user',
        icon: renderIcon('ep:avatar'),
      },
      {
        label: '退出登录',
        key: 'logout',
        icon: renderIcon('humbleicons:power'),
      },
    ]
  }
  else {
    return []
  }
})

function renderIcon(icon: String) {
  return () => h(SvgIcon, { icon, class: 'text-base mt-[-2px]' })
}

function toPath() {
  if (!isLogin.value)
    authStore.setLoginDialog(true)
}

function handleSignIn() {
  if (!isLogin.value) {
    authStore.setLoginDialog(true)
    return
  }
  useGlobalStore.updateSignInDialog(true)
}

function checkMode() {
  const mode = darkMode.value ? 'light' : 'dark'
  appStore.setTheme(mode)
  // if (mode === 'dark')
  // ms.warning('暗黑主题暂不开放~')
}

function logOut() {
  authStore.logOut()
  router.push('/')
}

function dropdownClick(key: string) {
  if (key === 'user')
    router.push({ name: 'UserCenter' })
  else
    logOut()
}

// Icon
defineComponent({
  name: 'Fa6RegularCircleUp',
})

function openVip() {
  router.push('/pay')
}
</script>

<template>
  <div class="h-[48px] text-onBackground z-50 fixed tp-0 dark:bg-[#2D2D2D] bg-white   w-full flex justify-between items-center px-2 ">
    <div class="flex items-center">
<!--      <div class="mr-2 h-full ele-drag flex items-center ">
        <Logo />
      </div>-->
      <div class="ml-[15px] text-onBackground text-lg font-bold flex-1 whitespace-nowrap line-clamp-1  overflow-hidden">
        <b>{{  }}</b>
      </div>
    </div>

    <div class="flex items-center" :class="isMobile ? 'space-x-1' : 'space-x-3'">
      <!-- v-if="!isMobile && vipStatus" @click="useGlobalStore.updateGoodsDialog(true)" -->
      <span v-if="vipStatus" class="gradientMember" :class="isMobile ? 'text-[12px]' : 'text-[14px]'" @click="openVip">
        <img src="/member.png" class="w-[20px]">&nbsp;开通会员
      </span>
      <NButton v-if="isMobile && vipStatus" size="small" secondary strong @click="useGlobalStore.updateGoodsDialog(true)">
        <!-- <SvgIcon class="text-lg right-icon text-[#7869f5]" icon="ep:goods" /> -->
        <img src="/member.png" class="w-[18px]">
      </NButton>

      <!--      <NBadge value="新">
				<NButton size="small" secondary strong @click="useGlobalStore.updateNoticeDialog(true)">
						<SvgIcon class="text-lg right-icon" icon="fe:notice-active" />
				</NButton>
			</NBadge> -->

      <NButton v-if="!isMobile && iscustomLinkUrl" size="small" secondary strong>
        <a :href="globaelConfig?.customLinkUrl" target="_blank" rel="noopener"><SvgIcon class="text-lg right-icon" icon="bi:wechat" /></a>
      </NButton>

      <!--      <NButton v-if="signInStatus" size="small" secondary strong @click="handleSignIn">
        <SvgIcon class="text-lg cursor-pointer" icon="tabler:gift" />
      </NButton> -->

      <NButton size="small" secondary strong @click="checkMode">
        <SvgIcon class="text-lg cursor-pointer" :icon=" darkMode ? 'line-md:moon-rising-loop' : 'line-md:moon-filled-to-sunny-filled-loop-transition' " />
      </NButton>
      <NDropdown :options="options" :on-select="dropdownClick">
        <NAvatar :size="38" :src="avatar" round bordered :fallback-src="defaultAvatar" class="cursor-pointer" @click="toPath" />
      </NDropdown>
    </div>
  </div>
</template>

<style scoped>
.theme-switch {
  --toggle-size: 10px;
  /* the size is adjusted using font-size,
     this is not transform scale,
     so you can choose any size */
  --container-width: 5.625em;
  --container-height: 2.5em;
  --container-radius: 6.25em;
  /* radius 0 - minecraft mode :) */
  --container-light-bg: #3D7EAE;
  --container-night-bg: #1D1F2C;
  --circle-container-diameter: 3.375em;
  --sun-moon-diameter: 2.125em;
  --sun-bg: #ECCA2F;
  --moon-bg: #C4C9D1;
  --spot-color: #959DB1;
  --circle-container-offset: calc((var(--circle-container-diameter) - var(--container-height)) / 2 * -1);
  --stars-color: #fff;
  --clouds-color: #F3FDFF;
  --back-clouds-color: #AACADF;
  --transition: .5s cubic-bezier(0, -0.02, 0.4, 1.25);
  --circle-transition: .3s cubic-bezier(0, -0.02, 0.35, 1.17);
}

.theme-switch, .theme-switch *, .theme-switch *::before, .theme-switch *::after {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-size: var(--toggle-size);
}

.theme-switch__container {
  width: var(--container-width);
  height: var(--container-height);
  background-color: var(--container-light-bg);
  border-radius: var(--container-radius);
  overflow: hidden;
  cursor: pointer;
  -webkit-box-shadow: 0em -0.062em 0.062em rgba(0, 0, 0, 0.25), 0em 0.062em 0.125em rgba(255, 255, 255, 0.94);
  box-shadow: 0em -0.062em 0.062em rgba(0, 0, 0, 0.25), 0em 0.062em 0.125em rgba(255, 255, 255, 0.94);
  -webkit-transition: var(--transition);
  -o-transition: var(--transition);
  transition: var(--transition);
  position: relative;
}

.theme-switch__container::before {
  content: "";
  position: absolute;
  z-index: 1;
  inset: 0;
  -webkit-box-shadow: 0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset, 0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset;
  box-shadow: 0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset, 0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset;
  border-radius: var(--container-radius)
}

.theme-switch__checkbox {
  display: none;
}

.theme-switch__circle-container {
  width: var(--circle-container-diameter);
  height: var(--circle-container-diameter);
  background-color: rgba(255, 255, 255, 0.1);
  position: absolute;
  left: var(--circle-container-offset);
  top: var(--circle-container-offset);
  border-radius: var(--container-radius);
  -webkit-box-shadow: inset 0 0 0 3.375em rgba(255, 255, 255, 0.1), inset 0 0 0 3.375em rgba(255, 255, 255, 0.1), 0 0 0 0.625em rgba(255, 255, 255, 0.1), 0 0 0 1.25em rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 0 3.375em rgba(255, 255, 255, 0.1), inset 0 0 0 3.375em rgba(255, 255, 255, 0.1), 0 0 0 0.625em rgba(255, 255, 255, 0.1), 0 0 0 1.25em rgba(255, 255, 255, 0.1);
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-transition: var(--circle-transition);
  -o-transition: var(--circle-transition);
  transition: var(--circle-transition);
  pointer-events: none;
}

.theme-switch__sun-moon-container {
  pointer-events: auto;
  position: relative;
  z-index: 2;
  width: var(--sun-moon-diameter);
  height: var(--sun-moon-diameter);
  margin: auto;
  border-radius: var(--container-radius);
  background-color: var(--sun-bg);
  -webkit-box-shadow: 0.062em 0.062em 0.062em 0em rgba(254, 255, 239, 0.61) inset, 0em -0.062em 0.062em 0em #a1872a inset;
  box-shadow: 0.062em 0.062em 0.062em 0em rgba(254, 255, 239, 0.61) inset, 0em -0.062em 0.062em 0em #a1872a inset;
  -webkit-filter: drop-shadow(0.062em 0.125em 0.125em rgba(0, 0, 0, 0.25)) drop-shadow(0em 0.062em 0.125em rgba(0, 0, 0, 0.25));
  filter: drop-shadow(0.062em 0.125em 0.125em rgba(0, 0, 0, 0.25)) drop-shadow(0em 0.062em 0.125em rgba(0, 0, 0, 0.25));
  overflow: hidden;
  -webkit-transition: var(--transition);
  -o-transition: var(--transition);
  transition: var(--transition);
}

.theme-switch__moon {
  -webkit-transform: translateX(100%);
  -ms-transform: translateX(100%);
  transform: translateX(100%);
  width: 100%;
  height: 100%;
  background-color: var(--moon-bg);
  border-radius: inherit;
  -webkit-box-shadow: 0.062em 0.062em 0.062em 0em rgba(254, 255, 239, 0.61) inset, 0em -0.062em 0.062em 0em #969696 inset;
  box-shadow: 0.062em 0.062em 0.062em 0em rgba(254, 255, 239, 0.61) inset, 0em -0.062em 0.062em 0em #969696 inset;
  -webkit-transition: var(--transition);
  -o-transition: var(--transition);
  transition: var(--transition);
  position: relative;
}

.theme-switch__spot {
  position: absolute;
  top: 0.75em;
  left: 0.312em;
  width: 0.75em;
  height: 0.75em;
  border-radius: var(--container-radius);
  background-color: var(--spot-color);
  -webkit-box-shadow: 0em 0.0312em 0.062em rgba(0, 0, 0, 0.25) inset;
  box-shadow: 0em 0.0312em 0.062em rgba(0, 0, 0, 0.25) inset;
}

.theme-switch__spot:nth-of-type(2) {
  width: 0.375em;
  height: 0.375em;
  top: 0.937em;
  left: 1.375em;
}

.theme-switch__spot:nth-last-of-type(3) {
  width: 0.25em;
  height: 0.25em;
  top: 0.312em;
  left: 0.812em;
}

.theme-switch__clouds {
  width: 1.25em;
  height: 1.25em;
  background-color: var(--clouds-color);
  border-radius: var(--container-radius);
  position: absolute;
  bottom: -0.625em;
  left: 0.312em;
  -webkit-box-shadow: 0.937em 0.312em var(--clouds-color), -0.312em -0.312em var(--back-clouds-color), 1.437em 0.375em var(--clouds-color), 0.5em -0.125em var(--back-clouds-color), 2.187em 0 var(--clouds-color), 1.25em -0.062em var(--back-clouds-color), 2.937em 0.312em var(--clouds-color), 2em -0.312em var(--back-clouds-color), 3.625em -0.062em var(--clouds-color), 2.625em 0em var(--back-clouds-color), 4.5em -0.312em var(--clouds-color), 3.375em -0.437em var(--back-clouds-color), 4.625em -1.75em 0 0.437em var(--clouds-color), 4em -0.625em var(--back-clouds-color), 4.125em -2.125em 0 0.437em var(--back-clouds-color);
  box-shadow: 0.937em 0.312em var(--clouds-color), -0.312em -0.312em var(--back-clouds-color), 1.437em 0.375em var(--clouds-color), 0.5em -0.125em var(--back-clouds-color), 2.187em 0 var(--clouds-color), 1.25em -0.062em var(--back-clouds-color), 2.937em 0.312em var(--clouds-color), 2em -0.312em var(--back-clouds-color), 3.625em -0.062em var(--clouds-color), 2.625em 0em var(--back-clouds-color), 4.5em -0.312em var(--clouds-color), 3.375em -0.437em var(--back-clouds-color), 4.625em -1.75em 0 0.437em var(--clouds-color), 4em -0.625em var(--back-clouds-color), 4.125em -2.125em 0 0.437em var(--back-clouds-color);
  -webkit-transition: 0.5s cubic-bezier(0, -0.02, 0.4, 1.25);
  -o-transition: 0.5s cubic-bezier(0, -0.02, 0.4, 1.25);
  transition: 0.5s cubic-bezier(0, -0.02, 0.4, 1.25);
}

.theme-switch__stars-container {
  position: absolute;
  color: var(--stars-color);
  top: -100%;
  left: 0.312em;
  width: 2.75em;
  height: auto;
  -webkit-transition: var(--transition);
  -o-transition: var(--transition);
  transition: var(--transition);
}

/* actions */

.theme-switch__checkbox:checked + .theme-switch__container {
  background-color: var(--container-night-bg);
}

.theme-switch__checkbox:checked + .theme-switch__container .theme-switch__circle-container {
  left: calc(100% - var(--circle-container-offset) - var(--circle-container-diameter));
}

.theme-switch__checkbox:checked + .theme-switch__container .theme-switch__circle-container:hover {
  left: calc(100% - var(--circle-container-offset) - var(--circle-container-diameter) - 0.187em)
}

.theme-switch__circle-container:hover {
  left: calc(var(--circle-container-offset) + 0.187em);
}

.theme-switch__checkbox:checked + .theme-switch__container .theme-switch__moon {
  -webkit-transform: translate(0);
  -ms-transform: translate(0);
  transform: translate(0);
}

.theme-switch__checkbox:checked + .theme-switch__container .theme-switch__clouds {
  bottom: -4.062em;
}

.theme-switch__checkbox:checked + .theme-switch__container .theme-switch__stars-container {
  top: 50%;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}

.member{
  background: linear-gradient(90deg, #FFD1B2 9%, #FFC199 45%, #FFB280 83%, #FFC299 100%);
  padding: 3px 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #75331b;
  user-select: none;
  white-space: nowrap;
}
.gradientMember{
	background: linear-gradient(to right, #FDE5B1, #F8D490);
   /*background: linear-gradient(to right, #c757e6, #6b21db);*/
   /*background: linear-gradient(to right, #8a3ee0, #6d22df); */
  /*background: linear-gradient(to right, #9143eb, #6d22df);*/
  font-family: 'Microsoft YaHei-Bold', sans-serif;
  padding: 3px 10px;
  border-radius: 7px;
  box-shadow: 0 4px 10px 0 rgba(0, 3, 15, 0.37);
  color: #C27E39;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.qqqMember{
  background: linear-gradient(to right, #3943da, #066914);
  font-family: 'Microsoft YaHei-Bold', sans-serif;
  padding: 3px 10px;
  border-radius: 7px;
  box-shadow: 0 4px 10px 0 rgba(3, 0, 7, 0.788);
  color: #fff;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.logMember{
  background: linear-gradient(to right, #292828, #070707);
  font-family: 'Microsoft YaHei-Bold', sans-serif;
  padding: 3px 10px;
  border-radius: 7px;
  box-shadow: 0 4px 10px 0 rgba(3, 0, 7, 0.527);
  color: #fff;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.sweeplogo a{
    overflow:hidden;
    display: block;
}
.sweeplogo a:before {
  content: "";
  position: absolute;
  top: -40px;
  left: -15px;
  width: 95px;
  height: 5px;/**光标的宽度，可根据实际调整**/
  background-color:  rgba(255, 255, 255, 0.712);
  -webkit-transform: rotate(-45deg);
  -moz-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  -o-transform: rotate(-45deg);
  transform: rotate(-45deg);
  -webkit-animation: flashlights 1s ease-in 1s infinite;
  -o-animation: flashlights 1s ease-in 1s infinite;
  animation: flashlights 1.5s ease-in 1s infinite;/**1.5s数字参数控制扫光速度，数字越大越慢**/
}
@-webkit-keyframes flashlights {
  0% { left: -100px; top: 0; }
  to { left: 150px; top: 15px; }
}
@-o-keyframes flashlights {
  0% { left: -100px; top: 0; }
  to { left: 150px; top: 15px; }
}
@-moz-keyframes flashlights {
  0% { left: -100px; top: 0; }
  to { left: 150px; top: 15px; }
}
@keyframes flashlights {
  0% { left: -100px; top: 0; }
  to { left: 150px; top: 15px; }
}
</style>
