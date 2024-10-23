<script setup lang='ts'>
import type { CountdownInst } from 'naive-ui'
import { NButton, NCountdown, NIcon, NModal, NRadioButton, NRadioGroup, NSkeleton, NSpace, NSpin, useMessage } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { CloseOutline, PaperPlaneOutline } from '@vicons/ionicons5'
import { useAuthStore, useGlobalStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { fetchOrderBuyAPI, fetchOrderQueryAPI } from '@/api/order'

import type { ResData } from '@/api/types'
import QRCode from '@/components/common/QRCode/index.vue'
import wxpay from '@/assets/wxpay.png'
defineProps<Props>()

const { isMobile } = useBasicLayout()

const authStore = useAuthStore()
const useGlobal = useGlobalStore()
const POLL_INTERVAL = 1000
const ms = useMessage()
const active = ref(true)
const payType = ref('wxpay')

interface Props {
  visible: boolean
}

/* 是否是微信环境 */
const isWxEnv = computed(() => {
  const ua = window.navigator.userAgent.toLowerCase()
  return ua.match(/MicroMessenger/i) && ua?.match(/MicroMessenger/i)?.[0] === 'micromessenger'
})

/* 开启的支付平台 */
const payPlatform = computed(() => {
  const { payWechatStatus } = authStore.globalConfig
  if (Number(payWechatStatus) === 1)
    return 'wechat'
  return null
})

/* 支付平台开启的支付渠道 */
const payChannel = computed(() => {
  if (payPlatform.value === 'wechat')
    return ['wxpay']
  return []
})

const plat = computed(() => '微信')
const countdownRef = ref<CountdownInst | null>()

watch(payType, () => {
  getQrCode()
  countdownRef.value?.reset()
})

const orderId = ref('')
let timer: any
const payTypes = computed(() => {
  return [
    { label: '微信支付', value: 'wxpay', icon: wxpay, payChannel: 'wxpay' },
  ].filter(item => payChannel.value.includes(item.payChannel))
})

const queryOrderStatus = async () => {
  if (!orderId.value)
    return
  const result: ResData = await fetchOrderQueryAPI({ orderId: orderId.value })
  const { success, data } = result
  if (success) {
    const { status } = data
    if (status === 1) {
      clearInterval(timer)
      ms.success('恭喜你支付成功、祝您使用愉快！')
      active.value = false
      authStore.getUserInfo()
      setTimeout(() => {
        useGlobal.updatePayDialog(false)
      }, 2000)
    }
  }
}

const orderInfo = computed(() => useGlobal?.orderInfo)
const url_qrcode = ref('')
const qrCodeloading = ref(true)
const redirectloading = ref(true)
const redirectUrl = ref('')
const isRedirectPay = computed(() => {
  return false
})

function handleCloseDialog() {
  useGlobal.updateOrderInfo({})
  clearInterval(timer)
}

function openWechatLink(url) {
  if (typeof WeixinJSBridge == 'undefined') {
    if (document.addEventListener) {
      document.addEventListener('WeixinJSBridgeReady', () => {
        openLink(url)
      }, false)
    }
    else if (document.attachEvent) {
      document.attachEvent('WeixinJSBridgeReady', () => {
        openLink(url)
      })
      document.attachEvent('onWeixinJSBridgeReady', () => {
        openLink(url)
      })
    }
  }
  else {
    openLink(url)
  }
}
function openLink(url) {
  if (!WeixinJSBridge?.invoke)
    window.open(url, '_blank')

  WeixinJSBridge.invoke('openUrl', {
    url,
    delay: 0,
  })
}

/* 请求二维码 */
async function getQrCode() {
  !isRedirectPay.value && (qrCodeloading.value = true)
  isRedirectPay.value && (redirectloading.value = true)
  let qsPayType = null
  qsPayType = payType.value
  if (payPlatform.value === 'wechat')
    qsPayType = isWxEnv.value ? 'jsapi' : 'native'

  try {
    const res: ResData = await fetchOrderBuyAPI({ goodsId: orderInfo.value.pkgInfo.id, payType: qsPayType })
    const { data, success, message } = res
    if (!success)
      return ms.error(message)

    const { url_qrcode: code, orderId: id, redirectUrl: redUrl } = data

    redirectUrl.value = redUrl
    orderId.value = id
    url_qrcode.value = code
    qrCodeloading.value = false
    redirectloading.value = false
  }
  catch (error) {
    useGlobal.updatePayDialog(false)
    qrCodeloading.value = false
    redirectloading.value = false
  }
}

/* 跳转支付 */
function handleRedPay() {
  window.open(redirectUrl.value)
}

async function handleOpenDialog() {
  await getQrCode()
  timer = setInterval(() => {
    queryOrderStatus()
  }, POLL_INTERVAL)
}

function handleFinish() {
  ms.error('支付超时，请重新下单!')
  clearInterval(timer)
  useGlobal.updatePayDialog(false)
  // useGlobal.updateGoodsDialog(true)
}
</script>

<template>
  <NModal :show="visible" style="width: 90%; max-width: 750px" :on-after-enter="handleOpenDialog" :on-after-leave="handleCloseDialog">
    <div class="p-4 bg-white rounded dark:bg-slate-800">
      <div class="flex justify-between" @click="useGlobal.updatePayDialog(false)">
        <div class="flex text-xl font-bold mb-[20px] bg-currentflex items-center ">
          <NIcon size="25" color="#0e7a0d">
            <PaperPlaneOutline />
          </NIcon>
          <span class="ml-[8px]">商品支付</span>
        </div>
        <NIcon size="20" color="#0e7a0d" class="cursor-pointer">
          <CloseOutline />
        </NIcon>
      </div>
      <div class="p-4 ">
        <div><span class="whitespace-nowrap font-bold">需要支付：</span> <i class="text-xl text-[red] font-bold">{{ `￥${orderInfo.pkgInfo?.price}` }}</i></div>
        <div class="mt-2 flex">
          <span class="whitespace-nowrap font-bold">套餐名称：</span><span class="ml-2"> {{ orderInfo.pkgInfo?.name }}</span>
        </div>
        <div class="mt-2 flex">
          <span class="whitespace-nowrap font-bold">套餐描述：</span><span class="ml-2"> {{ orderInfo.pkgInfo?.des }} </span>
        </div>

        <div class="flex justify-center" :class="[isMobile ? 'flex-col' : 'flex-row', isRedirectPay ? 'flex-row-reverse' : '']">
          <div>
            <div class="flex items-center justify-center my-3 relative ">
              <!-- qrCodeloading -->
              <NSpin v-if="qrCodeloading && !isRedirectPay" size="large" class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              <NSkeleton v-if="qrCodeloading" :width="240" :height="240" :sharp="false" size="medium" />
              <img v-if="payType === 'wxpay' && !qrCodeloading && !isRedirectPay" :src="wxpay" class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 bg-[#fff]">
              <!-- wechat -->
              <QRCode v-if="payPlatform === 'wechat' && !qrCodeloading" :value="url_qrcode" :size="240" />
              <div v-if="isRedirectPay" class="flex flex-col" :class="[isRedirectPay && isMobile ? 'ml-0' : 'ml-20']">
                <span class="mb-10 mt-5 text-base">当前站长开通了跳转支付</span>
                <!-- mapy 跳转支付 -->
                <NButton v-if="isRedirectPay" type="primary" ghost :disabled="redirectloading" :loading="redirectloading" @click="handleRedPay">
                  点击前往支付
                </NButton>
              </div>
            </div>
            <span v-if="!isRedirectPay" class="flex items-center justify-center text-lg ">
              {{ `打开${plat}扫码支付` }}
            </span>
          </div>
          <div class=" flex flex-col" :class="[isMobile ? 'w-full ' : ' ml-10 w-[200] ']">
            <!-- <h4 class="mb-10 font-bold text-lg">
              支付方式
            </h4> -->
            <div style="white-space: nowrap" class="mt-6 w-full text-left font-bold text-sm" :class="[isMobile ? 'mb-2' : 'mb-3']">
              请在 <span class="w-[60px] inline-block text-[red] text-left"><NCountdown ref="countdownRef" :active="active" :duration="300 * 1000" :on-finish="handleFinish" /></span> 时间内完成支付！
            </div>
            <NRadioGroup v-model:value="payType" name="radiogroup" class="flex ">
              <NSpace>
                <NRadioButton
                  v-for="pay in payTypes"
                  :key="pay.value"
                  :value="pay.value"
                  ghost
                  strong
                  secondary
                  class="w-[124px] rounded-lg px-3 py-[5px] backdrop-opacity-10 backdrop-invert hover:bg-violet-400 !text-black dark:!text-white"
                  :style="{ background: payType === pay.value ? 'rgba(133, 110, 247, 0.4)' : '' }"
                >
                  <div class="flex items-center">
                    <img class="h-4 object-contain mr-2" :src="pay.icon" alt=""> {{ pay.label }}
                  </div>
                </NRadioButton>
              </NSpace>
            </NRadioGroup>
          </div>
        </div>
      </div>
    </div>
  </NModal>
</template>
