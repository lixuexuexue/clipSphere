import type { RouteLocationNormalized, Router } from 'vue-router'
import { useAuthStoreWithout } from '@/store/modules/auth'
import { ss } from '@/utils/storage'
import { fetchInviteCodeAPI } from '@/api/user'

export function setupPageGuard(router: Router): void {
  router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: (to?: string | false | void | Location | { path: string; query?: Record<string, string | (string | null)[]> }) => void) => {
    const inviteCode = to.query.inVitecode as string | undefined
    if (inviteCode) {
      ss.set('invitedBy', inviteCode)
      await fetchInviteCodeAPI({ code: inviteCode })
      return next({ path: to.path, query: {} })
    }

    window.$loadingBar?.start()
    const authStore = useAuthStoreWithout()
    if (!authStore.userInfo.username) {
      try {
        if (to.path === '/unauthorized')
          return next()

        if (authStore.token)
          await authStore.getUserInfo()
        if (authStore.globalConfigLoading) {
          let domain = `${window.location.protocol}//${window.location.hostname}`
          if (window.location.port)
            domain += `:${window.location.port}`
          await authStore.getglobalConfig(domain)
          const homePath = authStore.globalConfig.clientHomePath
          return next(homePath ? { path: homePath } : undefined)
        }
        return next(to.path === '/500' ? { path: '/' } : undefined)
      }
      catch (error) {
        return next(to.path === '/500' ? { path: '/' } : undefined)
      }
    }
    else {
      const clientMenuList = authStore.globalConfig?.clientMenuList
      const openMenuList = clientMenuList ? JSON.parse(clientMenuList) : []
      if (openMenuList.length && !openMenuList.includes(to.name) && ['Chat', 'Draw', 'Midjourney'].includes(to.name as string)) {
        const homePath = authStore.globalConfig.clientHomePath
        return next(homePath && homePath !== '' ? { path: homePath } : undefined)
      }
      next()
    }
  })

  router.afterEach((to: RouteLocationNormalized) => {
    window.$loadingBar?.finish()
  })
}
