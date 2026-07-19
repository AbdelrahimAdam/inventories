import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { register } from './registerServiceWorker'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.config.errorHandler = (err, _vm, info) => {
  console.error('Global error:', err, info)
}

app.mount('#app')

// Unregister any old service worker from previous deployments
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        for (const registration of registrations) {
          registration.unregister()
          console.log('[PWA] Service worker unregistered')
        }
        if (registrations.length > 0) {
          console.log('[PWA] Old service worker removed, reloading...')
          window.location.reload()
        }
      })
      .catch(err => {
        console.log('[PWA] Failed to unregister service worker:', err)
      })
  })
}

// Register service worker for PWA (only in production)
register({
  onSuccess: (registration) => {
    console.log('[PWA] Service worker registered successfully:', registration)
  },
  onUpdate: (registration) => {
    console.log('[PWA] New version available, updating...')
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }
})