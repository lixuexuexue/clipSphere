<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import type { FormInst, FormRules } from 'naive-ui'
import { NButton, NForm, NFormItem, NInput, useMessage } from 'naive-ui'
// import Send from './send.vue'
import { fetchCaptchaImg, fetchLoginByEmailAPI, fetchRegisterByEmailAPI } from '@/api'
import { useAppStore, useAuthStore } from '@/store'
import Motion from '@/utils/motion/index'
import { ss } from '@/utils/storage'
import { SvgIcon } from '@/components/common'

interface Emit {
  (ev: 'changeLoginType', val: string): void
}
const emit = defineEmits<Emit>()

const appStore = useAppStore()
const formRef = ref<FormInst | null>(null)
const Nmessage = useMessage()
const isLogin = ref(true)
const loading = ref(false)
const authStore = useAuthStore()
const captchaSvg = ref('')
const theme = computed(() => appStore.theme)

/* isVerifyEmail 为0或者 */
const isVerifyEmail = computed(() => {
  const v = authStore.globalConfig.isVerifyEmail ? Number(authStore.globalConfig.isVerifyEmail) : 1
  return v
})

const registerButtonMsg = computed(() => {
  return isVerifyEmail.value ? '发送激活账户邮件' : '立即注册'
})

const captchaBgColor = computed(() => {
  return theme.value === 'dark' ? '#363f4f' : '#fff'
})

const registerForm = ref({
  password: '',
  email: '',
  invitedBy: '',
  captchaCode: '',
  captchaId: null,
})

const loginForm = ref({
  password: '',
  email: '',
  invitedBy: '',
})

const rules: FormRules = {
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度应为 6 到 30 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
  ],
  captchaCode: [
    { required: true, message: '请填写验证码', trigger: 'blur' },
  ],
}
const logTips = computed(() => (isLogin.value ? '还没账号? 去注册！' : '已有账户去登录！'))

const wechatRegisterStatus = computed(() => Number(authStore.globalConfig.wechatRegisterStatus) === 1)
const phoneLoginStatus = computed(() => Number(authStore.globalConfig.phoneLoginStatus) === 1)
const emailRegisterStatus = computed(() => Number(authStore.globalConfig.emailRegisterStatus) === 1)

function handlerSubmit() {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        loading.value = true
        const Interface = isLogin.value ? fetchLoginByEmailAPI : fetchRegisterByEmailAPI
        const params: any = !isLogin.value ? registerForm.value : { email: loginForm.value.email, password: loginForm.value.password }
        const res: any = await Interface(params)
        loading.value = false
        getCaptchaImg()
        const { success, message } = res
        if (!success)
          return Nmessage.error(message)
        if (!isLogin.value) {
          const msg = Number(isVerifyEmail) ? '您的账号激活邮件已经发送,请前往邮箱激活您的账户！' : '您的账号已成功注册、请登录使用吧！'
          Nmessage.success(msg)
          const { email, password } = registerForm.value
          loginForm.value.email = email
          loginForm.value.password = password
          isLogin.value = !isLogin.value
          /* 如果不校验 自动登录 */
          if (!isVerifyEmail.value)
            autoLogin()
        }
        else {
          Nmessage.success('账户登录成功、开始体验吧！')
          authStore.setToken(res.data)
          authStore.getUserInfo()
          authStore.setLoginDialog(false)
          ss.remove('invitedBy')
        }
      }
      catch (error) {
        getCaptchaImg()
        loading.value = false
      }
    }
  })
}

async function autoLogin() {
  const params = { email: loginForm.value.email, password: loginForm.value.password }
  const res: any = await fetchLoginByEmailAPI(params)
  const { success, message } = res
  if (!success)
    return Nmessage.error(message)
  Nmessage.success('账户登录成功、开始体验吧！')
  authStore.setToken(res.data)
  authStore.getUserInfo()
  authStore.setLoginDialog(false)
  ss.remove('invitedBy')
}

