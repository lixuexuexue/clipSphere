

<script lang='ts' setup>
import { useAuthStore } from '@/store'
import { computed } from 'vue'
import { NAlert} from 'naive-ui'

const authStore = useAuthStore()

const registerSendStatus = computed(() => Number(authStore.globalConfig.registerSendStatus))
const registerSendModelCount = computed(() => Number(authStore.globalConfig.registerSendModelCount))
const registerSendDrawMjCount = computed(() => Number(authStore.globalConfig.registerSendDrawMjCount))
const registerTips = computed(() => (`首次注册：赠送${registerSendModelCount.value}积分对话模型余额 | ${registerSendDrawMjCount.value}积分绘画余额`))

</script>

<template>
	<div v-if="registerSendStatus">
		<NAlert  type="error" :show-icon="false" class="mt-5">
			{{ registerTips }}
		</NAlert>
	</div>
</template>


