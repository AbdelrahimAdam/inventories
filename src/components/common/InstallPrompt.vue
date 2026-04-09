<template>
  <div v-if="showInstallPrompt" class="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 z-[9999] animate-slide-up">
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
            <button @click="dismissPrompt" class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors">
              تذكر لاحقاً
            </button>
            <button @click="installApp" class="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
              تثبيت
            </button>
          </div>
        </div>
        <button @click="dismissPrompt" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const showInstallPrompt = ref(false)
let deferredPrompt: any = null

// Detect mobile devices
const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Check if app is already installed
const isAppInstalled = (): boolean => {
  // Check for standalone mode (app is already installed and running)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true
  
  if (isStandalone) {
    localStorage.setItem('app-installed', 'true')
    return true
  }
  
  // Check for beforeinstallprompt event state
  const isInstalled = localStorage.getItem('app-installed') === 'true'
  if (isInstalled) {
    return true
  }
  
  return false
}

// Show mobile installation guide
const showMobileInstallGuide = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)
  
  if (isIOS) {
    alert('لتثبيت التطبيق على iPhone/iPad:\n\n1. اضغط على زر المشاركة ⎔\n2. اختر "إضافة إلى الشاشة الرئيسية"\n3. اضغط على "إضافة"')
  } else if (isAndroid) {
    alert('لتثبيت التطبيق على Android:\n\n1. اضغط على القائمة (⋮)\n2. اختر "تثبيت التطبيق"\n3. اتبع التعليمات على الشاشة')
  } else {
    alert('لتثبيت التطبيق:\n\nافتح القائمة واختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"')
  }
}

const handleBeforeInstallPrompt = (e: Event) => {
  console.log('📱 beforeinstallprompt event fired')
  e.preventDefault()
  deferredPrompt = e
  
  // Check if not dismissed and not installed
  const dismissed = localStorage.getItem('install-prompt-dismissed') === 'true'
  const installed = isAppInstalled()
  
  console.log('Install prompt check - dismissed:', dismissed, 'installed:', installed, 'isMobile:', isMobile())
  
  if (!dismissed && !installed) {
    // Show prompt after a short delay
    setTimeout(() => {
      showInstallPrompt.value = true
      console.log('📱 Install prompt shown')
    }, 2000)
  } else {
    console.log('📱 Install prompt suppressed')
  }
}

const handleAppInstalled = () => {
  console.log('✅ App was installed')
  localStorage.setItem('app-installed', 'true')
  localStorage.removeItem('install-prompt-dismissed')
  showInstallPrompt.value = false
  deferredPrompt = null
}

const installApp = async () => {
  console.log('📱 Install button clicked')
  
  if (deferredPrompt) {
    // Show the native install prompt (works on Android Chrome)
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('✅ User accepted the install prompt')
      localStorage.setItem('app-installed', 'true')
    } else {
      console.log('❌ User dismissed the install prompt')
    }
    
    deferredPrompt = null
    showInstallPrompt.value = false
  } else {
    console.log('⚠️ No deferredPrompt available, showing manual guide')
    // Fallback for iOS or browsers without beforeinstallprompt
    showMobileInstallGuide()
    showInstallPrompt.value = false
  }
}

const dismissPrompt = () => {
  console.log('📱 User dismissed install prompt')
  showInstallPrompt.value = false
  localStorage.setItem('install-prompt-dismissed', 'true')
}

// Reset dismissed flag (call this when user logs in)
const resetPrompt = () => {
  console.log('🔄 Resetting install prompt state')
  localStorage.removeItem('install-prompt-dismissed')
}

// Expose reset function for use in App.vue
defineExpose({ resetPrompt })

onMounted(() => {
  console.log('InstallPrompt component mounted')
  console.log('Is mobile device:', isMobile())
  
  // Check if already installed on mount
  isAppInstalled()
  
  // Add event listeners
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
  
  // For iOS, check if app is already in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('App is running in standalone mode (already installed)')
    localStorage.setItem('app-installed', 'true')
    showInstallPrompt.value = false
  }
  
  // For mobile devices without beforeinstallprompt, show manual guide after delay
  if (isMobile() && !deferredPrompt) {
    const dismissed = localStorage.getItem('install-prompt-dismissed') === 'true'
    const installed = isAppInstalled()
    
    if (!dismissed && !installed) {
      setTimeout(() => {
        // Check again if beforeinstallprompt fired
        if (!deferredPrompt && !isAppInstalled()) {
          console.log('📱 No beforeinstallprompt on mobile, showing manual guide')
          showInstallPrompt.value = true
        }
      }, 3000)
    }
  }
  
  // Log current state for debugging
  setTimeout(() => {
    console.log('InstallPrompt state:', {
      showInstallPrompt: showInstallPrompt.value,
      dismissed: localStorage.getItem('install-prompt-dismissed'),
      installed: localStorage.getItem('app-installed'),
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      isMobile: isMobile(),
      hasDeferredPrompt: !!deferredPrompt
    })
  }, 1000)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
})
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
