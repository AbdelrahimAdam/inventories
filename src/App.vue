<template>
  <!-- Install Prompt for PWA - ALWAYS VISIBLE (outside auth condition) -->
  <InstallPrompt ref="installPromptRef" />

  <!-- Public Layout -->
  <div v-if="!authStore.isAuthenticated" class="min-h-screen">
    <router-view />
  </div>

  <!-- Authenticated Layout -->
  <div
    v-else
    :dir="languageStore.direction"
    :lang="languageStore.current"
    class="h-screen flex transition-colors duration-300 overflow-hidden bg-gradient-to-br from-green-400 via-green-300 to-orange-300 dark:from-green-900 dark:via-emerald-800 dark:to-orange-900"
    :class="{ 'rtl': languageStore.direction === 'rtl' }"
  >
    <!-- Mobile Overlay - Simple dark overlay without blur -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 bg-black/50 transition-all duration-300 lg:hidden"
      style="z-index: 40;"
      @click="mobileMenuOpen = false"
    ></div>

    <!-- Sidebar - Higher z-index -->
    <div class="relative" style="z-index: 45;">
      <AppSidebar
        :is-mobile-open="mobileMenuOpen"
        :is-rtl="languageStore.direction === 'rtl'"
        @close-mobile="mobileMenuOpen = false"
      />
    </div>

    <!-- Main Area -->
    <div class="flex-1 flex flex-col h-full overflow-hidden" style="z-index: 1;">
      <!-- Header -->
      <AppHeader
        @toggle-sidebar="mobileMenuOpen = !mobileMenuOpen"
        @logout="handleLogout"
        @toggle-dark-mode="toggleDarkMode"
        :is-dark-mode="isDarkMode"
        :is-rtl="languageStore.direction === 'rtl'"
      />

      <!-- Scrollable Content -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 pb-20 lg:pb-6">
        <div class="main-content-container">
          <router-view :key="languageStore.current" />
        </div>
      </main>
    </div>

    <!-- Bottom Navigation - Mobile Only -->
    <BottomNav @open-sidebar="mobileMenuOpen = true" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import InstallPrompt from '@/components/common/InstallPrompt.vue'

const authStore = useAuthStore()
const languageStore = useLanguageStore()
const router = useRouter()

const mobileMenuOpen = ref(false)
const isDarkMode = ref(false)
const installPromptRef = ref<InstanceType<typeof InstallPrompt> | null>(null)

// Watch for authentication state changes for instant redirect
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated) {
      router.replace('/login').catch(() => {
        window.location.href = '/login'
      })
    }
  }
)

// Watch for language changes
watch(() => languageStore.direction, async (newDirection) => {
  await nextTick()
  document.documentElement.setAttribute('dir', newDirection)
  document.body.setAttribute('dir', newDirection)
  window.dispatchEvent(new Event('resize'))
})

/* Dark mode functions */
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

const handleLogout = async () => {
  try {
    await authStore.logout()
    await router.replace('/login')
    await router.isReady()
  } catch (error) {
    console.error('Logout error:', error)
    window.location.href = '/login'
  }
}

const handleResize = () => {
  if (window.innerWidth >= 1024) {
    mobileMenuOpen.value = false
  }
}

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
  document.documentElement.setAttribute('dir', languageStore.direction)
  document.body.setAttribute('dir', languageStore.direction)
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

/* RTL support */
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

/* Dark mode */
.dark {
  color-scheme: dark;
}

/* Main content container */
.main-content-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

@media (min-width: 1280px) {
  .main-content-container {
    max-width: 1400px;
    margin-inline-start: auto;
    margin-inline-end: auto;
  }
}

@media (min-width: 1600px) {
  .main-content-container {
    max-width: 1600px;
  }
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

/* Responsive tables */
@media (max-width: 768px) {
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}

/* Custom Scrollbar */
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
  transition: all 0.3s ease;
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

/* Smooth transitions */
* {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Ensure sidebar is above overlay on mobile */
@media (max-width: 1023px) {
  .fixed.inset-0 {
    z-index: 40;
  }
}

/* Card hover effects */
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

/* Gradient text */
.text-gradient {
  background: linear-gradient(135deg, #10b981 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .text-gradient {
  background: linear-gradient(135deg, #34d399 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>