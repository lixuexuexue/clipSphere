<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAuthStore } from '@/store'
const authStore = useAuthStore()

const logoPath = computed(() => authStore.globalConfig.clientLogoPath)
const homePage = computed(() => authStore.globalConfig.clientHomePath || '/')

const { isMobile } = useBasicLayout()

const getMobileClass = computed(() => {
  if (isMobile.value)
    return ['py-2', 'w-8', 'cursor-pointer']
  return ['px-2', 'h-[34px]', 'cursor-pointer', 'ml-1']
})
</script>

<template>
  <RouterLink :to="homePage">
		<SvgIcon v-if="!logoPath" icon="logos:autoit" class="text-3xl ml-5" />
<!-- <img v-if="!logoPath" src="/logo.png" :class="getMobileClass" class="cursor-pointer px-0 dark:border-[#ffffff17]  border-#ebebeb-400" alt=""> -->
    <img v-if="logoPath" :src="logoPath" :class="getMobileClass" class="cursor-pointer px-0 dark:border-[#ffffff17]  border-#ebebeb-400" alt="">
  </RouterLink>
</template>
