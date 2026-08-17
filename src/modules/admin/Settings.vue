<!-- src/modules/admin/Settings.vue -->
<template>
  <div class="w-full px-2 sm:px-4 py-3 sm:py-6 pb-20" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">الإعدادات العامة</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">إدارة إعدادات النظام والتفضيلات</p>
      </div>

      <!-- Settings Sections -->
      <div class="space-y-4">
        <!-- Language Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex items-center gap-3">
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h2 class="text-base sm:text-lg font-bold text-gray-800 dark:text-white">إعدادات اللغة</h2>
          </div>

          <div class="p-4 sm:p-6">
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  لغة الواجهة
                </label>
                <div class="grid grid-cols-2 sm:flex sm:gap-4">
                  <label 
                    class="flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 min-h-[48px]"
                    :class="selectedLanguage === 'ar' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-600'"
                  >
                    <input 
                      type="radio" 
                      value="ar" 
                      v-model="selectedLanguage"
                      @change="changeLanguage"
                      class="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">العربية</span>
                  </label>
                  <label 
                    class="flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 min-h-[48px]"
                    :class="selectedLanguage === 'en' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-600'"
                  >
                    <input 
                      type="radio" 
                      value="en" 
                      v-model="selectedLanguage"
                      @change="changeLanguage"
                      class="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">English</span>
                  </label>
                </div>
                <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2">
                  تغيير لغة الواجهة سيطبق فوراً على جميع صفحات النظام
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Theme Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex items-center gap-3">
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <h2 class="text-base sm:text-lg font-bold text-gray-800 dark:text-white">إعدادات المظهر</h2>
          </div>

          <div class="p-4 sm:p-6">
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  وضع العرض
                </label>
                <div class="grid grid-cols-3 gap-2 sm:flex sm:gap-4">
                  <label 
                    class="flex items-center justify-center gap-2 p-2 sm:p-3 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 min-h-[44px] flex-1"
                    :class="themeMode === 'light' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-600'"
                  >
                    <input 
                      type="radio" 
                      value="light" 
                      v-model="themeMode"
                      @change="changeTheme"
                      class="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">فاتح</span>
                    <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
                    </svg>
                  </label>
                  <label 
                    class="flex items-center justify-center gap-2 p-2 sm:p-3 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 min-h-[44px] flex-1"
                    :class="themeMode === 'dark' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-600'"
                  >
                    <input 
                      type="radio" 
                      value="dark" 
                      v-model="themeMode"
                      @change="changeTheme"
                      class="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">داكن</span>
                    <svg class="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  </label>
                  <label 
                    class="flex items-center justify-center gap-2 p-2 sm:p-3 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 min-h-[44px] flex-1"
                    :class="themeMode === 'system' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-600'"
                  >
                    <input 
                      type="radio" 
                      value="system" 
                      v-model="themeMode"
                      @change="changeTheme"
                      class="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">النظام</span>
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </label>
                </div>
                <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2">
                  اختر الوضع المناسب لعرض النظام
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex items-center gap-3">
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h2 class="text-base sm:text-lg font-bold text-gray-800 dark:text-white">الإشعارات</h2>
          </div>

          <div class="p-4 sm:p-6">
            <div class="space-y-3">
              <div>
                <label class="flex items-center gap-3 cursor-pointer p-3 border-2 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 min-h-[48px]"
                       :class="notificationsEnabled ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-600'">
                  <input 
                    type="checkbox" 
                    v-model="notificationsEnabled"
                    @change="saveNotificationSettings"
                    class="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">تمكين الإشعارات</span>
                    <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      استلام إشعارات حول تحديثات المخزون والفواتير
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Display Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex items-center gap-3">
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m-6 4h8m0 0h-8" />
              </svg>
            </div>
            <h2 class="text-base sm:text-lg font-bold text-gray-800 dark:text-white">إعدادات العرض</h2>
          </div>

          <div class="p-4 sm:p-6">
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  عدد العناصر في الصفحة
                </label>
                <select 
                  v-model="itemsPerPage"
                  @change="saveDisplaySettings"
                  class="w-full sm:w-40 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium min-h-[44px]"
                >
                  <option :value="10">10</option>
                  <option :value="15">15</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
                <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2">
                  تحديد عدد العناصر المعروضة في الجداول والقوائم
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Reset Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex items-center gap-3">
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 class="text-base sm:text-lg font-bold text-gray-800 dark:text-white">إعادة تعيين</h2>
          </div>

          <div class="p-4 sm:p-6">
            <button 
              @click="resetSettings"
              class="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-bold text-sm min-h-[44px] flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              إعادة تعيين جميع الإعدادات
            </button>
            <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2">
              سيتم إعادة تعيين جميع الإعدادات إلى القيم الافتراضية
            </p>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="toastVisible" class="fixed top-4 left-1/2 -translate-x-1/2 z-[10001] w-11/12 max-w-md">
          <div class="rounded-xl p-4 shadow-xl border flex items-center gap-3 bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-600">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-green-700 dark:text-green-300">{{ toastMessage }}</p>
            </div>
            <button @click="toastVisible = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Info Box -->
      <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="text-sm text-blue-800 dark:text-blue-300">
            <p class="font-semibold mb-0.5">💡 معلومات:</p>
            <p>يمكنك تعديل إعدادات الشركة مثل الاسم والرقم الضريبي والعنوان من خلال 
              <router-link to="/settings/company" class="font-bold underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                إعدادات الشركة
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

