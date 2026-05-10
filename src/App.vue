<template>
  <InstallPrompt ref="installPromptRef" />

  <!-- Loading with timeout + offline detection -->
  <div v-if="!authStore.isFullyReady && !showNetworkError" class="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400 text-base font-bold">{{ isRTL ? 'جاري التحميل...' : 'Loading...' }}</p>
      <p v-if="!isOnline" class="mt-2 text-sm text-red-500 font-medium">{{ isRTL ? '⚠️ لا يوجد اتصال بالإنترنت' : '⚠️ No internet connection' }}</p>
    </div>
  </div>

  <!-- Network error + retry screen -->
  <div v-if="showNetworkError" class="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
    <div class="text-center max-w-md mx-auto p-6">
      <div class="w-20 h-20 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
        <svg class="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="text-xl font-black text-gray-900 dark:text-white mb-2">{{ isRTL ? 'تعذر تحميل التطبيق' : 'Failed to load app' }}</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">{{ isRTL ? 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى' : 'Please check your internet connection and try again' }}</p>
      <button @click="retryInitialLoad" class="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold shadow-md transition-all">
        {{ isRTL ? 'إعادة المحاولة' : 'Retry' }}
      </button>
    </div>
  </div>

  <template v-else-if="authStore.isFullyReady">
    <div v-if="!authStore.isAuthenticated" class="min-h-screen">
      <router-view />
    </div>

    <div v-else-if="isPublicErrorPage" class="min-h-screen">
      <router-view />
    </div>

    <div
      v-else
      :dir="languageStore.direction"
      :lang="languageStore.current"
      class="h-screen flex transition-colors duration-300 overflow-hidden"
      :class="[
        languageStore.direction === 'rtl' ? 'rtl' : 'ltr',
        'bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-black'
      ]"
    >
      <!-- Offline Banner -->
      <div v-if="!isOnline" class="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-[100] font-bold shadow-lg">
        {{ isRTL ? '⚠️ أنت غير متصل بالإنترنت - بعض الميزات قد لا تعمل' : '⚠️ You are offline – some features may not work' }}
      </div>

      <!-- Mobile overlay -->
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 bg-black/50 transition-all duration-300 lg:hidden"
        style="z-index: 40;"
        @click="mobileMenuOpen = false"
      ></div>

      <!-- Sidebar -->
      <div class="relative" :class="{ 'lg:block': true }" style="z-index: 45;">
        <AppSidebar
          :is-mobile-open="mobileMenuOpen"
          :is-rtl="languageStore.direction === 'rtl'"
          @close-mobile="mobileMenuOpen = false"
        />
      </div>

      <!-- Main content area (with border separating sidebar) -->
      <div 
        class="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 border-l border-gray-200 dark:border-gray-700"
        :class="{
          'lg:mr-0': languageStore.direction === 'rtl',
          'lg:ml-0': languageStore.direction !== 'rtl'
        }"
        style="z-index: 1;"
      >
        <AppHeader
          @toggle-sidebar="mobileMenuOpen = !mobileMenuOpen"
          @logout="handleLogout"
          @toggle-dark-mode="toggleDarkMode"
          :is-dark-mode="isDarkMode"
          :is-rtl="languageStore.direction === 'rtl'"
        />

        <main class="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
          <!-- Distinct content card with strong separation -->
          <div class="content-card bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-all duration-300">
            <div class="main-content-container">
              <div 
                v-if="authStore.isViewOnly" 
                class="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 mb-4 flex items-center gap-2"
              >
                <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span class="text-sm font-bold text-yellow-800 dark:text-yellow-300">
                  ⚠️ أنت في وضع العرض فقط. لا يمكنك إضافة أو تعديل أو حذف البيانات
                </span>
              </div>

              <keep-alive :include="['inventory-items', 'dashboard-home', 'warehouse-manager-dashboard', 'admin-dashboard', 'viewer-dashboard', 'super-admin-dashboard']">
                <router-view :key="authStore.user?.id" />
              </keep-alive>
            </div>
          </div>
        </main>
      </div>

      <!-- Bottom navigation (mobile only) -->
      <BottomNav @open-sidebar="mobileMenuOpen = true" />
    </div>
  </template>

  <!-- Toast notifications -->
  <div class="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-4 z-[10001] flex flex-col gap-2">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="[
        'p-4 rounded-lg shadow-lg flex items-center gap-3 transform transition-all duration-300 animate-slide-in',
        toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      ]"
    >
      <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="flex-1 text-sm font-bold">{{ toast.message }}</span>
      <button @click="removeToast(toast.id)" class="text-white hover:text-gray-200 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { useRoute, useRouter } from 'vue-router'
