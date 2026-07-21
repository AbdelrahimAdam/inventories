import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// ✅ Import polyfills for legacy browsers
import 'core-js/stable'
import 'regenerator-runtime/runtime'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.config.errorHandler = (err, _vm, info) => {
  console.error('Global error:', err, info)
}

app.mount('#app')

// Unregister any existing service worker from previous installs
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        for (const registration of registrations) {
          registration.unregister()
          console.log('[PWA] Service worker unregistered')
        }
        if (registrations.length > 0) {
          console.log('[PWA] Old service worker removed')
        }
      })
      .catch(err => {
        console.log('[PWA] Failed to unregister service worker:', err)
      })
  })
}