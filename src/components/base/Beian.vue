<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const { isMobile } = useBasicLayout()
const authStore = useAuthStore()

const globaelConfig = computed(() => authStore.globalConfig)
const isSetBeian = computed(() => globaelConfig.value?.companyName && globaelConfig.value?.filingNumber)
const isSetGaBeian = computed(() => globaelConfig.value?.gaNumber)
</script>

<template>
	<div v-if="isSetBeian && !isMobile" class="w-full flex justify-center items-center pb-2 pt-1 text-xs text-[#aeaeae]">
		<span><p style="float:left;height:16px;line-height:18px;margin: 0px 0px 0px 5px; color:#aeaeae;">版权所有 © </p></span>
		<span><p style="float:left;height:16px;line-height:18px;margin: 0px 0px 0px 5px; color:#aeaeae;">{{ globaelConfig?.companyName }} </p></span>
		<span><p style="float:left;height:16px;line-height:18px;margin: 0px 0px 0px 5px; color:#aeaeae;">&nbsp;&nbsp;</p><a class="ml-2 transition-all text-[#aeaeae] hover:text-[#60606d]" href="https://beian.miit.gov.cn" target="_blank"><img src="/icp.png" style="float:left;"><p style="float:left;height:16px;line-height:16px;margin: 0px 0px 0px 5px; color:#aeaeae;margin-top: 3px;">{{ globaelConfig?.filingNumber }}</p></a> </span>
		<span v-if="isSetGaBeian && !isMobile" class="ml-2 transition-all text-[#aeaeae] hover:text-[#60606d]"><a target="_blank" href="http://www.beian.gov.cn/portal/index.do" style="display:inline-block;text-decoration:none;height:16px;line-height:16px;"><img src="/icpga.png" style="float:left;"><p style="float:left;height:16px;line-height:16px;margin: 0px 0px 0px 5px; color:#aeaeae;">{{ globaelConfig?.gaNumber }}</p></a></span>
	</div>
</template>

<style scoped>

</style>
