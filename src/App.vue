<template>
  <InstallPrompt ref="installPromptRef" />

  <LoadingSpinner
    v-if="!authStore.isFullyReady && !showNetworkError && !isLoggingOut"
    :full-screen="true"
    :text="isRTL ? 'جاري التحميل...' : 'Loading...'"
    :subtext="!isOnline && !showNetworkError ? (isRTL ? '⚠️ لا يوجد اتصال بالإنترنت' : '⚠️ No internet connection') : ''"
    size="md"
    color="primary"
  />

  <div v-if="showNetworkError" class="error-overlay">
    <div class="error-content">
      <div class="error-icon-wrapper">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="8" y="4" width="8" height="16" rx="2" stroke="currentColor" />
          <rect x="10" y="2" width="4" height="4" rx="1" stroke="currentColor" />
          <circle cx="12" cy="16" r="2" stroke="currentColor" />
          <path d="M6 20C6 20 6 18 8 18" stroke="currentColor" stroke-linecap="round" />
          <path d="M18 20C18 20 18 18 16 18" stroke="currentColor" stroke-linecap="round" />
          <path d="M4 22C4 22 4 19 7 19" stroke="currentColor" stroke-linecap="round" stroke-width="1" />
          <path d="M20 22C20 22 20 19 17 19" stroke="currentColor" stroke-linecap="round" stroke-width="1" />
        </svg>
      </div>
      <h3 class="error-title">{{ isRTL ? 'تعذر تحميل التطبيق' : 'Failed to load app' }}</h3>
      <p class="error-message">
        {{ isRTL 
          ? 'عطرك المفضل ينتظرك، لكن الاتصال بالإنترنت مفقود. يرجى التحقق من اتصالك بالشبكة والمحاولة مرة أخرى.' 
          : 'Your favorite fragrance awaits, but the connection is missing. Please check your internet connection and try again.' 
        }}
      </p>
      <button @click="retryInitialLoad" class="retry-button">
        {{ isRTL ? 'إعادة المحاولة' : 'Retry' }}
      </button>
    </div>
  </div>

  <template v-else>
    <div v-if="!authStore.isAuthenticated || isPublicPage" class="min-h-screen">
      <router-view />
    </div>

    <div
      v-else-if="authStore.isAuthenticated"
      :dir="languageStore.direction"
      :lang="languageStore.current"
      class="app-layout-wrapper"
      :class="[
        languageStore.direction === 'rtl' ? 'rtl-mode' : 'ltr-mode',
        isDarkMode ? 'dark-mode' : 'light-mode',
        'bg-gradient-to-br from-amber-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'
      ]"
    >
      <div
        v-if="mobileMenuOpen"
        class="mobile-overlay"
        @click="mobileMenuOpen = false"
      ></div>

      <AppSidebar
        :is-mobile-open="mobileMenuOpen"
        :is-rtl="languageStore.direction === 'rtl'"
        @close-mobile="closeSidebar"
      />

      <div class="content-area">
        <AppHeader
          @toggle-sidebar="toggleSidebar"
          @logout="handleLogout"
          @toggle-dark-mode="toggleDarkMode"
          :is-dark-mode="isDarkMode"
          :is-rtl="languageStore.direction === 'rtl'"
        />

        <main class="main-content">
          <div class="container-premium">
            <div class="content-wrapper">
              <div 
                v-if="authStore.isViewOnly" 
                class="view-only-banner"
              >
                <svg class="banner-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span class="banner-text">
                  ⚠️ {{ isRTL ? 'أنت في وضع العرض فقط. لا يمكنك إضافة أو تعديل أو حذف البيانات' : 'You are in view‑only mode. You cannot add, edit, or delete data.' }}
                </span>
              </div>

              <div 
                v-if="!authStore.isSuperAdmin && !authStore.isSubscriptionActive && authStore.isFullyReady" 
                class="subscription-expired-banner"
              >
                <svg class="banner-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="banner-text">
                  ⚠️ {{ isRTL ? 'انتهت صلاحية اشتراكك. يرجى التجديد للاستمرار في استخدام النظام.' : 'Your subscription has expired. Please renew to continue using the system.' }}
                </span>
                <router-link to="/subscription-expired" class="banner-link">
                  {{ isRTL ? 'تجديد الاشتراك' : 'Renew Subscription' }}
                </router-link>
              </div>

              <div 
                v-if="!authStore.isSuperAdmin && authStore.tenantTrialExpired && authStore.isFullyReady" 
                class="trial-expired-banner"
              >
                <svg class="banner-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="banner-text">
                  ⚠️ {{ isRTL ? 'انتهت الفترة التجريبية للشركة. يرجى التواصل مع الدعم للترقية.' : 'Company trial period has expired. Please contact support to upgrade.' }}
                </span>
                <router-link to="/trial-expired" class="banner-link">
                  {{ isRTL ? 'ترقية' : 'Upgrade' }}
                </router-link>
              </div>

              <ErrorBoundary>
                <keep-alive :include="cachedComponents">
                  <router-view :key="routeKey" />
                </keep-alive>
              </ErrorBoundary>
            </div>
          </div>
        </main>

        <div v-if="!isInvoiceFormRoute && !isFullScreenRoute" class="bottom-nav-wrapper">
          <BottomNav @open-sidebar="openSidebar" />
        </div>
      </div>
    </div>
  </template>

  <div 
    class="toast-container" 
    role="status" 
    aria-live="polite"
    aria-atomic="true"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="[
        'toast-message',
        toast.type === 'success' ? 'toast-success' : 'toast-error'
      ]"
    >
      <svg v-if="toast.type === 'success'" class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <svg v-else class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="toast-text">{{ toast.message }}</span>
      <button @click="removeToast(toast.id)" class="toast-close" aria-label="إغلاق الإشعار">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'

