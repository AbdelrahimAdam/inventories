<template>
  <InstallPrompt ref="installPromptRef" />

  <!-- Enhanced loading screen with timeout, offline detection, and retry -->
  <div v-if="!authReady" class="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
    <div class="text-center max-w-sm mx-auto px-4">
      <div v-if="loadState.status === 'loading'" class="flex flex-col items-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400 text-base">{{ isRTL ? 'جاري التحميل...' : 'Loading...' }}</p>
        <p v-if="loadState.startTime && Date.now() - loadState.startTime > 5000" class="mt-2 text-xs text-gray-400">
          {{ isRTL ? 'قد يستغرق هذا وقتًا أطول من المعتاد' : 'This may take longer than usual' }}
        </p>
      </div>

      <div v-else-if="loadState.status === 'offline'" class="flex flex-col items-center">
        <svg class="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636L5.636 18.364m0-12.728l12.728 12.728" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16h.01M12 16h.01M16 16h.01" />
        </svg>
        <p class="text-red-600 dark:text-red-400 font-semibold">{{ isRTL ? 'لا يوجد اتصال بالإنترنت' : 'No internet connection' }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ isRTL ? 'يرجى التحقق من اتصالك والمحاولة مرة أخرى' : 'Please check your connection and try again' }}</p>
        <button @click="retryAuth" class="mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors">
          {{ isRTL ? 'إعادة المحاولة' : 'Retry' }}
        </button>
      </div>

      <div v-else-if="loadState.status === 'timeout'" class="flex flex-col items-center">
        <svg class="w-16 h-16 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-yellow-700 dark:text-yellow-400 font-semibold">{{ isRTL ? 'انتهت مهلة التحميل' : 'Loading timeout' }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ isRTL ? 'قد تكون الشبكة بطيئة أو غير مستقرة' : 'Network may be slow or unstable' }}</p>
        <button @click="retryAuth" class="mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors">
          {{ isRTL ? 'إعادة المحاولة' : 'Retry' }}
        </button>
      </div>

      <div v-else-if="loadState.status === 'error'" class="flex flex-col items-center">
        <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-red-600 dark:text-red-400 font-semibold">{{ isRTL ? 'خطأ في التحميل' : 'Loading error' }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ loadState.errorMsg || (isRTL ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred') }}</p>
        <button @click="retryAuth" class="mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors">
          {{ isRTL ? 'إعادة المحاولة' : 'Retry' }}
        </button>
      </div>
    </div>
  </div>

  <template v-else>
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
      class="h-screen flex overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-white dark:from-gray-800 dark:via-amber-900/20 dark:to-gray-900"
      :class="{ 'rtl': languageStore.direction === 'rtl' }"
    >
      <!-- Mobile overlay -->
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 bg-black/50 transition-opacity duration-300 lg:hidden"
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

      <!-- Main content area -->
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
          <!-- Professional content card with reduced transitions -->
          <div class="content-card bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-200">
            <div class="main-content-container">
              <div 
                v-if="authStore.isViewOnly" 
                class="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 mb-4 flex items-center gap-2"
              >
                <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span class="text-sm text-yellow-800 dark:text-yellow-300">
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

  <!-- Toast notifications (unstructured but efficient) -->
  <div class="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-4 z-[10001] flex flex-col gap-2">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="[
        'p-4 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 animate-slide-in',
        toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      ]"
    >
      <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="flex-1 text-sm font-medium">{{ toast.message }}</span>
      <button @click="removeToast(toast.id)" class="text-white hover:text-gray-200 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed, shallowRef } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { useRoute, useRouter } from 'vue-router'
import { supabase, supabaseService } from '@/services/supabase'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import InstallPrompt from '@/components/common/InstallPrompt.vue'

// -------------------- Stores & Helpers --------------------
const authStore = useAuthStore()
const languageStore = useLanguageStore()
const route = useRoute()
const router = useRouter()

// -------------------- Reactive State --------------------
const mobileMenuOpen = ref(false)
const isDarkMode = ref(false)
const installPromptRef = ref<InstanceType<typeof InstallPrompt> | null>(null)

let subscriptionChannel: any = null
let authTimeoutId: number | null = null
let onlineOfflineHandler: ((e: Event) => void) | null = null

// Enhanced loading state
const loadState = ref<{
  status: 'loading' | 'timeout' | 'offline' | 'error' | 'ready'
  startTime: number | null
  errorMsg: string | null
}>({
  status: 'loading',
  startTime: null,
  errorMsg: null
})

