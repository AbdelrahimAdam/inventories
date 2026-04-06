<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30 transition-colors duration-200" :dir="languageStore.direction">
    <div class="px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center">
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- Mobile menu button -->
        <button 
          @click="$emit('toggle-sidebar')" 
          class="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          aria-label="Toggle menu"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <!-- Page Title -->
        <h1 class="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
          {{ pageTitle }}
        </h1>
      </div>
      
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Dark Mode Toggle -->
        <button 
          @click="toggleDarkMode" 
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          aria-label="Toggle dark mode"
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
            class="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm sm:text-base transition-colors text-gray-700 dark:text-gray-300"
          >
            {{ languageStore.current === 'en' ? '🇬🇧 EN' : '🇸🇦 AR' }}
          </button>
          <div v-if="showLanguageMenu" class="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
            <button 
              @click="switchLanguage('en')" 
              class="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              🇬🇧 English
            </button>
            <button 
              @click="switchLanguage('ar')" 
              class="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              🇸🇦 العربية
            </button>
          </div>
        </div>
        
        <!-- User Menu -->
        <div class="relative">
          <button 
            @click="showUserMenu = !showUserMenu" 
            class="flex items-center gap-1 sm:gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs sm:text-sm font-medium">
              {{ userInitials }}
            </div>
            <span class="hidden md:inline text-sm text-gray-700 dark:text-gray-300">{{ userName }}</span>
          </button>
          
          <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
            <router-link 
              to="/profile" 
              class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              @click="showUserMenu = false"
            >
              Profile
            </router-link>
            <router-link 
              to="/settings" 
              class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              @click="showUserMenu = false"
            >
              Settings
            </router-link>
            <hr class="my-1 border-gray-200 dark:border-gray-700">
            <button 
              @click="handleLogout" 
              class="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Logout
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
  return 'User'
})

const userInitials = computed(() => {
  const name = user.value?.name || authStore.user?.email || 'U'
  if (name.includes('@')) {
    return name.charAt(0).toUpperCase()
  }
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const pageTitle = computed(() => {
  const path = route.path
  const titles: Record<string, string> = {
    '/admin/dashboard': 'Dashboard',
    '/super-admin/dashboard': 'Dashboard',
    '/inventory/items': 'Inventory Items',
    '/inventory/transactions': 'Transactions',
    '/warehouses': 'Warehouses',
    '/brands': 'Brands',
    '/products': 'Products',
    '/invoices': 'Invoices',
    '/invoices/new': 'Create Invoice',
    '/reports/stock': 'Stock Report',
    '/super-admin/tenants': 'Tenants',
    '/super-admin/users': 'Users',
    '/profile': 'Profile',
    '/settings': 'Settings'
  }
  if (path.match(/^\/invoices\/[\w-]+$/)) {
    return 'Invoice Details'
  }
  if (path.match(/^\/inventory\/items\/[\w-]+$/)) {
    return 'Item Details'
  }
  return titles[path] || 'Dashboard'
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