import { supabase, supabaseService } from '@/services/supabase'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import InstallPrompt from '@/components/common/InstallPrompt.vue'

const authStore = useAuthStore()
const languageStore = useLanguageStore()
const route = useRoute()
const router = useRouter()

const mobileMenuOpen = ref(false)
const isDarkMode = ref(false)
const installPromptRef = ref<InstanceType<typeof InstallPrompt> | null>(null)
const isOnline = ref(navigator.onLine)
const showNetworkError = ref(false)
let loadingTimeout: ReturnType<typeof setTimeout> | null = null
let subscriptionChannel: any = null

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

const toasts = ref<Toast[]>([])
let nextToastId = 0

const showToast = (message: string, type: 'success' | 'error') => {
  const id = nextToastId++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    removeToast(id)
  }, 5000)
}

const removeToast = (id: number) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

const isRTL = computed(() => languageStore.direction === 'rtl')

const isPublicErrorPage = computed(() => {
  const publicErrorRoutes = ['subscription-expired', 'trial-expired']
  return publicErrorRoutes.includes(route.name as string)
})

// Network event handlers
const handleOnline = () => {
  isOnline.value = true
  showToast(isRTL.value ? 'تم استعادة الاتصال بالإنترنت' : 'Internet connection restored', 'success')
  // Retry initial load if needed
  if (!authStore.isFullyReady && !showNetworkError.value) {
    retryInitialLoad()
  }
}
const handleOffline = () => {
  isOnline.value = false
  showToast(isRTL.value ? 'انقطع الاتصال بالإنترنت' : 'Internet connection lost', 'error')
}

// Retry mechanism for initial load
const retryInitialLoad = async () => {
  if (loadingTimeout) clearTimeout(loadingTimeout)
  showNetworkError.value = false
  await attemptInitialLoad()
}

const attemptInitialLoad = async () => {
  // Set a timeout to detect loading stall
  loadingTimeout = setTimeout(() => {
    if (!authStore.isFullyReady) {
      showNetworkError.value = true
      loadingTimeout = null
    }
  }, 15000) // 15 seconds timeout

  try {
    await authStore.initialize() // Assuming this method exists; adjust to your real init method
    // If you use a different entry point, call the appropriate function here.
    // For example: await authStore.checkAuth(); await authStore.loadTenantContext();
  } catch (error) {
    console.error('Initial load failed:', error)
    if (!authStore.isFullyReady) {
      showNetworkError.value = true
    }
  } finally {
    if (loadingTimeout) clearTimeout(loadingTimeout)
  }
}

// Set up subscription listener (unchanged)
const setupSubscriptionListener = () => {
  if (subscriptionChannel) {
    supabase.removeChannel(subscriptionChannel)
  }
  
  const tenantId = authStore.currentTenantId
  if (!tenantId) return
  
  subscriptionChannel = supabase
    .channel('tenant-subscription-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tenants',
        filter: `id=eq.${tenantId}`
      },
      async (payload) => {
        const newSubscriptionStatus = payload.new.subscription_status
        const newPaidUntil = payload.new.paid_until
        
        const wasActive = authStore.isSubscriptionActive
        const isNowActive = newSubscriptionStatus === 'active' && newPaidUntil && new Date(newPaidUntil) > new Date()
        
        await authStore.refreshSubscriptionStatus(true)
        
        if (!wasActive && isNowActive) {
          showToast('✅ تم تفعيل اشتراكك بنجاح! شكراً لثقتك بنا', 'success')
        } else if (wasActive && !isNowActive) {
          showToast('⚠️ انتهت صلاحية اشتراكك. يرجى التجديد للاستمرار في استخدام النظام', 'error')
          if (route.path !== '/subscription-expired') {
            router.push('/subscription-expired')
          }
        }
      }
    )
    .subscribe()
}

// Watchers (unchanged, but ensure they only run after initial load)
watch(
  () => authStore.currentTenantId,
  (newTenantId) => {
    if (newTenantId && authStore.isAuthenticated && authStore.isFullyReady) {
      setupSubscriptionListener()
    }
  }
)

watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated && authStore.currentTenantId && authStore.isFullyReady) {
      setupSubscriptionListener()
    } else if (!isAuthenticated && authStore.isFullyReady) {
      await nextTick()
      if (route.path !== '/login' && route.path !== '/landing') {
        router.push('/login')
      }
    }
  }
)

watch(
  () => authStore.tenantTrialExpired,
  (isExpired) => {
    if (isExpired && authStore.isAuthenticated && !authStore.isSuperAdmin && authStore.isFullyReady) {
      if (route.path !== '/trial-expired') {
        showToast('انتهت الفترة التجريبية للشركة. يرجى التواصل مع الدعم للترقية.', 'error')
        router.push('/trial-expired')
      }
    }
  }
)

watch(
  () => authStore.isUserTrialExpired,
  (isExpired) => {
    if (isExpired && authStore.isAuthenticated && !authStore.isSuperAdmin && authStore.isFullyReady) {
      if (route.path !== '/trial-expired') {
        showToast('انتهت الفترة التجريبية لحسابك. يرجى التواصل مع الدعم للترقية.', 'error')
        router.push('/trial-expired')
      }
    }
  }
)

watch(() => languageStore.direction, async (newDirection) => {
  await nextTick()
  document.documentElement.setAttribute('dir', newDirection)
  document.body.setAttribute('dir', newDirection)
  window.dispatchEvent(new Event('resize'))
})

// Dark mode
const applyDarkMode = (enabled: boolean) => {
  if (enabled) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('darkMode', 'enabled')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('darkMode', 'disabled')
  }
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  applyDarkMode(isDarkMode.value)
}

const loadDarkModePreference = () => {
  const saved = localStorage.getItem('darkMode')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (saved === 'enabled') {
    isDarkMode.value = true
  } else if (saved === 'disabled') {
    isDarkMode.value = false
  } else {
    isDarkMode.value = prefersDark
  }
  applyDarkMode(isDarkMode.value)
}

const handleLogout = async () => {
  try {
    if (subscriptionChannel) {
      supabase.removeChannel(subscriptionChannel)
      subscriptionChannel = null
    }
    await authStore.logout()
    if (window.location.pathname !== '/login') {
      router.push('/login')
    }
  } catch (error) {
    console.error('Logout error:', error)
    router.push('/login')
  }
}

const handleResize = () => {
  if (window.innerWidth >= 1024) {
    mobileMenuOpen.value = false
  }
}

watch(mobileMenuOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(async () => {
  loadDarkModePreference()
  window.addEventListener('resize', handleResize)
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  document.documentElement.setAttribute('dir', languageStore.direction)
  document.body.setAttribute('dir', languageStore.direction)

  supabaseService.setSubscriptionExpiredHandler(() => {
    if (route.path !== '/subscription-expired') {
      showToast('انتهى اشتراكك. يرجى التجديد للاستمرار في استخدام النظام.', 'error')
      router.push('/subscription-expired')
    }
  })

  supabaseService.setTrialExpiredHandler(() => {
    if (route.path !== '/trial-expired') {
      showToast('انتهت الفترة التجريبية. يرجى التواصل مع الدعم للترقية.', 'error')
      router.push('/trial-expired')
    }
  })

  // Start initial load with timeout & network detection
  await attemptInitialLoad()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  if (subscriptionChannel) {
    supabase.removeChannel(subscriptionChannel)
    subscriptionChannel = null
  }
  if (loadingTimeout) clearTimeout(loadingTimeout)
})
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

html[dir="rtl"],
body[dir="rtl"] {
  direction: rtl;
}

html[dir="ltr"],
body[dir="ltr"] {
  direction: ltr;
}

body {
  overflow-x: hidden;
  overflow-y: auto;
  font-size: 16px;
  font-weight: 400;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  scroll-behavior: smooth;
}

.dark {
  color-scheme: dark;
}

/* Content card styling – strong separation from background */
.content-card {
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  backdrop-filter: blur(0px);
}

.main-content-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

@media (min-width: 1280px) {
  .main-content-container {
    max-width: 1400px;
  }
}

@media (min-width: 1600px) {
  .main-content-container {
    max-width: 1600px;
  }
}

/* Scrollbar styling (unchanged) */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #e2e8f0;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 10px;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

.dark ::-webkit-scrollbar-track {
  background: #1e293b;
}

.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Smooth transitions */
* {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

@media (max-width: 1023px) {
  .fixed.inset-0 {
    z-index: 40;
  }
}

body.sidebar-open {
  overflow: hidden;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>
