import { defineStore } from 'pinia'

import type { AuthState, GlobalConfig, UserBalance } from './helper'
import { clearToken, getToken, removeToken, setToken } from './helper'
import { store } from '@/store'
import { fetchGetInfo } from '@/api'
import { fetchQueryConfigAPI } from '@/api/config'

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    token: getToken(),
    loginDialog: false,
    globalConfigLoading: true,
    userInfo: {},
    userBalance: {},
    globalConfig: {} as GlobalConfig,
    loadInit: false,
  }),

  getters: {
    isLogin: (state: AuthState) => !!state.token,
  },

  actions: {
    async getUserInfo(): Promise<T> {
      try {
        if (!this.loadInit)
          await this.getglobalConfig()

        const res = await fetchGetInfo()
        if (!res)
          return Promise.resolve(res)
        const { data } = res
        const { userInfo, userBalance } = data
        this.userInfo = { ...userInfo }
        this.userBalance = { ...userBalance }
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    updateUserBanance(userBalance: UserBalance) {
      this.userBalance = userBalance
    },

    async getglobalConfig(domain = '') {
      const res = await fetchQueryConfigAPI({ domain })
      this.globalConfig = res.data
      this.globalConfigLoading = false
      this.loadInit = true
    },

    setToken(token: string) {
      this.token = token
      setToken(token)
    },

    removeToken() {
      this.token = undefined
      removeToken()
    },

    setLoginDialog(bool: boolean) {
      this.loginDialog = bool
    },

    /* 退出登陆 */
    logOut() {
      this.token = undefined
      clearToken()
      this.userInfo = {}
      this.userBalance = {}
      window.$message.success('登出账户成功！')
    },

    updatePasswordSuccess() {
      this.token = undefined
      removeToken()
      this.userInfo = {}
      this.userBalance = {}
      this.loginDialog = true
    },
  },
})

export function useAuthStoreWithout() {
  return useAuthStore(store)
}
