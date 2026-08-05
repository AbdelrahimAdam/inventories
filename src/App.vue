<template>
  <InstallPrompt ref="installPromptRef" />

  <!-- Loading with timeout + offline detection -->
  <LoadingSpinner
    v-if="!authStore.isFullyReady && !showNetworkError"
    :full-screen="true"
    :text="isRTL ? 'جاري التحميل...' : 'Loading...'"
    :subtext="!isOnline && !showNetworkError ? (isRTL ? '⚠️ لا يوجد اتصال بالإنترنت' : '⚠️ No internet connection') : ''"
    size="md"
    color="primary"
  />

  <!-- Network error + retry screen -->
  <div v-if="showNetworkError" class="error-overlay">
    <div class="error-content">
      <div class="error-icon-wrapper">
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="error-title">{{ isRTL ? 'تعذر تحميل التطبيق' : 'Failed to load app' }}</h3>
      <p class="error-message">{{ isRTL ? 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى' : 'Please check your internet connection and try again' }}</p>
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
      v-else-if="authStore.isAuthenticated && !isUserExpired"
      :dir="languageStore.direction"
      :lang="languageStore.current"
      class="app-layout-wrapper"
      :class="[
        languageStore.direction === 'rtl' ? 'rtl-mode' : 'ltr-mode',
        'bg-gradient-to-br from-amber-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'
      ]"
    >
      <!-- Mobile Overlay -->
      <div
        v-if="mobileMenuOpen"
        class="mobile-overlay"
        @click="mobileMenuOpen = false"
      ></div>

      <!-- Sidebar -->
      <AppSidebar
        :is-mobile-open="mobileMenuOpen"
        :is-rtl="languageStore.direction === 'rtl'"
        @close-mobile="closeSidebar"
      />

      <!-- Content Area -->
      <div class="content-area">
        <AppHeader
          @toggle-sidebar="toggleSidebar"
          @logout="handleLogout"
          @toggle-dark-mode="toggleDarkMode"
          :is-dark-mode="isDarkMode"
          :is-rtl="languageStore.direction === 'rtl'"
        />

        <main class="main-content">
          <div class="content-container">
            <div class="content-wrapper">
              <!-- View-only banner -->
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

              <keep-alive :include="['inventory-items', 'dashboard-home', 'warehouse-manager-dashboard', 'admin-dashboard', 'viewer-dashboard', 'super-admin-dashboard']">
                <router-view :key="authStore.user?.id" />
              </keep-alive>
            </div>
          </div>
        </main>

        <!-- Bottom navigation - mobile only -->
        <div class="bottom-nav-wrapper">
          <BottomNav @open-sidebar="openSidebar" />
        </div>
      </div>
    </div>

    <div v-else-if="authStore.isAuthenticated && isUserExpired" class="min-h-screen">
      <router-view />
    </div>
  </template>

  <!-- Toast notifications -->
  <div class="toast-container">
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

const isUserExpired = computed(() => {
  if (!authStore.isAuthenticated || authStore.isSuperAdmin) return false
  return authStore.tenantTrialExpired || authStore.isUserTrialExpired || !authStore.isSubscriptionActive
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
  if (loadingTimeout) clearTimeout(loadingTimeout)
  if (loadingTimeInterval) clearInterval(loadingTimeInterval)
})
</script>

<style>
/* ===== RESET & BASE ===== */
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

/* ===== SCROLLBAR - THINNER FOR MOBILE ===== */
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

/* Firefox scrollbar - thin */
* {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.dark * {
  scrollbar-color: #475569 transparent;
}

/* ===== ERROR OVERLAY ===== */
.error-overlay {
  position: fixed;
  inset: 0;
  background: white;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.dark .error-overlay {
  background: #111827;
}

.error-content {
  text-align: center;
  max-width: 28rem;
  width: 100%;
  padding: 1.5rem;
}

.error-icon-wrapper {
  width: 5rem;
  height: 5rem;
  margin: 0 auto 1.25rem;
  background: #fee2e2;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .error-icon-wrapper {
  background: #7f1d1d;
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
  color: #dc2626;
}

.dark .error-icon {
  color: #f87171;
}

@media (min-width: 640px) {
  .error-icon {
    width: 3rem;
    height: 3rem;
  }
}

.error-title {
  font-size: 1.25rem;
  font-weight: 900;
  color: #111827;
  margin-block-end: 0.5rem;
}

.dark .error-title {
  color: white;
}

@media (min-width: 640px) {
  .error-title {
    font-size: 1.625rem;
  }
}

.error-message {
  color: #4b5563;
  margin-block-end: 1.5rem;
  font-size: 0.9375rem;
}

.dark .error-message {
  color: #d1d5db;
}

.retry-button {
  min-height: 44px;
  padding: 0.625rem 1.75rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  transition: all 0.2s;
  cursor: pointer;
  touch-action: manipulation;
}

.retry-button:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  transform: scale(1.03);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

.retry-button:active {
  transform: scale(0.97);
}

/* ===== APP LAYOUT ===== */
.app-layout-wrapper {
  height: 100vh;
  display: flex;
  transition: background-color 0.3s ease;
  overflow: hidden;
  will-change: auto;
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

/* ===== MOBILE OVERLAY ===== */
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

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: auto;
  will-change: scroll-position;
}

@media (min-width: 640px) {
  .main-content {
    padding: 0.75rem;
  }
}

@media (min-width: 1024px) {
  .main-content {
    padding: 1rem 1.5rem;
  }
}

.content-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  padding: 0.75rem;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 80rem;
  margin-inline: auto;
  padding-top: env(safe-area-inset-top, 0.75rem);
  padding-bottom: env(safe-area-inset-bottom, 0.75rem);
  padding-inline: env(safe-area-inset-right, 0.75rem) env(safe-area-inset-left, 0.75rem);
  will-change: transform;
}

.dark .content-container {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

@media (min-width: 640px) {
  .content-container {
    padding: 1rem;
  }
}

@media (min-width: 1024px) {
  .content-container {
    padding: 1.5rem;
    border-radius: 1.25rem;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
  }
}

.content-wrapper {
  width: 100%;
}

/* ===== VIEW-ONLY BANNER ===== */
.view-only-banner {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fcd34d;
  border-radius: 0.75rem;
  padding: 0.625rem 1rem;
  margin-block-end: 0.75rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
}

@media (min-width: 640px) {
  .view-only-banner {
    align-items: center;
    padding: 0.75rem 1.25rem;
  }
}

.dark .view-only-banner {
  background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
  border-color: #a16207;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.banner-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #d97706;
  flex-shrink: 0;
  margin-block-start: 0.125rem;
}

@media (min-width: 640px) {
  .banner-icon {
    margin-block-start: 0;
  }
}

.dark .banner-icon {
  color: #fbbf24;
}

.banner-text {
  font-size: 0.875rem;
  font-weight: 700;
  color: #78350f;
  line-height: 1.5;
}

.dark .banner-text {
  color: #fbbf24;
}

/* ===== BOTTOM NAV ===== */
.bottom-nav-wrapper {
  flex-shrink: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

@media (min-width: 1024px) {
  .bottom-nav-wrapper {
    display: none;
  }
}

/* ===== TOAST NOTIFICATIONS ===== */
.toast-container {
  position: fixed;
  bottom: 5.5rem;
  inset-inline-end: 0.75rem;
  inset-inline-start: 0.75rem;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 28rem;
  width: 100%;
  margin-inline: auto;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  pointer-events: none;
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
  border: 1px solid rgba(255, 255, 255, 0.15);
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

@media (min-width: 640px) {
  .toast-container {
    bottom: 1.5rem;
    inset-inline-end: 1.5rem;
    inset-inline-start: auto;
    margin-inline: 0;
  }
}

@media (min-width: 1024px) {
  .toast-container {
    bottom: 2rem;
    inset-inline-end: 2rem;
  }
}

/* ===== ANIMATIONS ===== */
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

/* ===== RTL SPECIFIC ADJUSTMENTS ===== */
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

.rtl-mode .view-only-banner {
  flex-direction: row-reverse;
}

.rtl-mode .toast-message {
  flex-direction: row-reverse;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 640px) {
  .content-container {
    border-radius: 0.75rem;
    padding: 0.5rem;
  }
  
  .view-only-banner {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
  
  .toast-message {
    padding: 0.75rem;
    border-radius: 0.625rem;
  }
}

/* ===== TOUCH IMPROVEMENTS ===== */
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

/* ===== DARK MODE ENHANCEMENTS ===== */
.dark .content-container {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.dark .view-only-banner {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* ===== TEXT GRADIENT ===== */
.text-gradient {
  background: linear-gradient(135deg, #f59e0b 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .text-gradient {
  background: linear-gradient(135deg, #fbbf24 0%, #34d399 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ===== SAFE AREA FALLBACKS ===== */
@supports (padding: env(safe-area-inset-top)) {
  .content-container {
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

/* ===== PERFORMANCE OPTIMIZATIONS ===== */
.main-content,
.content-container {
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