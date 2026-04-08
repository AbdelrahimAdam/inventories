<template>
  <aside 
    class="fixed inset-y-0 z-40 w-64 sm:w-72 bg-gradient-to-b from-amber-800 to-gray-600 dark:from-amber-900 dark:to-gray-700 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col h-screen shadow-2xl"
    :class="[
      isRTL ? 'right-0' : 'left-0',
      isMobileOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')
    ]"
  >
    <!-- Fixed Header -->
    <div class="p-3 sm:p-5 border-b border-white/20 flex-shrink-0">
      <div class="text-center">
        <div class="inline-block p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-sm mb-2 sm:mb-3">
          <svg class="w-6 h-6 sm:w-8 sm:h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h2 class="text-lg sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-300 bg-clip-text text-transparent">
          {{ isSuperAdmin ? (isRTL ? 'لوحة التحكم' : 'Super Admin') : (isRTL ? 'بي.كوميرس' : 'P.commerce') }}
        </h2>
        <p v-if="!isSuperAdmin" class="text-xs text-white/70 mt-1 sm:mt-2 hidden sm:block">
          {{ isRTL ? 'نظام إدارة المخزون' : 'Inventory Management System' }}
        </p>
      </div>
    </div>
    
    <!-- Scrollable Navigation - Limited height to ensure footer visibility -->
    <nav class="flex-1 overflow-y-auto min-h-0 py-2 sm:py-4 px-2 sm:px-3 space-y-1 sm:space-y-2">
      <!-- Dashboard -->
      <router-link 
        :to="dashboardPath" 
        @click="closeMobile"
        class="flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group font-semibold border border-white/20 hover:border-white/40 shadow-lg"
        active-class="bg-gradient-to-r from-amber-600 to-orange-600 border-white/40 shadow-xl"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5 transition-colors group-hover:text-yellow-300" :class="isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-sm sm:text-base">{{ isRTL ? 'الرئيسية' : 'Dashboard' }}</span>
      </router-link>

      <!-- Inventory Section Header -->
      <div class="px-2 sm:px-3 pt-3 sm:pt-4 pb-1 sm:pb-2">
        <div class="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
          {{ isRTL ? 'المخزون' : 'Inventory' }}
        </div>
      </div>
      
      <!-- Items -->
      <router-link 
        to="/inventory/items" 
        @click="closeMobile"
        class="flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group font-semibold border border-white/20 hover:border-white/40 shadow-lg"
        active-class="bg-gradient-to-r from-amber-600 to-orange-600 border-white/40 shadow-xl"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5 transition-colors group-hover:text-yellow-300" :class="isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span class="text-sm sm:text-base">{{ isRTL ? 'الأصناف' : 'Items' }}</span>
      </router-link>

      <!-- Transactions -->
      <router-link 
        to="/inventory/transactions" 
        @click="closeMobile"
        class="flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group font-semibold border border-white/20 hover:border-white/40 shadow-lg"
        active-class="bg-gradient-to-r from-amber-600 to-orange-600 border-white/40 shadow-xl"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5 transition-colors group-hover:text-yellow-300" :class="isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span class="text-sm sm:text-base">{{ isRTL ? 'الحركات' : 'Transactions' }}</span>
      </router-link>

      <!-- Warehouses -->
      <router-link 
        to="/warehouses" 
        @click="closeMobile"
        class="flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group font-semibold border border-white/20 hover:border-white/40 shadow-lg"
        active-class="bg-gradient-to-r from-amber-600 to-orange-600 border-white/40 shadow-xl"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5 transition-colors group-hover:text-yellow-300" :class="isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span class="text-sm sm:text-base">{{ isRTL ? 'المخازن' : 'Warehouses' }}</span>
      </router-link>

      <!-- Invoices Section Header -->
      <div class="px-2 sm:px-3 pt-3 sm:pt-4 pb-1 sm:pb-2">
        <div class="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
          {{ isRTL ? 'الفواتير' : 'Invoices' }}
        </div>
      </div>
      
      <!-- Invoices -->
      <router-link 
        to="/invoices" 
        @click="closeMobile"
        class="flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group font-semibold border border-white/20 hover:border-white/40 shadow-lg"
        active-class="bg-gradient-to-r from-amber-600 to-orange-600 border-white/40 shadow-xl"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5 transition-colors group-hover:text-yellow-300" :class="isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="text-sm sm:text-base">{{ isRTL ? 'الفواتير' : 'Invoices' }}</span>
      </router-link>

      <!-- Reports Section Header -->
      <div class="px-2 sm:px-3 pt-3 sm:pt-4 pb-1 sm:pb-2">
        <div class="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
          {{ isRTL ? 'التقارير' : 'Reports' }}
        </div>
      </div>
      
      <!-- Stock Report -->
      <router-link 
        to="/reports/stock" 
        @click="closeMobile"
        class="flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group font-semibold border border-white/20 hover:border-white/40 shadow-lg"
        active-class="bg-gradient-to-r from-amber-600 to-orange-600 border-white/40 shadow-xl"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5 transition-colors group-hover:text-yellow-300" :class="isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-sm sm:text-base">{{ isRTL ? 'تقرير المخزون' : 'Stock Report' }}</span>
      </router-link>

      <!-- Super Admin Section -->
      <template v-if="isSuperAdmin">
        <div class="px-2 sm:px-3 pt-3 sm:pt-4 pb-1 sm:pb-2">
          <div class="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
            {{ isRTL ? 'المشرف العام' : 'Super Admin' }}
          </div>
        </div>
        
        <!-- Tenants -->
        <router-link 
          to="/super-admin/tenants" 
          @click="closeMobile"
          class="flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group font-semibold border border-white/20 hover:border-white/40 shadow-lg"
          active-class="bg-gradient-to-r from-amber-600 to-orange-600 border-white/40 shadow-xl"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5 transition-colors group-hover:text-yellow-300" :class="isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span class="text-sm sm:text-base">{{ isRTL ? 'المستأجرين' : 'Tenants' }}</span>
        </router-link>

        <!-- Users -->
        <router-link 
          to="/super-admin/users" 
          @click="closeMobile"
          class="flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group font-semibold border border-white/20 hover:border-white/40 shadow-lg"
          active-class="bg-gradient-to-r from-amber-600 to-orange-600 border-white/40 shadow-xl"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5 transition-colors group-hover:text-yellow-300" :class="isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span class="text-sm sm:text-base">{{ isRTL ? 'المستخدمين' : 'Users' }}</span>
        </router-link>
      </template>
      
      <!-- Spacer to push content up -->
      <div class="h-4"></div>
    </nav>
    
    <!-- Fixed Footer - Always visible at bottom -->
    <div class="border-t border-white/20 p-3 sm:p-4 flex-shrink-0 bg-gradient-to-t from-amber-800/50 to-transparent mt-auto">
      <button 
        @click="handleLogout"
        class="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all duration-300 text-red-200 hover:text-red-100 group font-semibold border border-red-500/30 hover:border-red-500/50 shadow-lg text-sm sm:text-base"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5 transition-colors group-hover:text-red-200" :class="isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span class="text-sm sm:text-base">{{ isRTL ? 'تسجيل الخروج' : 'Logout' }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'

// Define props with proper typing
defineProps<{
  isMobileOpen?: boolean
}>()

const emit = defineEmits<{
  (e: 'closeMobile'): void
}>()

const authStore = useAuthStore()
const languageStore = useLanguageStore()
const router = useRouter()

const isSuperAdmin = computed(() => authStore.isSuperAdmin)
const isRTL = computed(() => languageStore.direction === 'rtl')
const dashboardPath = computed(() => isSuperAdmin.value ? '/super-admin/dashboard' : '/admin/dashboard')

const closeMobile = () => {
  emit('closeMobile')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Custom scrollbar for the navigation area */
nav::-webkit-scrollbar {
  width: 3px;
}

nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Smooth transitions */
.router-link-active {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.3));
  backdrop-filter: blur(8px);
}

/* Hover effects */
.router-link-active svg {
  color: #fbbf24;
}

/* Ensure proper flex layout */
aside {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

nav {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0; /* Important for flex children to scroll properly */
}

/* Footer stays at bottom */
.flex-shrink-0:last-child {
  flex-shrink: 0;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .router-link-active {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.4), rgba(217, 119, 6, 0.4));
  }
  
  nav {
    flex: 1 1 auto;
  }
}
</style>
