import { createSSRApp } from 'vue'
import App from './App.vue'
import { registerWdComponents } from './components/wd-register'

export function createApp() {
  const app = createSSRApp(App)
  registerWdComponents(app)
  return { app }
}
