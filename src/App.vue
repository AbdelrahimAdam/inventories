<template>
  <!-- Public Layout (Login, Register, etc.) - No sidebar, no header -->
  <div v-if="!authStore.isAuthenticated" class="min-h-screen">
    <router-view />
  </div>

  <!-- Super Admin Layout -->
  <div v-else-if="authStore.isSuperAdmin" :dir="languageStore.direction" :lang="languageStore.current" class="min-h-screen bg-gray-50">
    <!-- Same sidebar structure but with super admin links -->
    <div class="lg:hidden fixed top-4 left-4 z-50">
      <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-lg bg-primary text-white shadow-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div v-if="mobileMenuOpen" class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" @click="mobileMenuOpen = false"></div>

    <div class="flex">
      <aside class="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0"
        :class="[mobileMenuOpen ? 'translate-x-0' : '-translate-x-full']">
        <div class="p-4 border-b border-gray-800">
          <h2 class="text-xl font-bold text-center">Super Admin Panel</h2>
        </div>
        
        <nav class="mt-8">
          <router-link to="/super-admin/dashboard" @click="mobileMenuOpen = false" class="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors" active-class="bg-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="mx-3">Dashboard</span>
          </router-link>
          
          <router-link to="/super-admin/tenants" @click="mobileMenuOpen = false" class="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors" active-class="bg-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="mx-3">Tenants</span>
          </router-link>
          
          <router-link to="/super-admin/users" @click="mobileMenuOpen = false" class="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors" active-class="bg-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span class="mx-3">Users</span>
          </router-link>

          <div class="border-t border-gray-800 mt-4 pt-4">
            <button @click="logout" class="flex items-center w-full px-6 py-3 hover:bg-gray-800 transition-colors text-red-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="mx-3">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      <main class="flex-1 min-h-screen">
        <header class="bg-white shadow-sm sticky top-0 z-30">
          <div class="px-4 py-3 flex justify-between items-center">
            <h1 class="text-lg font-semibold text-gray-800">{{ pageTitle }}</h1>
            <div class="flex items-center space-x-3">
              <div class="relative">
                <button @click="showLanguageMenu = !showLanguageMenu" class="px-3 py-2 rounded-lg hover:bg-gray-100">
                  {{ languageStore.current === 'en' ? '🇬🇧 English' : '🇸🇦 العربية' }}
                </button>
                <div v-if="showLanguageMenu" class="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-1 z-50">
                  <button @click="switchLanguage('en')" class="w-full px-4 py-2 text-left hover:bg-gray-100">🇬🇧 English</button>
                  <button @click="switchLanguage('ar')" class="w-full px-4 py-2 text-left hover:bg-gray-100">🇸🇦 العربية</button>
                </div>
              </div>
              <div class="relative">
                <button @click="showUserMenu = !showUserMenu" class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">{{ userInitials }}</div>
                </button>
                <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <button @click="logout" class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div class="p-4">
          <router-view />
        </div>
      </main>
    </div>
  </div>

  <!-- Admin Layout (for non-super-admin users) -->
  <div v-else :dir="languageStore.direction" :lang="languageStore.current" class="min-h-screen bg-gray-50">
    <!-- Admin layout here (same as before) -->
    <div class="lg:hidden fixed top-4 left-4 z-50">
      <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-lg bg-primary text-white shadow-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div v-if="mobileMenuOpen" class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" @click="mobileMenuOpen = false"></div>

    <div class="flex">
      <aside class="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0"
        :class="[mobileMenuOpen ? 'translate-x-0' : '-translate-x-full']">
        <div class="p-4 border-b border-gray-800">
          <h2 class="text-xl font-bold text-center">Inventory System</h2>
        </div>
        
        <nav class="mt-8">
          <router-link to="/admin/dashboard" @click="mobileMenuOpen = false" class="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors" active-class="bg-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="mx-3">Dashboard</span>
          </router-link>
          
          <router-link to="/inventory/items" @click="mobileMenuOpen = false" class="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors" active-class="bg-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span class="mx-3">Items</span>
          </router-link>

          <div class="border-t border-gray-800 mt-4 pt-4">
            <button @click="logout" class="flex items-center w-full px-6 py-3 hover:bg-gray-800 transition-colors text-red-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="mx-3">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      <main class="flex-1 min-h-screen">
        <header class="bg-white shadow-sm sticky top-0 z-30">
          <div class="px-4 py-3 flex justify-between items-center">
            <h1 class="text-lg font-semibold text-gray-800">{{ pageTitle }}</h1>
            <div class="flex items-center space-x-3">
              <div class="relative">
                <button @click="showLanguageMenu = !showLanguageMenu" class="px-3 py-2 rounded-lg hover:bg-gray-100">
                  {{ languageStore.current === 'en' ? '🇬🇧 English' : '🇸🇦 العربية' }}
                </button>
                <div v-if="showLanguageMenu" class="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-1 z-50">
                  <button @click="switchLanguage('en')" class="w-full px-4 py-2 text-left hover:bg-gray-100">🇬🇧 English</button>
                  <button @click="switchLanguage('ar')" class="w-full px-4 py-2 text-left hover:bg-gray-100">🇸🇦 العربية</button>
                </div>
              </div>
              <div class="relative">
                <button @click="showUserMenu = !showUserMenu" class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">{{ userInitials }}</div>
                </button>
                <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <button @click="logout" class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div class="p-4">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

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
  if (path.includes('/super-admin')) return 'Super Admin Dashboard'
  if (path.includes('/admin')) return 'Admin Dashboard'
  if (path.includes('/inventory/items')) return 'Inventory Items'
  if (path.includes('/inventory/transactions')) return 'Transactions'
  return 'Dashboard'
})

const switchLanguage = (lang: 'en' | 'ar') => {
  languageStore.switchLanguage(lang)
  showLanguageMenu.value = false
}

const logout = async () => {
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