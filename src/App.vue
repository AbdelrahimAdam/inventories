<template>
  <!-- Public Layout (Login, Register, etc.) -->
  <div v-if="!authStore.isAuthenticated" class="min-h-screen">
    <router-view />
  </div>

  <!-- Authenticated Layout (Super Admin & Admin) -->
  <div v-else :dir="languageStore.direction" :lang="languageStore.current" class="min-h-screen bg-gray-50">
    <!-- Mobile menu button -->
    <div class="lg:hidden fixed top-4 left-4 z-50">
      <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-lg bg-green-600 text-white shadow-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile overlay -->
    <div v-if="mobileMenuOpen" class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" @click="mobileMenuOpen = false"></div>

    <div class="flex">
      <!-- Sidebar Component -->
      <AppSidebar :is-mobile-open="mobileMenuOpen" @close-mobile="mobileMenuOpen = false" />

      <!-- Main Content -->
      <main class="flex-1 min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-sm sticky top-0 z-30">
          <div class="px-4 py-3 flex justify-between items-center">
            <h1 class="text-lg font-semibold text-gray-800">{{ pageTitle }}</h1>
            <div class="flex items-center space-x-3">
              <!-- Language Switcher -->
              <div class="relative">
                <button @click="showLanguageMenu = !showLanguageMenu" class="px-3 py-2 rounded-lg hover:bg-gray-100">
                  {{ languageStore.current === 'en' ? '🇬🇧 English' : '🇸🇦 العربية' }}
                </button>
                <div v-if="showLanguageMenu" class="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-1 z-50">
                  <button @click="switchLanguage('en')" class="w-full px-4 py-2 text-left hover:bg-gray-100">🇬🇧 English</button>
                  <button @click="switchLanguage('ar')" class="w-full px-4 py-2 text-left hover:bg-gray-100">🇸🇦 العربية</button>
                </div>
              </div>
              
              <!-- User Menu -->
              <div class="relative">
                <button @click="showUserMenu = !showUserMenu" class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">{{ userInitials }}</div>
                </button>
                <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <router-link to="/profile" class="block px-4 py-2 text-sm hover:bg-gray-100">Profile</router-link>
                  <router-link to="/settings" class="block px-4 py-2 text-sm hover:bg-gray-100">Settings</router-link>
                  <hr class="my-1">
                  <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <!-- Page Content -->
        <div class="p-4">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import AppSidebar from '@/components/common/AppSidebar.vue'

const authStore = useAuthStore()
const languageStore = useLanguageStore()
const router = useRouter()
const route = useRoute()

const mobileMenuOpen = ref(false)
const showLanguageMenu = ref(false)
const showUserMenu = ref(false)

const userInitials = computed(() => {
  const name = authStore.user?.name || ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const pageTitle = computed(() => {
  const path = route.path
  const titles: Record<string, string> = {
    '/admin/dashboard': 'Admin Dashboard',
    '/super-admin/dashboard': 'Super Admin Dashboard',
    '/inventory/items': 'Inventory Items',
    '/inventory/transactions': 'Transactions',
    '/warehouses': 'Warehouses',
    '/brands': 'Brands',
    '/products': 'Products',
    '/invoices': 'Invoices',
    '/invoices/new': 'Create Invoice',
    '/reports/stock': 'Stock Report',
    '/super-admin/tenants': 'Tenants Management',
    '/super-admin/users': 'User Management',
    '/profile': 'Profile',
    '/settings': 'Settings'
  }
  // Check if path matches invoice details pattern
  if (path.match(/^\/invoices\/[\w-]+$/)) {
    return 'Invoice Details'
  }
  return titles[path] || 'Dashboard'
})

const switchLanguage = (lang: 'en' | 'ar') => {
  languageStore.switchLanguage(lang)
  showLanguageMenu.value = false
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

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