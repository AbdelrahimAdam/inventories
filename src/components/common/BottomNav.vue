<template>
  <div class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg border-t border-gray-200/50 dark:border-gray-700/50 safe-area-bottom">
    <div class="flex justify-around items-stretch px-2 py-1.5 gap-1">
      
      <!-- Dashboard -->
      <router-link 
        :to="dashboardPath" 
        @click="handleNavigation"
        class="flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-200 min-w-[60px] touch-manipulation"
        :class="$route.path === dashboardPath ? 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-700 dark:text-amber-300 shadow-inner' : 'text-gray-600 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800'"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-xs sm:text-sm mt-1 font-extrabold">الرئيسية</span>
      </router-link>

      <!-- الأصناف -->
      <router-link 
        to="/inventory/items" 
        @click="handleNavigation"
        class="flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-200 min-w-[60px] touch-manipulation"
        :class="$route.path.startsWith('/inventory/items') ? 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-700 dark:text-amber-300 shadow-inner' : 'text-gray-600 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800'"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span class="text-xs sm:text-sm mt-1 font-extrabold">الأصناف</span>
      </router-link>

      <!-- الحركات -->
      <router-link 
        to="/inventory/transactions" 
        @click="handleNavigation"
        class="flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-200 min-w-[60px] touch-manipulation"
        :class="$route.path.startsWith('/inventory/transactions') ? 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-700 dark:text-amber-300 shadow-inner' : 'text-gray-600 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800'"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span class="text-xs sm:text-sm mt-1 font-extrabold">الحركات</span>
      </router-link>

      <!-- الفواتير -->
      <router-link 
        to="/invoices" 
        @click="handleNavigation"
        class="flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-200 min-w-[60px] touch-manipulation"
        :class="$route.path.startsWith('/invoices') ? 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-700 dark:text-amber-300 shadow-inner' : 'text-gray-600 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800'"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="text-xs sm:text-sm mt-1 font-extrabold">الفواتير</span>
      </router-link>

      <!-- More Menu (opens sidebar on mobile) -->
      <button 
        @click="openSidebar"
        class="flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-200 min-w-[60px] touch-manipulation text-gray-600 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800 active:scale-95"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span class="text-xs sm:text-sm mt-1 font-extrabold">القائمة</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const emit = defineEmits<{
  (e: 'open-sidebar'): void
}>()

const authStore = useAuthStore()
const router = useRouter()

const isSuperAdmin = computed(() => authStore.isSuperAdmin)
const dashboardPath = computed(() => isSuperAdmin.value ? '/super-admin/dashboard' : '/admin/dashboard')

const openSidebar = () => {
  emit('open-sidebar')
}

const handleNavigation = () => {
  // Close any open mobile overlays or modals before navigation
  const mobileOverlays = document.querySelectorAll('.mobile-overlay, .mobile-menu, .dropdown-menu')
  mobileOverlays.forEach(overlay => {
    if (overlay.classList.contains('open')) {
      overlay.classList.remove('open')
    }
  })
  
  // Remove any sidebar/overlay classes from body
  document.body.classList.remove('sidebar-open', 'modal-open', 'overflow-hidden')
  
  // Close any open dropdowns or popups
  const openModals = document.querySelectorAll('[data-modal-open], .modal.show')
  openModals.forEach(modal => {
    const closeButton = modal.querySelector('[data-modal-close]') as HTMLElement
    if (closeButton) closeButton.click()
  })
  
  // Small delay to ensure smooth transition before navigation
  setTimeout(() => {
    // Navigation happens automatically via router-link
  }, 50)
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* Enhanced touch target size – minimum 48px height */
.touch-manipulation {
  touch-action: manipulation;
  min-height: 56px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

/* Press effect */
.touch-manipulation:active {
  transform: scale(0.96);
  transition: transform 0.05s ease;
}

/* Ensure bottom nav doesn't interfere with modals */
:global(.fixed.inset-0) {
  z-index: 40 !important;
}

/* Modals should be above bottom nav */
:global(.z-50) {
  z-index: 50 !important;
}

/* Add padding to main content when bottom nav is visible */
@media (max-width: 1023px) {
  :global(.main-content-container) {
    padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px));
  }
  
  :global(.table-container) {
    max-height: calc(100vh - 240px) !important;
  }
}

/* Active state enhancement */
.router-link-active {
  font-weight: 900;
  position: relative;
}

/* Hover effect on non-active items */
.router-link-active:not(.bg-gradient-to-r) {
  background: rgba(245, 158, 11, 0.1);
}

/* Smooth icon transition */
svg {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Prevent body scroll when bottom nav is touched */
body {
  -webkit-tap-highlight-color: transparent;
}

/* Ensure bottom navigation doesn't capture clicks meant for modals */
:global(.modal-open) .fixed.bottom-0 {
  pointer-events: none;
  opacity: 0.8;
}

/* Safe area handling for notch devices */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .safe-area-bottom {
    padding-bottom: calc(0.375rem + env(safe-area-inset-bottom));
  }
}
</style>
