import { ss } from '@/utils/storage'

function detectEnvironment() {
  if (typeof process !== 'undefined' && process?.type === 'renderer')
    return 'electron'

  else if (typeof wx !== 'undefined')
    return 'wechat'

  else if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches)
    return 'webApp'

  else if (/(Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone)/i.test(navigator.userAgent))
    return 'mobile'

  else
    return 'webBrowser'
}

const LOCAL_NAME = 'appSetting'

export type Theme = 'light' | 'dark' | 'auto'

export type Language = 'zh-CN' | 'zh-TW' | 'en-US'

export type Env = 'electron' | 'wechat' | 'webApp' | 'mobile' | 'webBrowser'

export type ChatLayout = 1 | 2 // 1: 气泡 2：列表

export interface AppState {
  siderCollapsed: boolean
  theme: Theme
  language: Language
  env: Env
  chatLayout: ChatLayout
  siderDrawCollapsed: boolean
  siderGroupingCollapsed: boolean
  siderPersonnelCollapsed: boolean
  siderAiConfigCollapsed: boolean
  siderChatOrAi: string
  dialogueType: string // 对话类型 'chat' 、'agent'
  siderChannelOrCollection: string
}

export function defaultSetting(): AppState {
  return {
    siderCollapsed: false,
    theme: 'dark',
    language: 'zh-CN',
    env: detectEnvironment(),
    siderDrawCollapsed: false,
    chatLayout: 1,
    siderGroupingCollapsed: false,
    siderPersonnelCollapsed: true,
    siderAiConfigCollapsed: false,
    siderChatOrAi: 'chat',
    dialogueType: 'chat',
    siderChannelOrCollection: '',
  }
}

export function getLocalSetting(): AppState {
  const localSetting: AppState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalSetting(setting: AppState): void {
  ss.set(LOCAL_NAME, setting)
}
