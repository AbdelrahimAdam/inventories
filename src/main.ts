import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Create app
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)

// Global error handler
app.config.errorHandler = (err, _vm, info) => {
  console.error('Global error:', err, info)
}

// Mount app
app.mount('#app')