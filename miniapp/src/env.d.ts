/// <reference types="@dcloudio/types" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '@dcloudio/uni-app' {
  export function onLaunch(callback: () => void): void
  export function onShow(callback: () => void): void
  export function onHide(callback: () => void): void
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
