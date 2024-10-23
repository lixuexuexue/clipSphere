import { get } from '@/utils/request'

/* get notice */
export function fetchGetGlobalNoticeAPI<T>(): Promise<T> {
  return get<T>({
    url: '/config/notice',
  })
}

/* get notice */
export function fetchCheckAuthAPI<T>(): Promise<T> {
  return get<T>({
    url: '/config/check',
  })
}