async function getCaptchaImg() {
  const res: any = await fetchCaptchaImg({ color: captchaBgColor.value })
  captchaSvg.value = res.data.svgCode
  registerForm.value.captchaId = res.data.code
}

onMounted(() => {
  const code = ss.get('invitedBy')
  code && (registerForm.value.invitedBy = code)
  getCaptchaImg()
})
</script>

<template>
  <div class="px-[65px]" :class="isLogin ? 'pt-[40px]' : 'pt-5'">
    <NForm
      v-if="!isLogin"
      ref="formRef"
      :model="registerForm"
      :rules="rules"
      label-placement="left"
      label-width="auto"
      require-mark-placement="right-hanging"
      :style="{ maxWidth: '640px' }"
    >
      <Motion :delay="190">
        <NFormItem path="email">
          <NInput v-model:value="registerForm.email" autocomplete="off" placeholder="请填写您的邮箱账号" />
        </NFormItem>
      </Motion>
      <Motion :delay="120">
        <NFormItem path="password">
          <NInput v-model:value="registerForm.password" autocomplete="off" placeholder="请输入您的账户密码" type="password" :maxlength="30" show-password-on="click" tabindex="0" @keyup.enter="handlerSubmit" />
        </NFormItem>
      </Motion>
      <Motion :delay="260">
        <NFormItem path="captchaCode">
          <div class="flex items-center w-full space-x-4">
            <NInput v-model:value="registerForm.captchaCode" autocomplete="off" class="flex-1" placeholder="请填写图中验证码结果" />
            <div v-if="captchaSvg">
              <span class="cursor-pointer rounded" @click="getCaptchaImg" v-html="captchaSvg" />
            </div>
          </div>
        </NFormItem>
      </Motion>
      <NFormItem>
        <NButton
          block
          type="primary"
          :disabled="loading"
          :loading="loading"
          style="border-radius: 20px;"
          @click="handlerSubmit"
        >
          {{ registerButtonMsg }}
        </NButton>
      </NFormItem>
    </NForm>

    <!-- login -->
    <NForm
      v-if="isLogin"
      ref="formRef"
      size="large"
      :model="loginForm"
      :rules="rules"
      label-placement="left"
      label-width="auto"
      require-mark-placement="right-hanging"
      :style="{
        maxWidth: '640px',
      }"
			autocomplete="off"
    >
      <Motion :delay="50">
        <NFormItem path="email">
          <NInput v-model:value="loginForm.email" autocomplete="off" placeholder="请输入邮箱地址" />
        </NFormItem>
      </Motion>

      <Motion :delay="120">
        <NFormItem path="password">
          <NInput v-model:value="loginForm.password" autocomplete="off" placeholder="请输入您的账户密码" type="password" :maxlength="30" show-password-on="click" tabindex="0" @keyup.enter="handlerSubmit" />
        </NFormItem>
      </Motion>
      <NFormItem>
        <NButton
          block
          type="primary"
          :disabled="loading"
          :loading="loading"
          class="!mt-[50px]"
          style="border-radius: 20px;"
          @click="handlerSubmit"
        >
          登录账户
        </NButton>
      </NFormItem>
    </NForm>
  </div>
  <span v-if="emailRegisterStatus" class="flex justify-center cursor-pointer">
    <NButton text style="font-weight: bold;" @click="isLogin = !isLogin">{{ logTips }}</NButton>
  </span>
  <div class="flex items-center justify-center space-x-5" :class="emailRegisterStatus ? 'mt-[16px]' : 'mt-[36px]'">
    <NButton v-if="wechatRegisterStatus" ghost class="!px-10" @click="emit('changeLoginType', 'wechat')">
      <SvgIcon class="text-xl mr-2 text-[#7869f5]" icon="ph:wechat-logo" />
      微信登录
    </NButton>
    <NButton v-if="phoneLoginStatus" ghost class="!px-10" @click="emit('changeLoginType', 'phone')">
      <SvgIcon class="text-xl mr-2 text-[#7869f5]" icon="clarity:mobile-phone-solid" />
      手机号登录
    </NButton>
  </div>

  <Motion :delay="800" />
</template>