// Toast system using shallowRef for performance (avoid deep reactivity on array)
const toasts = shallowRef<Array<{ id: number; message: string; type: 'success' | 'error' }>>([])
let nextToastId = 0

// Computed helpers
const isRTL = computed(() => languageStore.direction === 'rtl')
const authReady = computed(() => loadState.value.status === 'ready' && authStore.isFullyReady)

const isPublicErrorPage = computed(() => {
  const publicErrorRoutes = ['subscription-expired', 'trial-expired']
  return publicErrorRoutes.includes(route.name as string)
})

// -------------------- Toast Management --------------------
const showToast = (message: string, type: 'success' | 'error') => {
  const id = nextToastId++
  toasts.value = [...toasts.value, { id, message, type }]
  setTimeout(() => removeToast(id), 5000)
}

const removeToast = (id: number) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

// -------------------- Dark Mode --------------------
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
  if (saved === 'enabled') isDarkMode.value = true
  else if (saved === 'disabled') isDarkMode.value = false
  else isDarkMode.value = prefersDark
  applyDarkMode(isDarkMode.value)
}

// -------------------- Subscription Setup (Singleton) --------------------
const setupSubscriptionListener = () => {
  // Clean up existing before creating new
  if (subscriptionChannel) {
    supabase.removeChannel(subscriptionChannel).catch(console.warn)
    subscriptionChannel = null
  }

  const tenantId = authStore.currentTenantId
  if (!tenantId || !authStore.isAuthenticated || !authStore.isFullyReady) return

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
        const wasActive = authStore.isSubscriptionActive
        const isNowActive = payload.new.subscription_status === 'active' &&
                            payload.new.paid_until &&
                            new Date(payload.new.paid_until) > new Date()

        await authStore.refreshSubscriptionStatus(true)

        if (!wasActive && isNowActive) {
          showToast('✅ تم تفعيل اشتراكك بنجاح! شكراً لثقتك بنا', 'success')
        } else if (wasActive && !isNowActive) {
          showToast('⚠️ انتهت صلاحية اشتراكك. يرجى التجديد للاستمرار في استخدام النظام', 'error')
          if (route.path !== '/subscription-expired') router.push('/subscription-expired')
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') console.log('✅ Subscription channel active')
      else if (status === 'CLOSED') console.log('🔴 Subscription channel closed')
    })
}

// -------------------- Auth Initialization with Timeout & Retry --------------------
const retryAuth = async () => {
  // Reset load state
  if (authTimeoutId) clearTimeout(authTimeoutId)
  loadState.value = { status: 'loading', startTime: Date.now(), errorMsg: null }
  await initializeAuth()
}

const initializeAuth = async (): Promise<void> => {
  try {
    // Check online status immediately
    if (!navigator.onLine) {
      loadState.value = { status: 'offline', startTime: null, errorMsg: null }
      return
    }

    loadState.value = { status: 'loading', startTime: Date.now(), errorMsg: null }

    // Race between auth initialization and timeout
    const authPromise = authStore.initializeAuth()  // assume store has this method; if not, we can use a wrapper
    // If your auth store doesn't have initializeAuth, fallback to refreshing session:
    // const authPromise = authStore.refreshSession().catch(() => authStore.checkUser())
    // For safety, we'll use a default that resolves when isFullyReady becomes true via watcher.
    // Better: use authStore.init() if exists, else wait for isFullyReady.
    // We'll implement a watcher-based promise.

    let resolveAuth: (value: boolean) => void
    let rejectAuth: (reason?: any) => void
    const authDone = new Promise<boolean>((resolve, reject) => {
      resolveAuth = resolve
      rejectAuth = reject
      const stopWatch = watch(
        () => authStore.isFullyReady,
        (ready) => {
          if (ready) {
            stopWatch()
            resolveAuth(true)
          }
        },
        { immediate: true }
      )
      // Also handle auth error
      const unwatchError = watch(
        () => authStore.error,
        (err) => {
          if (err && !authStore.isFullyReady) {
            stopWatch()
            unwatchError()
            rejectAuth(err)
          }
        }
      )
    })

    // Timeout after 15 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      authTimeoutId = window.setTimeout(() => {
        reject(new Error('AUTH_TIMEOUT'))
      }, 15000)
    })

    await Promise.race([authDone, timeoutPromise])
    if (authTimeoutId) clearTimeout(authTimeoutId)

    // Final check: if still offline after auth but network lost during process
    if (!navigator.onLine) {
      loadState.value = { status: 'offline', startTime: null, errorMsg: null }
      return
    }

    loadState.value = { status: 'ready', startTime: null, errorMsg: null }
    // Set up subscription only after auth is fully ready and authenticated
    if (authStore.isAuthenticated && authStore.currentTenantId) {
      setupSubscriptionListener()
    }
  } catch (err: any) {
    if (authTimeoutId) clearTimeout(authTimeoutId)
    if (err?.message === 'AUTH_TIMEOUT') {
      loadState.value = { status: 'timeout', startTime: null, errorMsg: null }
    } else {
      loadState.value = { status: 'error', startTime: null, errorMsg: err?.message || 'Unknown error' }
    }
    console.error('Auth initialization failed:', err)
  }
}

