<template>
  <div class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg border-t border-gray-200/50 dark:border-gray-700/50 safe-area-bottom">
    <div class="flex justify-around items-stretch px-2 py-1 gap-1 max-w-2xl mx-auto">

      <!-- Dashboard - Always visible -->
      <router-link 
        :to="dashboardPath" 
        @click="handleNavigation"
        class="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-w-[56px] touch-manipulation"
        :class="[$route.path === dashboardPath || $route.path === '/' ? 'active-nav' : 'inactive-nav']"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-[10px] sm:text-xs mt-1 font-extrabold">الرئيسية</span>
      </router-link>

      <!-- Superadmin: Show System Management Links -->
      <template v-if="isSuperAdmin">
        <router-link 
          to="/super-admin/tenants" 
          @click="handleNavigation"
          class="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-w-[56px] touch-manipulation"
          :class="$route.path.startsWith('/super-admin/tenants') ? 'active-nav' : 'inactive-nav'"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span class="text-[10px] sm:text-xs mt-1 font-extrabold">المستأجرين</span>
        </router-link>

        <router-link 
          to="/super-admin/users" 
          @click="handleNavigation"
          class="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-w-[56px] touch-manipulation"
          :class="$route.path.startsWith('/super-admin/users') ? 'active-nav' : 'inactive-nav'"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span class="text-[10px] sm:text-xs mt-1 font-extrabold">المستخدمين</span>
        </router-link>

        <router-link 
          to="/super-admin/requests" 
          @click="handleNavigation"
          class="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-w-[56px] touch-manipulation"
          :class="$route.path.startsWith('/super-admin/requests') ? 'active-nav' : 'inactive-nav'"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-[10px] sm:text-xs mt-1 font-extrabold">الطلبات</span>
        </router-link>
      </template>

      <!-- Company Manager: Show full access -->
      <template v-else-if="isCompanyManager">
        <router-link 
          to="/inventory/items" 
          @click="handleNavigation"
          class="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-w-[56px] touch-manipulation"
          :class="$route.path.startsWith('/inventory/items') ? 'active-nav' : 'inactive-nav'"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span class="text-[10px] sm:text-xs mt-1 font-extrabold">الأصناف</span>
        </router-link>

        <router-link 
          to="/inventory/transactions" 
          @click="handleNavigation"
          class="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-w-[56px] touch-manipulation"
          :class="$route.path.startsWith('/inventory/transactions') ? 'active-nav' : 'inactive-nav'"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span class="text-[10px] sm:text-xs mt-1 font-extrabold">الحركات</span>
        </router-link>

        <router-link 
          to="/invoices" 
          @click="handleNavigation"
          class="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-w-[56px] touch-manipulation"
          :class="$route.path.startsWith('/invoices') ? 'active-nav' : 'inactive-nav'"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-[10px] sm:text-xs mt-1 font-extrabold">الفواتير</span>
        </router-link>
      </template>

      <!-- Warehouse Manager: Show items, transactions, invoices -->
      <template v-else-if="isWarehouseManager">
        <router-link 
          to="/inventory/items" 
          @click="handleNavigation"
          class="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-w-[56px] touch-manipulation"
          :class="$route.path.startsWith('/inventory/items') ? 'active-nav' : 'inactive-nav'"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span class="text-[10px] sm:text-xs mt-1 font-extrabold">الأصناف</span>
        </router-link>

        <router-link 
          to="/inventory/transactions" 
          @click="handleNavigation"
          class="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-w-[56px] touch-manipulation"
          :class="$route.path.startsWith('/inventory/transactions') ? 'active-nav' : 'inactive-nav'"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span class="text-[10px] sm:text-xs mt-1 font-extrabold">الحركات</span>
        </router-link>

        <router-link 
          to="/invoices" 
          @click="handleNavigation"
          class="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-w-[56px] touch-manipulation"
          :class="$route.path.startsWith('/invoices') ? 'active-nav' : 'inactive-nav'"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-[10px] sm:text-xs mt-1 font-extrabold">الفواتير</span>
        </router-link>
      </template>

      <!-- Viewer: Only Items (no transactions, no invoices) -->
      <template v-else-if="isViewer">
        <router-link 
          to="/inventory/items" 
          @click="handleNavigation"
          class="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-w-[56px] touch-manipulation"
          :class="$route.path.startsWith('/inventory/items') ? 'active-nav' : 'inactive-nav'"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span class="text-[10px] sm:text-xs mt-1 font-extrabold">الأصناف</span>
        </router-link>
      </template>

      <!-- More Menu (opens sidebar on mobile) - Always visible -->
      <button 
        @click="openSidebar"
        class="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-w-[56px] touch-manipulation inactive-nav hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span class="text-[10px] sm:text-xs mt-1 font-extrabold">القائمة</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{
  (e: 'open-sidebar'): void
}>()