const authStore = useAuthStore()
const languageStore = useLanguageStore()
const route = useRoute()
const router = useRouter()

const mobileMenuOpen = ref(false)
const isDarkMode = ref(false)
const installPromptRef = ref<InstanceType<typeof InstallPrompt> | null>(null)
const isOnline = ref(navigator.onLine)
const showNetworkError = ref(false)
const forceShowApp = ref(false)
const loadingTime = ref(0)
let loadingTimeout: ReturnType<typeof setTimeout> | null = null
let loadingTimeInterval: ReturnType<typeof setInterval> | null = null
let subscriptionChannel: any = null

const isLoggingOut = ref(false)

const routeKey = computed(() => {
  return authStore.user?.id || route.path
})

const cachedComponents = [
  'inventory-items',
  'dashboard-home',
  'warehouse-manager-dashboard',
  'admin-dashboard',
  'viewer-dashboard',
  'super-admin-dashboard'
]

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
  }, 4000)
}

const removeToast = (id: number) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

const isRTL = computed(() => languageStore.direction === 'rtl')

const isPublicPage = computed(() => {
  const publicPages = ['/', '/login', '/register', '/forgot-password', '/trial-expired', '/subscription-expired']
  return publicPages.includes(route.path)
})

const isInvoiceFormRoute = computed(() => {
  return route.path === '/invoices/new' || 
         route.path.startsWith('/invoices/edit') ||
         /^\/invoices\/(new|edit|\d+)$/.test(route.path)
})

const isFullScreenRoute = computed(() => {
  const fullScreenPages = ['/inventory/items/new', '/inventory/items/:id']
  return fullScreenPages.some(pattern => {
    if (pattern.includes(':id')) {
      return route.path.startsWith('/inventory/items/') && route.path !== '/inventory/items'
    }
    return route.path === pattern
  })
})

const toggleSidebar = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const openSidebar = () => {
  mobileMenuOpen.value = true
}

const closeSidebar = () => {
  mobileMenuOpen.value = false
}

const handleOnline = () => {
  isOnline.value = true
  showToast(isRTL.value ? '✅ تم استعادة الاتصال بالإنترنت' : '✅ Internet connection restored', 'success')
  if (!authStore.isFullyReady && !showNetworkError.value) {
    retryInitialLoad()
  }
}

const handleOffline = () => {
  isOnline.value = false
  showToast(isRTL.value ? '⚠️ انقطع الاتصال بالإنترنت' : '⚠️ Internet connection lost', 'error')
}

const retryInitialLoad = async () => {
  if (loadingTimeout) clearTimeout(loadingTimeout)
  if (loadingTimeInterval) clearInterval(loadingTimeInterval)
  showNetworkError.value = false
  loadingTime.value = 0
  await attemptInitialLoad()
}

