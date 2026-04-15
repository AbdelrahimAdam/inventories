<!-- src/modules/admin/Settings.vue -->
<template>
  <div class="w-full px-2 sm:px-4 py-4 sm:py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">الإعدادات العامة</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">إدارة إعدادات النظام والتفضيلات</p>
      </div>

      <!-- Settings Sections -->
      <div class="space-y-6">
        <!-- Language Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-green-50 dark:from-gray-700 dark:to-gray-800">
            <div class="flex items-center gap-3">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <h2 class="text-xl font-bold text-gray-800 dark:text-white">إعدادات اللغة</h2>
            </div>
          </div>
          
          <div class="p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                  لغة الواجهة
                </label>
                <div class="flex gap-4">
                  <label class="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      value="ar" 
                      v-model="selectedLanguage"
                      @change="changeLanguage"
                      class="ml-2 text-amber-600 focus:ring-amber-500"
                    />
                    <span class="text-gray-700 dark:text-gray-300">العربية</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      value="en" 
                      v-model="selectedLanguage"
                      @change="changeLanguage"
                      class="ml-2 text-amber-600 focus:ring-amber-500"
                    />
                    <span class="text-gray-700 dark:text-gray-300">English</span>
                  </label>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  تغيير لغة الواجهة سيطبق فوراً على جميع صفحات النظام
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Theme Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-green-50 dark:from-gray-700 dark:to-gray-800">
            <div class="flex items-center gap-3">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <h2 class="text-xl font-bold text-gray-800 dark:text-white">إعدادات المظهر</h2>
            </div>
          </div>
          
          <div class="p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                  وضع العرض
                </label>
                <div class="flex gap-4">
                  <label class="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      value="light" 
                      v-model="themeMode"
                      @change="changeTheme"
                      class="ml-2 text-amber-600 focus:ring-amber-500"
                    />
                    <span class="text-gray-700 dark:text-gray-300">فاتح</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      value="dark" 
                      v-model="themeMode"
                      @change="changeTheme"
                      class="ml-2 text-amber-600 focus:ring-amber-500"
                    />
                    <span class="text-gray-700 dark:text-gray-300">داكن</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      value="system" 
                      v-model="themeMode"
                      @change="changeTheme"
                      class="ml-2 text-amber-600 focus:ring-amber-500"
                    />
                    <span class="text-gray-700 dark:text-gray-300">النظام</span>
                  </label>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  اختر الوضع المناسب لعرض النظام
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-green-50 dark:from-gray-700 dark:to-gray-800">
            <div class="flex items-center gap-3">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h2 class="text-xl font-bold text-gray-800 dark:text-white">الإشعارات</h2>
            </div>
          </div>
          
          <div class="p-6">
            <div class="space-y-4">
              <div>
                <label class="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    v-model="notificationsEnabled"
                    @change="saveNotificationSettings"
                    class="ml-2 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span class="text-gray-700 dark:text-gray-300">تمكين الإشعارات</span>
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  استلام إشعارات حول تحديثات المخزون والفواتير
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Display Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-green-50 dark:from-gray-700 dark:to-gray-800">
            <div class="flex items-center gap-3">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m-6 4h8m0 0h-8" />
              </svg>
              <h2 class="text-xl font-bold text-gray-800 dark:text-white">إعدادات العرض</h2>
            </div>
          </div>
          
          <div class="p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                  عدد العناصر في الصفحة
                </label>
                <select 
                  v-model="itemsPerPage"
                  @change="saveDisplaySettings"
                  class="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option :value="10">10</option>
                  <option :value="15">15</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  تحديد عدد العناصر المعروضة في الجداول والقوائم
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Box -->
      <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="text-sm text-blue-800 dark:text-blue-300">
            <p class="font-semibold mb-1">💡 معلومات:</p>
            <p>يمكنك تعديل إعدادات الشركة مثل الاسم والرقم الضريبي والعنوان من خلال <router-link to="/settings/company" class="font-bold underline hover:text-blue-600">إعدادات الشركة</router-link></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

// Language settings
const selectedLanguage = ref<'ar' | 'en'>(languageStore.current === 'ar' ? 'ar' : 'en')

// Theme settings
const themeMode = ref<'light' | 'dark' | 'system'>('system')

// Notification settings
const notificationsEnabled = ref(true)

// Display settings
const itemsPerPage = ref(15)

// Change language
const changeLanguage = async () => {
  try {
    await languageStore.switchLanguage(selectedLanguage.value)
    // Save to localStorage
    localStorage.setItem('user-locale', selectedLanguage.value)
  } catch (error) {
    console.error('Error changing language:', error)
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
    // System preference
    localStorage.removeItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (systemPrefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}

// Save notification settings
const saveNotificationSettings = () => {
  localStorage.setItem('notifications-enabled', notificationsEnabled.value.toString())
}

// Save display settings
const saveDisplaySettings = () => {
  localStorage.setItem('items-per-page', itemsPerPage.value.toString())
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
  changeTheme()
  
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
const watchSystemTheme = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = () => {
    if (themeMode.value === 'system') {
      changeTheme()
    }
  }
  mediaQuery.addEventListener('change', handleChange)
}

onMounted(() => {
  loadSettings()
  watchSystemTheme()
})
</script>

<style scoped>
/* Smooth transitions */
* {
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

/* RTL support */
[dir="rtl"] .text-left {
  text-align: right;
}

[dir="rtl"] .text-right {
  text-align: left;
}
</style>