const authStore = useAuthStore()

// Role checks from auth store
const isSuperAdmin = computed(() => authStore.isSuperAdmin)
const isCompanyManager = computed(() => authStore.isCompanyManager)
const isWarehouseManager = computed(() => authStore.isWarehouseManager)
const isViewer = computed(() => authStore.isViewer)
const isViewOnly = computed(() => authStore.isViewOnly)

// Dashboard path based on role (matches router)
const dashboardPath = computed(() => {
  if (isSuperAdmin.value) return '/super-admin/dashboard'
  if (isCompanyManager.value) return '/admin/dashboard'
  if (isWarehouseManager.value) return '/warehouse-manager/dashboard'
  if (isViewer.value || isViewOnly.value) return '/viewer/dashboard'
  return '/admin/dashboard'
})

const openSidebar = () => {
  emit('open-sidebar')
}

const handleNavigation = () => {
  // Close any open mobile overlays
  const mobileOverlays = document.querySelectorAll('.mobile-overlay, .mobile-menu, .dropdown-menu')
  mobileOverlays.forEach(overlay => {
    if (overlay.classList.contains('open')) {
      overlay.classList.remove('open')
    }
  })
  
  // Remove body classes
  document.body.classList.remove('sidebar-open', 'modal-open', 'overflow-hidden')
  
  // Close open modals
  const openModals = document.querySelectorAll('[data-modal-open], .modal.show, .fixed.inset-0:not(.z-30)')
  openModals.forEach(modal => {
    const closeButton = modal.querySelector('[data-modal-close]') as HTMLElement
    if (closeButton) closeButton.click()
  })
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.touch-manipulation {
  touch-action: manipulation;
  min-height: 44px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.touch-manipulation:active {
  transform: scale(0.94);
  transition: transform 0.05s ease;
}

.active-nav {
  background: rgba(212, 165, 116, 0.15);
  color: #b8915a;
  font-weight: 900;
  position: relative;
}

.dark .active-nav {
  color: #d4a574;
  background: rgba(212, 165, 116, 0.2);
}

.active-nav::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 25%;
  right: 25%;
  height: 2.5px;
  background: linear-gradient(to right, #d4a574, #b8915a);
  border-radius: 4px;
}

[dir="rtl"] .active-nav::after {
  background: linear-gradient(to left, #d4a574, #b8915a);
}

.dark .active-nav::after {
  background: linear-gradient(to right, #d4a574, #b8915a);
}

[dir="rtl"] .dark .active-nav::after {
  background: linear-gradient(to left, #d4a574, #b8915a);
}

.inactive-nav {
  color: #6b7280;
}

.dark .inactive-nav {
  color: #9ca3af;
}

.inactive-nav:hover {
  background: rgba(0, 0, 0, 0.04);
}

.dark .inactive-nav:hover {
  background: rgba(255, 255, 255, 0.06);
}

svg {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.touch-manipulation:active svg {
  transform: scale(0.9);
}

body {
  -webkit-tap-highlight-color: transparent;
}

:global(.modal-open) .fixed.bottom-0 {
  pointer-events: none;
  opacity: 0.9;
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .safe-area-bottom {
    padding-bottom: calc(0.375rem + env(safe-area-inset-bottom));
  }
}

@media (min-width: 640px) {
  .safe-area-bottom {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-height: 500px) and (orientation: landscape) {
  .touch-manipulation {
    min-height: 40px;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }
  
  .touch-manipulation span {
    font-size: 8px !important;
    margin-top: 0.125rem !important;
  }
  
  .touch-manipulation svg {
    width: 16px !important;
    height: 16px !important;
  }
}
</style>