const attemptInitialLoad = async () => {
  loadingTimeout = setTimeout(() => {
    if (!authStore.isFullyReady) {
      showNetworkError.value = true
      loadingTimeout = null
      if (loadingTimeInterval) clearInterval(loadingTimeInterval)
    }
  }, 15000)

  loadingTimeInterval = setInterval(() => {
    loadingTime.value += 1
    if (loadingTime.value >= 12 && !authStore.isFullyReady && !showNetworkError.value) {
      forceShowApp.value = true
      if (loadingTimeInterval) clearInterval(loadingTimeInterval)
    }
  }, 1000)

  try {
    await authStore.initialize()
    if (loadingTimeInterval) clearInterval(loadingTimeInterval)
  } catch (error) {
    console.error('Initial load failed:', error)
    if (!authStore.isFullyReady) {
      showNetworkError.value = true
      if (loadingTimeInterval) clearInterval(loadingTimeInterval)
    }
  } finally {
    if (loadingTimeout) clearTimeout(loadingTimeout)
  }
}

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
        }
      }
    )
    .subscribe()
}

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
      if (route.path !== '/login' && route.path !== '/') {
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
        showToast('⚠️ انتهت الفترة التجريبية للشركة. يرجى التواصل مع الدعم للترقية.', 'error')
      }
    }
  }
)

watch(
  () => authStore.isUserTrialExpired,
  (isExpired) => {
    if (isExpired && authStore.isAuthenticated && !authStore.isSuperAdmin && authStore.isFullyReady) {
      if (route.path !== '/trial-expired') {
        showToast('⚠️ انتهت الفترة التجريبية لحسابك. يرجى التواصل مع الدعم للترقية.', 'error')
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
  
  if (saved === 'enabled') {
    isDarkMode.value = true
  } else if (saved === 'disabled') {
    isDarkMode.value = false
  } else {
    isDarkMode.value = true
  }
  applyDarkMode(isDarkMode.value)
}

const handleLogout = async () => {
  isLoggingOut.value = true
  
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
  } finally {
    isLoggingOut.value = false
  }
}

const handleResize = () => {
  if (window.innerWidth >= 1024 && mobileMenuOpen.value) {
    mobileMenuOpen.value = false
  }
}

watch(mobileMenuOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
  } else {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
  }
})

const clearAllIntervals = () => {
  if (loadingTimeout) {
    clearTimeout(loadingTimeout)
    loadingTimeout = null
  }
  if (loadingTimeInterval) {
    clearInterval(loadingTimeInterval)
    loadingTimeInterval = null
  }
}

