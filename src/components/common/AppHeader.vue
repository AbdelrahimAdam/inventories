<template>
  <header class="bg-orange-500 dark:bg-orange-700 shadow-md sticky top-0 z-30 transition-colors duration-200" :dir="languageStore.direction">
    <div class="px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center">
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- Mobile menu button -->
        <button 
          @click="$emit('toggle-sidebar')" 
          class="lg:hidden p-2 rounded-lg hover:bg-orange-600 dark:hover:bg-orange-800 text-white transition-colors"
          aria-label="القائمة"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Page Title -->
        <h1 class="text-sm sm:text-base md:text-lg font-bold text-white truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
          {{ pageTitle }}
        </h1>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Dark Mode Toggle -->
        <button 
          @click="toggleDarkMode" 
          class="p-2 rounded-lg hover:bg-orange-600 dark:hover:bg-orange-800 text-white transition-colors"
          aria-label="الوضع الليلي"
        >
          <svg v-if="isDarkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <!-- Language Switcher -->
        <div class="relative">
          <button 
            @click="showLanguageMenu = !showLanguageMenu" 
            class="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-orange-600 dark:hover:bg-orange-800 text-sm sm:text-base transition-colors text-white font-medium"
          >
            {{ languageStore.current === 'en' ? '🇬🇧 EN' : '🇸🇦 ع' }}
          </button>
          <div v-if="showLanguageMenu" 
               class="absolute mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
               :class="languageStore.isRTL ? 'left-0' : 'right-0'">
            <button 
              @click="switchLanguage('en')" 
              class="w-full px-4 py-2 text-sm text-right hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              🇬🇧 English
            </button>
            <button 
              @click="switchLanguage('ar')" 
              class="w-full px-4 py-2 text-sm text-right hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              🇸🇦 العربية
            </button>
          </div>
        </div>

        <!-- User Menu -->
        <div class="relative">
          <button 
            @click="showUserMenu = !showUserMenu" 
            class="flex items-center gap-1 sm:gap-2 p-1 rounded-lg hover:bg-orange-600 dark:hover:bg-orange-800 transition-colors"
          >
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-orange-600 flex items-center justify-center text-xs sm:text-sm font-bold shadow-md">
              {{ userInitials }}
            </div>
            <span class="hidden md:inline text-sm font-medium text-white">{{ userName }}</span>
          </button>

          <div v-if="showUserMenu" 
               class="absolute mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
               :class="languageStore.isRTL ? 'left-0' : 'right-0'">
            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ user?.name || 'مستخدم' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ user?.email }}</p>
            </div>
            <router-link 
              to="/profile" 
              class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              @click="showUserMenu = false"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              الملف الشخصي
            </router-link>
            <router-link 
              to="/settings" 
              class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              @click="showUserMenu = false"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              الإعدادات
            </router-link>
            <hr class="my-1 border-gray-200 dark:border-gray-700">
            <button 
              @click="handleLogout" 
              class="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
  (e: 'logout'): void
  (e: 'toggle-dark-mode'): void
}>()

defineProps<{
  isDarkMode?: boolean
}>()

const authStore = useAuthStore()
const languageStore = useLanguageStore()
const route = useRoute()

const showLanguageMenu = ref(false)
const showUserMenu = ref(false)

const user = computed(() => authStore.user)
const userName = computed(() => {
  if (user.value?.name) {
    return user.value.name.split(' ')[0]
  }
  if (authStore.user?.email) {
    return authStore.user.email.split('@')[0]
  }
  return 'مستخدم'
})

const userInitials = computed(() => {
  const name = user.value?.name || authStore.user?.email || 'U'
  if (name.includes('@')) {
    return name.charAt(0).toUpperCase()
  }
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

// Arabic page titles
const pageTitle = computed(() => {
  const path = route.path
  const titles: Record<string, string> = {
    '/admin/dashboard': 'لوحة التحكم',
    '/super-admin/dashboard': 'لوحة التحكم',
    '/inventory/items': 'الأصناف',
    '/inventory/transactions': 'الحركات',
    '/warehouses': 'المخازن',
    '/brands': 'الماركات',
    '/products': 'المنتجات',
    '/invoices': 'الفواتير',
    '/invoices/new': 'فاتورة جديدة',
    '/reports/stock': 'تقرير المخزون',
    '/super-admin/tenants': 'المستأجرين',
    '/super-admin/users': 'المستخدمين',
    '/profile': 'الملف الشخصي',
    '/settings': 'الإعدادات'
  }
  if (path.match(/^\/invoices\/[\w-]+$/)) {
    return 'تفاصيل الفاتورة'
  }
  if (path.match(/^\/inventory\/items\/[\w-]+$/)) {
    return 'تفاصيل الصنف'
  }
  return titles[path] || 'الرئيسية'
})

const toggleDarkMode = () => {
  emit('toggle-dark-mode')
}

const switchLanguage = (lang: 'en' | 'ar') => {
  languageStore.switchLanguage(lang)
  showLanguageMenu.value = false
}

const handleLogout = () => {
  showUserMenu.value = false
  emit('logout')
}

// Close menus when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showLanguageMenu.value = false
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>