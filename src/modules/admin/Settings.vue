<template>
  <div class="max-w-4xl mx-auto" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <h1 class="text-2xl font-bold mb-6">{{ $t('nav.settings') }}</h1>
    
    <div class="bg-white rounded-lg shadow p-6">
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-4">Language Preferences</h2>
        <div class="flex items-center space-x-4" :class="{ 'space-x-reverse': $i18n.locale === 'ar' }">
          <button
            @click="changeLanguage('en')"
            class="px-4 py-2 rounded-lg border transition-colors"
            :class="currentLanguage === 'en' ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:bg-gray-50'"
          >
            🇬🇧 English
          </button>
          <button
            @click="changeLanguage('ar')"
            class="px-4 py-2 rounded-lg border transition-colors"
            :class="currentLanguage === 'ar' ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:bg-gray-50'"
          >
            🇸🇦 العربية
          </button>
        </div>
      </div>
      
      <div class="border-t pt-6">
        <h2 class="text-lg font-semibold mb-4">Notifications</h2>
        <div class="space-y-3">
          <label class="flex items-center space-x-3" :class="{ 'space-x-reverse': $i18n.locale === 'ar' }">
            <input type="checkbox" v-model="notifications.email" class="w-4 h-4 text-primary">
            <span>Email notifications for low stock alerts</span>
          </label>
          <label class="flex items-center space-x-3" :class="{ 'space-x-reverse': $i18n.locale === 'ar' }">
            <input type="checkbox" v-model="notifications.browser" class="w-4 h-4 text-primary">
            <span>Browser notifications for transactions</span>
          </label>
        </div>
      </div>
      
      <div class="border-t pt-6 mt-6">
        <h2 class="text-lg font-semibold mb-4">Theme</h2>
        <div class="flex items-center space-x-4" :class="{ 'space-x-reverse': $i18n.locale === 'ar' }">
          <button
            @click="changeTheme('light')"
            class="px-4 py-2 rounded-lg border transition-colors"
            :class="currentTheme === 'light' ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:bg-gray-50'"
          >
            ☀️ Light
          </button>
          <button
            @click="changeTheme('dark')"
            class="px-4 py-2 rounded-lg border transition-colors"
            :class="currentTheme === 'dark' ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:bg-gray-50'"
          >
            🌙 Dark
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const currentLanguage = ref(languageStore.current)
const currentTheme = ref('light')
const notifications = ref({
  email: true,
  browser: false,
})

const changeLanguage = (lang: 'en' | 'ar') => {
  languageStore.switchLanguage(lang)
  currentLanguage.value = lang
}

const changeTheme = (theme: string) => {
  currentTheme.value = theme
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', theme)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    currentTheme.value = savedTheme
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }
  
  // Load saved notification settings
  const savedNotifications = localStorage.getItem('notifications')
  if (savedNotifications) {
    notifications.value = JSON.parse(savedNotifications)
  }
})

// Save notification settings
import { watch } from 'vue'
watch(notifications, (newVal) => {
  localStorage.setItem('notifications', JSON.stringify(newVal))
}, { deep: true })
</script>