onMounted(async () => {
  loadDarkModePreference()
  window.addEventListener('resize', handleResize)
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  document.documentElement.setAttribute('dir', languageStore.direction)
  document.body.setAttribute('dir', languageStore.direction)

  supabaseService.setSubscriptionExpiredHandler(() => {
    if (route.path !== '/subscription-expired') {
      showToast('⚠️ انتهى اشتراكك. يرجى التجديد للاستمرار في استخدام النظام.', 'error')
    }
  })

  supabaseService.setTrialExpiredHandler(() => {
    if (route.path !== '/trial-expired') {
      showToast('⚠️ انتهت الفترة التجريبية. يرجى التواصل مع الدعم للترقية.', 'error')
    }
  })

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
  clearAllIntervals()
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

html {
  scroll-behavior: smooth;
  scrollbar-gutter: stable;
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
  -webkit-tap-highlight-color: transparent;
  -webkit-overflow-scrolling: touch;
}

.dark {
  color-scheme: dark;
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

* {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.dark * {
  scrollbar-color: #475569 transparent;
}

.error-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.error-content {
  text-align: center;
  max-width: 28rem;
  width: 100%;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.error-icon-wrapper {
  width: 5rem;
  height: 5rem;
  margin: 0 auto 1.25rem;
  background: rgba(212, 165, 116, 0.1);
  border: 1px solid rgba(212, 165, 116, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40px rgba(212, 165, 116, 0.05);
}

@media (min-width: 640px) {
  .error-icon-wrapper {
    width: 6rem;
    height: 6rem;
  }
}

.error-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #d4a574;
}

@media (min-width: 640px) {
  .error-icon {
    width: 3rem;
    height: 3rem;
  }
}

.error-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #d4a574;
  margin-bottom: 0.75rem;
  letter-spacing: 0.5px;
  text-align: center;
}

@media (min-width: 640px) {
  .error-title {
    font-size: 1.625rem;
  }
}

.error-message {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.75rem;
  font-size: 0.875rem;
  line-height: 1.6;
  max-width: 400px;
  text-align: center;
}

.retry-button {
  min-height: 44px;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #d4a574, #b8915a);
  color: #1a1a2e;
  border: none;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.875rem;
  box-shadow: 0 4px 20px rgba(212, 165, 116, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  touch-action: manipulation;
  min-width: 140px;
}

.retry-button:hover {
  background: linear-gradient(135deg, #e0b88a, #c9a06a);
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(212, 165, 116, 0.4);
}

.retry-button:active {
  transform: scale(0.97);
}

.app-layout-wrapper {
  height: 100vh;
  display: flex;
  transition: background-color 0.3s ease;
  overflow: hidden;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: opacity 0.3s ease;
  z-index: 40;
  touch-action: manipulation;
}

@media (min-width: 1024px) {
  .mobile-overlay {
    display: none;
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

@media (max-width: 1023px) {
  .main-content {
    padding-bottom: calc(64px + 0.5rem);
  }
}

@media (min-width: 640px) {
  .main-content {
    padding: 0.75rem;
  }
  @media (max-width: 1023px) {
    .main-content {
      padding-bottom: calc(64px + 0.75rem);
    }
  }
}

@media (min-width: 1024px) {
  .main-content {
    padding: 1rem 1.5rem;
  }
}

/* ============================================
   ✅ UPDATED: CONTAINER WITH BETTER BORDERS
   ============================================ */
.container-premium {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  border: 2px solid #d1d5db;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 80rem;
  margin-inline: auto;
  min-height: calc(100% - 1rem);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.container-premium::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.02) 0%, transparent 50%, rgba(212, 165, 116, 0.01) 100%);
  pointer-events: none;
  border-radius: inherit;
}

.container-premium:hover {
  border-color: #b8915a;
  box-shadow: 0 8px 32px rgba(212, 165, 116, 0.06), 0 4px 16px rgba(0, 0, 0, 0.06);
}

@media (max-width: 1023px) {
  .container-premium {
    margin-bottom: 0.5rem;
  }
}

.dark .container-premium {
  background: rgba(31, 41, 55, 0.95);
  border-color: #4b5563;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2);
}

.dark .container-premium::before {
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.02) 0%, transparent 50%, rgba(212, 165, 116, 0.01) 100%);
}

.dark .container-premium:hover {
  border-color: #6b7280;
  box-shadow: 0 8px 32px rgba(212, 165, 116, 0.08), 0 4px 16px rgba(0, 0, 0, 0.3);
}

@media (min-width: 640px) {
  .container-premium {
    padding: 1rem;
  }
  @media (max-width: 1023px) {
    .container-premium {
      min-height: calc(100% - 0.5rem);
    }
  }
}

@media (min-width: 1024px) {
  .container-premium {
    padding: 1.5rem;
    border-radius: 1.25rem;
    border-width: 2px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04);
    min-height: calc(100% - 1rem);
  }
}

.dark .container-premium {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2);
}

.content-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ============================================
   ✅ UPDATED: BANNERS WITH BETTER BORDERS
   ============================================ */
.view-only-banner,
.subscription-expired-banner,
.trial-expired-banner {
  border-radius: 0.75rem;
  padding: 0.625rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  flex-shrink: 0;
  border-width: 2px;
}

.view-only-banner {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
}

.dark .view-only-banner {
  background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
  border-color: #a16207;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.subscription-expired-banner {
  background: linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%);
  border: 2px solid #dc2626;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15);
}

.dark .subscription-expired-banner {
  background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
  border-color: #dc2626;
}

.trial-expired-banner {
  background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
  border: 2px solid #d97706;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
}

.dark .trial-expired-banner {
  background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
  border-color: #b45309;
}

.banner-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.view-only-banner .banner-icon {
  color: #d97706;
}
.dark .view-only-banner .banner-icon {
  color: #fbbf24;
}
.subscription-expired-banner .banner-icon {
  color: #dc2626;
}
.dark .subscription-expired-banner .banner-icon {
  color: #f87171;
}
.trial-expired-banner .banner-icon {
  color: #d97706;
}
.dark .trial-expired-banner .banner-icon {
  color: #fbbf24;
}

.banner-text {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.5;
  min-width: 150px;
}

.view-only-banner .banner-text {
  color: #78350f;
}
.dark .view-only-banner .banner-text {
  color: #fbbf24;
}
.subscription-expired-banner .banner-text {
  color: #991b1b;
}
.dark .subscription-expired-banner .banner-text {
  color: #fca5a5;
}
.trial-expired-banner .banner-text {
  color: #78350f;
}
.dark .trial-expired-banner .banner-text {
  color: #fbbf24;
}

.banner-link {
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.25);
  color: inherit;
  text-decoration: none;
  transition: background 0.2s;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.banner-link:hover {
  background: rgba(255, 255, 255, 0.4);
}

.dark .banner-link {
  background: rgba(255, 255, 255, 0.15);
}
.dark .banner-link:hover {
  background: rgba(255, 255, 255, 0.25);
}

.bottom-nav-wrapper {
  flex-shrink: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  position: sticky;
  bottom: 0;
  z-index: 30;
  background: inherit;
}

@media (min-width: 1024px) {
  .bottom-nav-wrapper {
    display: none;
  }
}

/* ============================================
   ✅ UPDATED: TOAST WITH BETTER BORDERS
   ============================================ */
.toast-container {
  position: fixed;
  bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px));
  inset-inline-end: 0.75rem;
  inset-inline-start: 0.75rem;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 28rem;
  width: 100%;
  margin-inline: auto;
  pointer-events: none;
}

