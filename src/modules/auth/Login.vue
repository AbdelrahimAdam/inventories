<template>
  <div 
    class="login-container min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-200 to-green-100 dark:from-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden" 
    :dir="languageStore.direction"
  >
    <!-- Back Arrow -->
    <router-link 
      to="/landing" 
      class="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200 p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-700/50 z-10"
      :aria-label="isRTL ? 'العودة إلى الصفحة الرئيسية' : 'Back to homepage'"
    >
      <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12H3M3 12L10 5M3 12L10 19" />
      </svg>
    </router-link>

    <div class="login-card bg-white dark:bg-gray-800 border border-amber-100 dark:border-gray-700 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md hover:shadow-3xl transition-shadow duration-300">
      <div class="text-center mb-6">
        <div class="flex justify-center mb-3">
          <router-link to="/landing" class="logo-wrapper hover:scale-105 transition-transform duration-300">
            <img 
              src="/icon-source.png" 
              alt="P.commerce Logo" 
              class="logo-image"
              @error="handleImageError"
            />
          </router-link>
        </div>
        <h1 class="brand-title text-2xl sm:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-amber-600 to-green-600 bg-clip-text text-transparent">
          P.commerce
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1.5 text-sm sm:text-base">
          {{ isRTL ? 'مرحباً بعودتك! يرجى تسجيل الدخول إلى حسابك' : 'Welcome back! Please login to your account' }}
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1.5" :class="isRTL ? 'text-right' : 'text-left'">
            {{ isRTL ? 'البريد الإلكتروني' : 'Email' }}
          </label>
          <div class="relative">
            <input
              type="email"
              v-model="email"
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              :class="isRTL ? 'text-right pr-10 pl-4' : 'text-left pl-10 pr-4'"
              :placeholder="isRTL ? 'admin@example.com' : 'admin@example.com'"
              required
              autocomplete="email"
              dir="ltr"
            />
            <svg class="absolute top-3 w-5 h-5 text-gray-400 dark:text-gray-500" :class="isRTL ? 'right-3' : 'left-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
        </div>

        <div>
          <label class="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1.5" :class="isRTL ? 'text-right' : 'text-left'">
            {{ isRTL ? 'كلمة المرور' : 'Password' }}
          </label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              :class="isRTL ? 'text-right pr-10 pl-16' : 'text-left pl-10 pr-16'"
              :placeholder="isRTL ? '••••••••' : '••••••••'"
              required
              autocomplete="current-password"
              dir="ltr"
            />
            <svg class="absolute top-3 w-5 h-5 text-gray-400 dark:text-gray-500" :class="isRTL ? 'right-3' : 'left-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute top-2.5 text-gray-500 dark:text-gray-400 hover:text-amber-700 dark:hover:text-amber-400 text-sm font-medium"
              :class="isRTL ? 'left-3' : 'right-3'"
            >
              {{ showPassword ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'إظهار' : 'Show') }}
            </button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <label class="flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="rememberMe"
              class="rounded border-gray-300 dark:border-gray-600 text-amber-600 focus:ring-amber-500 cursor-pointer w-4 h-4"
              :class="isRTL ? 'ml-2' : 'mr-2'"
            />
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ isRTL ? 'تذكرني' : 'Remember me' }}</span>
          </label>
          <router-link
            to="/forgot-password"
            class="text-sm text-amber-700 dark:text-amber-400 hover:underline font-medium"
          >
            {{ isRTL ? 'نسيت كلمة المرور؟' : 'Forgot password?' }}
          </router-link>
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full bg-gradient-to-r from-amber-600 to-green-600 text-white py-2.5 rounded-xl font-semibold hover:from-amber-700 hover:to-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <span v-if="authStore.isLoading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isRTL ? 'جاري الدخول...' : 'Logging in...' }}
          </span>
          <span v-else>{{ isRTL ? 'تسجيل الدخول' : 'Login' }}</span>
        </button>

        <!-- Error Message -->
        <div v-if="authStore.error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-red-600 dark:text-red-400 text-sm text-center">{{ authStore.error }}</p>
        </div>
      </form>

      <div class="mt-6 space-y-2">
        <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
          {{ isRTL ? 'ليس لديك حساب؟' : "Don't have an account?" }}
          <router-link to="/register" class="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium">
            {{ isRTL ? 'إنشاء حساب جديد' : 'Create new account' }}
          </router-link>
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
          <router-link to="/landing" class="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
            {{ isRTL ? '← تعرف على نظام P.commerce' : '← Learn about P.commerce' }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const router = useRouter()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

const isRTL = computed(() => languageStore.direction === 'rtl')

const getDashboardPath = computed(() => {
  if (authStore.isSuperAdmin) return '/super-admin/dashboard'
  if (authStore.isCompanyManager) return '/admin/dashboard'
  if (authStore.isWarehouseManager) return '/warehouse-manager/dashboard'
  if (authStore.isViewer) return '/viewer/dashboard'
  return '/inventory/items'
})

async function handleLogin() {
  email.value = email.value.trim()
  password.value = password.value.trim()

  const success = await authStore.login({
    email: email.value,
    password: password.value,
  })

  if (rememberMe.value) {
    localStorage.setItem('remember_email', email.value)
  } else {
    localStorage.removeItem('remember_email')
  }

  if (success && authStore.isAuthenticated) {
    const dashboardPath = getDashboardPath.value
    
    if (authStore.isFullyReady) {
      router.push(dashboardPath)
    } else {
      const unwatch = watch(
        () => authStore.isFullyReady,
        (ready) => {
          if (ready) {
            unwatch()
            router.push(dashboardPath)
          }
        },
        { immediate: false }
      )
      setTimeout(() => {
        unwatch()
        router.push(dashboardPath)
      }, 3000)
    }
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%23d4a574" stroke-width="2"%3E%3Cpath d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"%3E%3C/path%3E%3C/svg%3E'
}

onMounted(() => {
  const savedEmail = localStorage.getItem('remember_email')
  if (savedEmail) {
    email.value = savedEmail
    rememberMe.value = true
  }

  if (authStore.error) {
    authStore.error = null
  }

  if (authStore.isAuthenticated && authStore.isFullyReady) {
    router.push(getDashboardPath.value)
  }
})
</script>

<style scoped>
/* Prevent scrolling */
.login-container {
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: fixed;
  inset: 0;
}

.login-card {
  max-height: 90vh;
  overflow-y: auto;
  scrollbar-width: none;
}

.login-card::-webkit-scrollbar {
  display: none;
}

.logo-wrapper {
  display: inline-block;
  border-radius: 100%;
  background: linear-gradient(135deg, #d4a574 0%, #86b386 100%);
  padding: 4px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.logo-wrapper:hover {
  transform: scale(1.05);
}

.logo-image {
  width: 72px;
  height: 72px;
  border-radius: 100%;
  object-fit: cover;
  display: block;
  background: white;
}

.bg-white {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 40px -12px rgba(0, 0, 0, 0.25);
}

/* Brand title centering */
.brand-title {
  text-align: center !important;
  display: block !important;
  width: 100% !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

/* RTL Support */
[dir="rtl"] {
  text-align: right !important;
}

[dir="rtl"] .text-center,
[dir="rtl"] .text-center *,
[dir="rtl"] .brand-title,
[dir="rtl"] .brand-title *,
[dir="rtl"] h1,
[dir="rtl"] p,
[dir="rtl"] .text-sm,
[dir="rtl"] .text-gray-500,
[dir="rtl"] .mt-6 p,
[dir="rtl"] .space-y-2 p {
  text-align: center !important;
}

[dir="ltr"] {
  text-align: left !important;
}

[dir="ltr"] .text-center,
[dir="ltr"] .text-center *,
[dir="ltr"] .brand-title,
[dir="ltr"] .brand-title *,
[dir="ltr"] h1,
[dir="ltr"] p,
[dir="ltr"] .text-sm,
[dir="ltr"] .text-gray-500,
[dir="ltr"] .mt-6 p,
[dir="ltr"] .space-y-2 p {
  text-align: center !important;
}

[dir="rtl"] .text-right {
  text-align: right !important;
}

[dir="ltr"] .text-left {
  text-align: left !important;
}

[dir="rtl"] input[dir="ltr"] {
  text-align: left !important;
}

input[dir="ltr"] {
  text-align: left;
}

[dir="rtl"] input {
  padding-right: 2.5rem;
  padding-left: 1rem;
}

[dir="ltr"] input {
  padding-left: 2.5rem;
  padding-right: 1rem;
}

[dir="rtl"] .absolute.right-3 {
  right: 0.75rem;
  left: auto;
}

[dir="rtl"] .absolute.left-3 {
  left: 0.75rem;
  right: auto;
}

[dir="ltr"] .absolute.right-3 {
  right: 0.75rem;
  left: auto;
}

[dir="ltr"] .absolute.left-3 {
  left: 0.75rem;
  right: auto;
}

input[type="checkbox"] {
  margin-right: 0;
}

[dir="rtl"] input[type="checkbox"] {
  margin-left: 0.5rem;
  margin-right: 0;
}

[dir="ltr"] input[type="checkbox"] {
  margin-right: 0.5rem;
  margin-left: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .logo-image {
    width: 56px;
    height: 56px;
  }
  
  .login-card {
    padding: 1.25rem;
  }
  
  .brand-title {
    font-size: 1.5rem !important;
  }

  .absolute.top-4.right-4 {
    top: 0.5rem;
    right: 0.5rem;
  }

  .absolute.top-4.right-4 svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  input {
    font-size: 16px !important;
    padding-top: 0.625rem;
    padding-bottom: 0.625rem;
  }

  [dir="rtl"] input {
    padding-right: 2.5rem;
    padding-left: 3.5rem;
  }

  [dir="ltr"] input {
    padding-left: 2.5rem;
    padding-right: 3.5rem;
  }

  .absolute.right-3 {
    top: 0.625rem;
  }

  .absolute.left-3 {
    top: 0.625rem;
  }
}

@media (max-height: 700px) {
  .login-card {
    padding: 1rem 1.25rem;
  }
  
  .logo-image {
    width: 48px;
    height: 48px;
  }
  
  .brand-title {
    font-size: 1.25rem !important;
  }
  
  .text-center.mb-6 {
    margin-bottom: 1rem;
  }
  
  .space-y-4 {
    gap: 0.75rem;
  }
  
  .mt-6 {
    margin-top: 1rem;
  }
}
</style>