// -------------------- Online/Offline Handling --------------------
const handleOnlineStatus = () => {
  if (!authStore.isFullyReady && loadState.value.status !== 'ready') {
    retryAuth()
  } else if (!navigator.onLine) {
    loadState.value = { status: 'offline', startTime: null, errorMsg: null }
  } else if (navigator.onLine && loadState.value.status === 'offline') {
    retryAuth()
  }
}

// -------------------- Consolidated Watchers (optimized) --------------------
// Only one watcher for tenant+auth state to manage subscription
watch(
  () => [authStore.currentTenantId, authStore.isAuthenticated, authStore.isFullyReady],
  ([tenantId, isAuthenticated, isReady]) => {
    if (isReady && isAuthenticated && tenantId) {
      setupSubscriptionListener()
    } else if (!isAuthenticated && isReady) {
      // Clean up subscription when logged out
      if (subscriptionChannel) {
        supabase.removeChannel(subscriptionChannel).catch(console.warn)
        subscriptionChannel = null
      }
      // Redirect to login if not already on public page
      if (route.path !== '/login' && route.path !== '/landing') {
        router.push('/login')
      }
    }
  },
  { immediate: false }
)

// Watch for trial expiration (kept as before but can be merged if needed)
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

// Watch language direction changes and apply to document
watch(() => languageStore.direction, async (newDirection) => {
  await nextTick()
  document.documentElement.setAttribute('dir', newDirection)
  document.body.setAttribute('dir', newDirection)
  window.dispatchEvent(new Event('resize'))
})

// Watch mobile menu open/close to prevent body scroll
watch(mobileMenuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

// -------------------- Resize handler for large screens --------------------
const handleResize = () => {
  if (window.innerWidth >= 1024) {
    mobileMenuOpen.value = false
  }
}

// -------------------- Logout with cleanup --------------------
const handleLogout = async () => {
  try {
    if (subscriptionChannel) {
      await supabase.removeChannel(subscriptionChannel)
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

// -------------------- Lifecycle --------------------
onMounted(async () => {
  loadDarkModePreference()
  window.addEventListener('resize', handleResize)
  onlineOfflineHandler = handleOnlineStatus
  window.addEventListener('online', onlineOfflineHandler)
  window.addEventListener('offline', onlineOfflineHandler)

  document.documentElement.setAttribute('dir', languageStore.direction)
  document.body.setAttribute('dir', languageStore.direction)

  // Set subscription expiry handlers
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

  // Start auth initialization with timeout
  await initializeAuth()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (onlineOfflineHandler) {
    window.removeEventListener('online', onlineOfflineHandler)
    window.removeEventListener('offline', onlineOfflineHandler)
    onlineOfflineHandler = null
  }
  if (authTimeoutId) clearTimeout(authTimeoutId)
  if (subscriptionChannel) {
    supabase.removeChannel(subscriptionChannel).catch(console.warn)
    subscriptionChannel = null
  }
})
</script>

<style>
/* Reset box-sizing only */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Remove UNIVERSAL transition – performance killer */
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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  scroll-behavior: smooth;
}

.dark {
  color-scheme: dark;
}

/* Optimized content card – only color transition, no heavy transforms */
.content-card {
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Responsive container */
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
  transition: background 0.3s ease;
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

/* No universal transition – moved to specific interactive elements only */
button,
a,
[role="button"],
.hover-lift,
.sidebar-item,
.nav-link,
.toast-close {
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

/* Responsive sidebar overlay */
@media (max-width: 1023px) {
  .fixed.inset-0 {
    z-index: 40;
  }
}

/* Prevent body scroll when sidebar open */
body.sidebar-open {
  overflow: hidden;
}

/* Hover lift for cards (optional) */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.15);
}
.dark .hover-lift:hover {
  box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.4);
}

/* Animations (kept) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>
