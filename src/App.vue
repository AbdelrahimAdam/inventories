<template>
  <!-- Public Layout -->
  <div v-if="!authStore.isAuthenticated" class="min-h-screen">
    <router-view />
  </div>

  <!-- Authenticated Layout -->
  <div
    v-else
    :dir="languageStore.direction"
    :lang="languageStore.current"
    class="h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden"
  >
    <!-- Mobile Overlay -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="mobileMenuOpen = false"
    ></div>

    <!-- Sidebar - Fixed positioning handled by component itself -->
    <AppSidebar
      :is-mobile-open="mobileMenuOpen"
      @close-mobile="mobileMenuOpen = false"
    />

    <!-- Main Area -->
    <div class="flex-1 flex flex-col h-full overflow-hidden">
      <!-- Header -->
      <AppHeader
        @toggle-sidebar="mobileMenuOpen = !mobileMenuOpen"
        @logout="handleLogout"
        @toggle-dark-mode="toggleDarkMode"
        :is-dark-mode="isDarkMode"
      />

      <!-- Scrollable Content -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppHeader from '@/components/common/AppHeader.vue'

const authStore = useAuthStore()
const languageStore = useLanguageStore()
const router = useRouter()

const mobileMenuOpen = ref(false)
const isDarkMode = ref(false)

/* ---------------- DARK MODE ---------------- */

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

/* ---------------- LOGOUT ---------------- */

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

/* ---------------- RESPONSIVE ---------------- */

const handleResize = () => {
  if (window.innerWidth >= 1024) {
    mobileMenuOpen.value = false
  }
}

/* ---------------- PREVENT BACKGROUND SCROLL (PRO UX) ---------------- */

watch(mobileMenuOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  loadDarkModePreference()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style>
/* Reset */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Root layout */
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* Prevent body scroll when mobile menu is open */
body.menu-open {
  overflow: hidden;
}

/* Allow normal scrolling */
body {
  overflow-x: hidden;
  overflow-y: auto;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Dark mode */
.dark {
  color-scheme: dark;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .overflow-y-auto,
  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
  }

  button,
  a,
  [role="button"],
  input[type="button"],
  input[type="submit"] {
    min-height: 44px;
    min-width: 44px;
  }

  input,
  select,
  textarea {
    font-size: 16px !important;
  }
}

/* Tables */
@media (max-width: 768px) {
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.dark ::-webkit-scrollbar-track {
  background: #1f2937;
}

.dark ::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>