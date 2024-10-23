import { ss } from '@/utils/storage'

const LOCAL_NAME = 'SECRET_TOKEN'

export function getToken() {
  return ss.get(LOCAL_NAME)
}

export function setToken(token: string) {
  return ss.set(LOCAL_NAME, token)
}

export function removeToken() {
  return ss.remove(LOCAL_NAME)
}

export function clearToken() {
  return ss.clear()
}

export interface UserBalance {
  isMember: boolean
  modelCount: number
  drawMjCount: number
  memberModelCount: number
  memberDrawMjCount: number
  useModelCount: number
  useModelToken: number
  useDrawMjToken: number
  sumModelCount: number
  sumDrawMjCount: number
  expirationTime: Date
}

export interface GlobalConfig {
  siteName: string
  qqNumber: string
  vxNumber: string
  baiduCode: string
  buyCramiAddress: string
  noticeInfo: string
  inviteSendStatus: string
  registerSendStatus: string
  registerSendModelCount: string
  registerSendDrawMjCount: string
  inviteGiveSendModelCount: string
  inviteGiveSendDrawMjCount: string
  invitedGuestSendModelCount: string
  invitedGuestSendDrawMjCount: string
  clientHomePath: string
  clientLogoPath: string
  clientAtmosphere: string
  clientFavoIconPath: string
  isUseWxLogin: boolean
  mjFastChanel: boolean
  mjRelaxChanel: boolean
  robotAvatar: string
  siteRobotName: string
  mindDefaultData: string
  payWechatStatus: string
  isAutoOpenNotice: string
  isShowAppCatIcon: string
  salesBaseRatio: string
  salesSeniorRatio: string
  salesAllowDrawMoney: string
  companyName: string
  gaNumber: string
  filingNumber: string
  emailRegisterStatus: string
  emailLoginStatus: string
  phoneLoginStatus: string
  phoneRegisterStatus: string
  wechatRegisterStatus: string
  wechatSilentLoginStatus: string
  signInStatus: string
  vipStatus: string
  signInModelCount: string
  signInMjDrawToken: string
  appMenuHeaderTips: string
  appMenuHeaderBgUrl: string
  customLinkTips: string
  customLinkUrl: string
  mjHideNotBlock: string
  mjUseBaiduFy: string
  mjHideWorkIn: string
  isVerifyEmail: string
  registerBaseUrl: string
  loginDialogImgUrl: string
  useDistributionMode: string
  mjDefaultChanel: string
}
export interface AuthState {
  token: string | undefined
  loginDialog: boolean
  globalConfigLoading: boolean
  loadInit: boolean
  userInfo: {
    username: string
    email: string
    role: string
    id: number
    avatar?: string
    sign?: string
    inviteCode: string
    isBindWx: boolean
    consecutiveDays: number
    isDistribution: boolean
  }
  userBalance: UserBalance
  globalConfig: GlobalConfig
}
