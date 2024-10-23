import { get, post } from '@/utils/request'

/* 获取个人信息 */
export function fetchGetInfo<T>() {
  return get<T>({ url: '/auth/getInfo' })
}

/* 注册 */
export function fetchRegisterByEmailAPI<T>(data: { username: string; password: string;email: string }): Promise<T> {
  return post<T>({ url: '/auth/registerByEmail', data }) as Promise<T>
}

/* 注册 */
export function fetchRegisterByPhoneAPI<T>(data: { username: string;password: string; phone: string; phoneCode: string }): Promise<T> {
  return post<T>({ url: '/auth/registerByPhone', data }) as Promise<T>
}

/* 登录 */
export function fetchLoginByEmailAPI<T>(data: { username: string; password: string }): Promise<T> {
  return post<T>({ url: '/auth/loginByEmail', data }) as Promise<T>
}

/* 手机号登录 */
export function fetchLoginByPhoneAPI<T>(data: { phone: string; password: string }): Promise<T> {
  return post<T>({ url: '/auth/loginByPhone', data }) as Promise<T>
}

/* 修改个人信息 */
export function fetchUpdateInfoAPI<T>(data: { username?: string; avatar?: string }): Promise<T> {
  return post<T>({ url: '/user/update', data }) as Promise<T>
}

/* 获取图片验证码 */
export function fetchCaptchaImg<T>(data: { color: string }): Promise<T> {
  return post<T>({ url: '/auth/captcha', data }) as Promise<T>
}

/* 发送手机验证码 */
export function fetchSendSms<T>(data: { phone: string; captchaId: string; captchaCode: string }): Promise<T> {
  return post<T>({ url: '/auth/sendPhoneCode', data }) as Promise<T>
}