// Toast state
const toastVisible = ref(false)
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

// Language settings
const selectedLanguage = ref<'ar' | 'en'>(languageStore.current === 'ar' ? 'ar' : 'en')

// Theme settings
const themeMode = ref<'light' | 'dark' | 'system'>('system')

// Notification settings
const notificationsEnabled = ref(true)

// Display settings
const itemsPerPage = ref(15)

// Show toast notification
const showToast = (message: string) => {
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
  toastMessage.value = message
  toastVisible.value = true
  toastTimer = setTimeout(() => {
    toastVisible.value = false
    toastTimer = null
  }, 3000)
}

// Change language
const changeLanguage = async () => {
  try {
    await languageStore.switchLanguage(selectedLanguage.value)
    localStorage.setItem('user-locale', selectedLanguage.value)
    showToast('تم تغيير اللغة بنجاح')
  } catch (error) {
    console.error('Error changing language:', error)
    showToast('حدث خطأ أثناء تغيير اللغة')
  }
}

// Change theme
const changeTheme = () => {
  const root = document.documentElement
  
  if (themeMode.value === 'dark') {
    root.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else if (themeMode.value === 'light') {
    root.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  } else {
    localStorage.removeItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (systemPrefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
  showToast('تم تغيير المظهر بنجاح')
}

// Save notification settings
const saveNotificationSettings = () => {
  localStorage.setItem('notifications-enabled', notificationsEnabled.value.toString())
  showToast(`تم ${notificationsEnabled.value ? 'تفعيل' : 'تعطيل'} الإشعارات بنجاح`)
}

// Save display settings
const saveDisplaySettings = () => {
  localStorage.setItem('items-per-page', itemsPerPage.value.toString())
  showToast('تم حفظ إعدادات العرض بنجاح')
}

// Reset all settings to default
const resetSettings = () => {
  if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟')) {
    // Reset language
    selectedLanguage.value = 'ar'
    languageStore.switchLanguage('ar')
    localStorage.setItem('user-locale', 'ar')
    
    // Reset theme
    themeMode.value = 'system'
    localStorage.removeItem('theme')
    const root = document.documentElement
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (systemPrefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Reset notifications
    notificationsEnabled.value = true
    localStorage.setItem('notifications-enabled', 'true')
    
    // Reset items per page
    itemsPerPage.value = 15
    localStorage.setItem('items-per-page', '15')
    
    showToast('تم إعادة تعيين جميع الإعدادات بنجاح')
  }
}

// Load saved settings
const loadSettings = () => {
  // Load theme
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
  if (savedTheme) {
    themeMode.value = savedTheme
  } else {
    themeMode.value = 'system'
  }
  // Apply theme without showing toast
  const root = document.documentElement
  if (themeMode.value === 'dark') {
    root.classList.add('dark')
  } else if (themeMode.value === 'light') {
    root.classList.remove('dark')
  } else {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (systemPrefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
  
  // Load notification settings
  const savedNotifications = localStorage.getItem('notifications-enabled')
  if (savedNotifications !== null) {
    notificationsEnabled.value = savedNotifications === 'true'
  }
  
  // Load display settings
  const savedItemsPerPage = localStorage.getItem('items-per-page')
  if (savedItemsPerPage) {
    itemsPerPage.value = parseInt(savedItemsPerPage)
  }
  
  // Load language settings
  const savedLocale = localStorage.getItem('user-locale') as 'ar' | 'en' | null
  if (savedLocale) {
    selectedLanguage.value = savedLocale
  }
}

// Watch for system theme changes
let mediaQuery: MediaQueryList | null = null

const watchSystemTheme = () => {
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = () => {
    if (themeMode.value === 'system') {
      const root = document.documentElement
      if (mediaQuery?.matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }
  mediaQuery.addEventListener('change', handleChange)
}

onMounted(() => {
  loadSettings()
  watchSystemTheme()
})

onBeforeUnmount(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', () => {})
  }
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
})
</script>

<style scoped>
/* Smooth transitions */
* {
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

/* RTL support */
[dir="rtl"] .text-left {
  text-align: right;
}

[dir="rtl"] .text-right {
  text-align: left;
}

/* Custom checkbox and radio styles */
input[type="checkbox"],
input[type="radio"] {
  accent-color: #f59e0b;
  cursor: pointer;
}

/* Hover effects for setting cards */
.bg-white:hover {
  transform: translateY(-2px);
}

/* Touch improvements */
@media (max-width: 640px) {
  label {
    min-height: 48px !important;
  }
  input, select, button {
    font-size: 16px !important;
  }
}
</style>