@media (min-width: 640px) {
  .toast-container {
    bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
    inset-inline-end: 1.5rem;
    inset-inline-start: auto;
    margin-inline: 0;
  }
}

@media (min-width: 1024px) {
  .toast-container {
    bottom: calc(2rem + env(safe-area-inset-bottom, 0px));
    inset-inline-end: 2rem;
  }
}

.toast-message {
  pointer-events: auto;
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transform: translateX(0);
  opacity: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideIn 0.3s ease-out;
  min-height: 52px;
  border: 2px solid rgba(255, 255, 255, 0.25);
}

.toast-success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.toast-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.toast-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.toast-text {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.5;
}

.toast-close {
  min-width: 2.5rem;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: background 0.2s;
  touch-action: manipulation;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.toast-close:focus {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInRTL {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.rtl-mode .toast-container {
  inset-inline-start: 0.75rem;
  inset-inline-end: auto;
}

@media (min-width: 640px) {
  .rtl-mode .toast-container {
    inset-inline-start: 1.5rem;
    inset-inline-end: auto;
  }
}

@media (min-width: 1024px) {
  .rtl-mode .toast-container {
    inset-inline-start: 2rem;
    inset-inline-end: auto;
  }
}

.rtl-mode .toast-message {
  animation: slideInRTL 0.3s ease-out;
}

.rtl-mode .view-only-banner,
.rtl-mode .subscription-expired-banner,
.rtl-mode .trial-expired-banner {
  flex-direction: row-reverse;
}

.rtl-mode .toast-message {
  flex-direction: row-reverse;
}

@media (max-width: 640px) {
  .container-premium {
    border-radius: 0.75rem;
    padding: 0.5rem;
    border-width: 2px;
  }
  
  .view-only-banner,
  .subscription-expired-banner,
  .trial-expired-banner {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
    border-width: 2px;
  }
  
  .toast-message {
    padding: 0.75rem;
    border-radius: 0.625rem;
    border-width: 2px;
  }
  
  .banner-text {
    font-size: 0.75rem;
  }
  
  .banner-link {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
    min-height: 32px;
  }
}

button,
[role="button"],
.touch-target {
  min-height: 44px;
  min-width: 44px;
  touch-action: manipulation;
}

@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
}

@supports (padding: env(safe-area-inset-top)) {
  .container-premium {
    padding-top: env(safe-area-inset-top, 0.75rem);
    padding-bottom: env(safe-area-inset-bottom, 0.75rem);
    padding-left: env(safe-area-inset-left, 0.75rem);
    padding-right: env(safe-area-inset-right, 0.75rem);
  }
  
  .bottom-nav-wrapper {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  
  .toast-container {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
}

.main-content {
  transform: translateZ(0);
  backface-visibility: hidden;
}

.content-wrapper {
  contain: layout style paint;
}

* {
  text-rendering: optimizeLegibility;
}
</style>