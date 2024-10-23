import axios, { type AxiosResponse } from 'axios'
import { router } from '@/router'
import { useAuthStore, useGlobalStore } from '@/store'

// prod config
const service = axios.create({
  baseURL: import.meta.env.VITE_GLOB_API_URL,
  timeout: 2400 * 1000,
})

// dev config
// const service = axios.create({
//   baseURL: '/api',
//   timeout: 2400 * 1000,
// })

service.interceptors.request.use(
  (config) => {
    const token = useAuthStore().token
    const fingerprint = useGlobalStore()?.fingerprint
    const currentDomain = window.location.hostname
    config.headers['X-Website-Domain'] = currentDomain
    fingerprint && (config.headers.Fingerprint = fingerprint)
    if (token)
      config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    return Promise.reject(error.response)
  },
)

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if ([200, 201].includes(response.status))
      return response

    if ([203].includes(response.status)) {
      router.push('/unauthorized')
      return
    }

    throw new Error(response.status.toString())
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default service
