<template>
  <div class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-t border-gray-300/50 dark:border-gray-600/50 safe-area-bottom">
    <div class="flex justify-around items-center px-2 py-1">
      <!-- Dashboard -->
      <router-link 
        :to="dashboardPath" 
        @click="closeMobile"
        class="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-200"
        :class="$route.path === dashboardPath ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/20'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-xs mt-1 font-medium">الرئيسية</span>
      </router-link>

      <!-- Items -->
      <router-link 
        to="/inventory/items" 
        @click="closeMobile"
        class="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-200"
        :class="$route.path.startsWith('/inventory/items') ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/20'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span class="text-xs mt-1 font-medium">الأصناف</span>
      </router-link>

      <!-- Invoices -->
      <router-link 
        to="/invoices" 
        @click="closeMobile"
        class="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-200"
        :class="$route.path.startsWith('/invoices') ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/20'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="text-xs mt-1 font-medium">الفواتير</span>
      </router-link>

      <!-- Reports -->
      <router-link 
        to="/reports/stock" 
        @click="closeMobile"
        class="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-200"
        :class="$route.path.startsWith('/reports') ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/20'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-xs mt-1 font-medium">التقارير</span>
      </router-link>

      <!-- More Menu (opens sidebar on mobile) -->
      <button 
        @click="openSidebar"
        class="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/20"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span class="text-xs mt-1 font-medium">القائمة</span>
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

const isSuperAdmin = computed(() => authStore.isSuperAdmin)
const dashboardPath = computed(() => isSuperAdmin.value ? '/super-admin/dashboard' : '/admin/dashboard')

const openSidebar = () => {
  emit('open-sidebar')
}

const closeMobile = () => {
  // Just for closing any mobile-specific states
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* Glass morphism effect for active state */
.router-link-active,
.router-link-exact-active {
  position: relative;
}

.router-link-active::before,
.router-link-exact-active::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 0.5rem;
  z-index: -1;
}

.dark .router-link-active::before,
.dark .router-link-exact-active::before {
  background: rgba(34, 197, 94, 0.2);
}

/* Ensure bottom nav doesn't interfere with modals */
:global(.fixed.inset-0) {
  z-index: 40 !important;
}

/* Modals should be above bottom nav */
:global(.z-50) {
  z-index: 50 !important;
}

/* Hover effect enhancement */
button:active,
a:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}
</style>