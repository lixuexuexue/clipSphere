import type { GlobalThemeOverrides } from 'naive-ui'
import { computed, watch } from 'vue'
import { darkTheme, useOsTheme } from 'naive-ui'
import { useAppStore } from '@/store'

export function useTheme() {
  const appStore = useAppStore()

  const OsTheme = useOsTheme()

  const isDark = computed(() => {
    if (appStore.theme === 'auto')
      return OsTheme.value === 'dark'
    else
      return appStore.theme === 'dark'
  })

  const theme = computed(() => {
    return isDark.value ? darkTheme : undefined
  })

  const themeOverrides = computed<GlobalThemeOverrides>(() => {
    if (isDark.value) {
      return {
        common: {},
      }
    }
    return {
      common: {
        primaryColor: '#409eff',
      },
    }
  })

  const darkThemeOverrides: GlobalThemeOverrides = {
    common: {
      primaryColor: '#846EF7FF',
      primaryColorHover: '#8048FBFF',
      primaryColorPressed: '#846EF7FF',
    },
    Switch: {
      railColorActive: '#846EF7FF',
    },
    Layout: {
      // color: '#101014FF',
      // siderColor: '#2F2E34',
    },
    Slider: {
      fillColor: '#846EF7FF',
      fillColorHover: '##8048FBFF',
    },
  }

  const lightThemeOverrides: GlobalThemeOverrides = {
    common: {
      primaryColor: '#846EF7FF',
      primaryColorHover: '#8048FBFF',
      primaryColorPressed: '#8048FBFF',
    },
    Skeleton: {
      color: '#F4F3F3FF',
      colorEnd: '#F1F0F0FF',
    },
    Layout: {
      // color: '#F7F9FAFF',
      // siderColor: '#EAF3F0FF',
    },
  }

  watch(
    () => isDark.value,
    (dark) => {
      if (dark)
        document.documentElement.classList.add('dark')
      else
        document.documentElement.classList.remove('dark')
    },
    { immediate: true },
  )

  return { theme, themeOverrides, lightThemeOverrides, darkThemeOverrides }
}
