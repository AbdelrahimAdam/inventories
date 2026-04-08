<template>
  <div v-if="showInstallPrompt" class="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 z-50 animate-slide-up">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm mx-auto sm:mx-0">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-base font-bold text-gray-900 dark:text-white">تثبيت التطبيق</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">قم بتثبيت P.commerce على جهازك للوصول السريع</p>
          <div class="flex gap-2 mt-3">
            <button @click="dismissPrompt" class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400">تذكر لاحقاً</button>
            <button @click="installApp" class="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
              تثبيت
            </button>
          </div>
        </div>
        <button @click="dismissPrompt" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showInstallPrompt = ref(false)
let deferredPrompt: any = null

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    
    const dismissed = localStorage.getItem('install-prompt-dismissed')
    const installed = localStorage.getItem('app-installed')
    
    if (!dismissed && !installed) {
      setTimeout(() => {
        showInstallPrompt.value = true
      }, 2000)
    }
  })
  
  window.addEventListener('appinstalled', () => {
    localStorage.setItem('app-installed', 'true')
    showInstallPrompt.value = false
  })
})

const installApp = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      localStorage.setItem('app-installed', 'true')
    }
    deferredPrompt = null
    showInstallPrompt.value = false
  }
}

const dismissPrompt = () => {
  showInstallPrompt.value = false
  localStorage.setItem('install-prompt-dismissed', 'true')
}
</script>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>