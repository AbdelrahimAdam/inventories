<template>
  <aside 
    class="fixed inset-y-0 z-40 w-80 sm:w-84 bg-gradient-to-br from-amber-800 via-amber-700 to-gray-700 dark:from-amber-900 dark:via-amber-800 dark:to-gray-800 text-white shadow-2xl backdrop-blur-sm transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col h-screen"
    :class="[
      isRTL ? 'right-0' : 'left-0',
      isMobileOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')
    ]"
  >
    <!-- Header with Logo - Always centered -->
    <div class="p-5 sm:p-6 border-b border-white/20 flex-shrink-0 bg-black/10">
      <div class="text-center">
        <div class="inline-block rounded-full bg-white/15 p-2 sm:p-3 mb-2 sm:mb-3 shadow-lg">
          <img 
            src="/icon-source.png" 
            alt="P.commerce Logo" 
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
          />
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-white tracking-wide">
          P.commerce
        </h2>
        <p v-if="!isSuperAdmin" class="text-sm text-white/80 mt-1 sm:mt-2 font-medium">
          نظام إدارة المخزون
        </p>
      </div>
    </div>

    <!-- Navigation – every link is a card (permanent background) -->
    <nav class="flex-1 overflow-y-auto min-h-0 py-4 sm:py-6 px-3 sm:px-4 space-y-2 sm:space-y-3">
      <!-- Dashboard Button -->
      <router-link 
        :to="dashboardLink"
        @click="closeMobile"
        class="flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] text-base sm:text-lg font-black tracking-wide shadow-sm bg-black/10 hover:bg-white/15"
        :class="[
          isRTL ? 'text-right' : 'text-left',
          isDashboardActive ? 'bg-amber-900/60 text-white shadow-lg ring-2 ring-white/30' : ''
        ]"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-colors flex-shrink-0" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-base sm:text-lg font-black">الرئيسية</span>
      </router-link>

      <!-- الأصناف Button -->
      <router-link 
        v-if="authStore.canEdit"
        to="/inventory/items" 
        @click="closeMobile"
        class="flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] text-base sm:text-lg font-black tracking-wide bg-black/10 hover:bg-white/15"
        :class="[isRTL ? 'text-right' : 'text-left']"
        active-class="bg-amber-900/60 text-white shadow-lg ring-2 ring-white/30"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-colors flex-shrink-0" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span class="text-base sm:text-lg font-black">الأصناف</span>
      </router-link>

      <!-- الأصناف (عرض فقط) Button -->
      <router-link 
        v-else
        to="/inventory/items" 
        @click="closeMobile"
        class="flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] text-base sm:text-lg font-black tracking-wide bg-black/10 hover:bg-white/15"
        :class="[isRTL ? 'text-right' : 'text-left']"
        active-class="bg-amber-900/60 text-white shadow-lg ring-2 ring-white/30"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-colors flex-shrink-0" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span class="text-base sm:text-lg font-black">الأصناف (عرض فقط)</span>
      </router-link>

      <!-- الحركات Button -->
      <router-link 
        v-if="authStore.canEdit"
        to="/inventory/transactions" 
        @click="closeMobile"
        class="flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] text-base sm:text-lg font-black tracking-wide bg-black/10 hover:bg-white/15"
        :class="[isRTL ? 'text-right' : 'text-left']"
        active-class="bg-amber-900/60 text-white shadow-lg ring-2 ring-white/30"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-colors flex-shrink-0" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span class="text-base sm:text-lg font-black">الحركات</span>
      </router-link>

      <!-- المخازن Button -->
      <router-link 
        v-if="authStore.canEdit"
        to="/warehouses" 
        @click="closeMobile"
        class="flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] text-base sm:text-lg font-black tracking-wide bg-black/10 hover:bg-white/15"
        :class="[isRTL ? 'text-right' : 'text-left']"
        active-class="bg-amber-900/60 text-white shadow-lg ring-2 ring-white/30"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-colors flex-shrink-0" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span class="text-base sm:text-lg font-black">المخازن</span>
      </router-link>

      <!-- الفواتير Button -->
      <router-link 
        v-if="authStore.canEdit"
        to="/invoices" 
        @click="closeMobile"
        class="flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] text-base sm:text-lg font-black tracking-wide bg-black/10 hover:bg-white/15"
        :class="[isRTL ? 'text-right' : 'text-left']"
        active-class="bg-amber-900/60 text-white shadow-lg ring-2 ring-white/30"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-colors flex-shrink-0" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="text-base sm:text-lg font-black">الفواتير</span>
      </router-link>

      <!-- تقرير المخزون Button -->
      <router-link 
        to="/reports/stock" 
        @click="closeMobile"
        class="flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] text-base sm:text-lg font-black tracking-wide bg-black/10 hover:bg-white/15"
        :class="[isRTL ? 'text-right' : 'text-left']"
        active-class="bg-amber-900/60 text-white shadow-lg ring-2 ring-white/30"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-colors flex-shrink-0" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-base sm:text-lg font-black">تقرير المخزون</span>
      </router-link>

      <!-- إدارة المستخدمين Button -->
      <router-link 
        v-if="authStore.canManageUsers"
        to="/admin/users" 
        @click="closeMobile"
        class="flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] text-base sm:text-lg font-black tracking-wide bg-black/10 hover:bg-white/15"
        :class="[isRTL ? 'text-right' : 'text-left']"
        active-class="bg-amber-900/60 text-white shadow-lg ring-2 ring-white/30"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-colors flex-shrink-0" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span class="text-base sm:text-lg font-black">إدارة المستخدمين</span>
      </router-link>

      <!-- الملف الشخصي Button -->
      <router-link 
        to="/profile" 
        @click="closeMobile"
        class="flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] text-base sm:text-lg font-black tracking-wide bg-black/10 hover:bg-white/15"
        :class="[isRTL ? 'text-right' : 'text-left']"
        active-class="bg-amber-900/60 text-white shadow-lg ring-2 ring-white/30"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-colors flex-shrink-0" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-base sm:text-lg font-black">الملف الشخصي</span>
      </router-link>

      <!-- إعدادات الشركة Button -->
      <router-link 
        v-if="authStore.canManageWarehouses"
        to="/settings/company" 
        @click="closeMobile"
        class="flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] text-base sm:text-lg font-black tracking-wide bg-black/10 hover:bg-white/15"
        :class="[isRTL ? 'text-right' : 'text-left']"
        active-class="bg-amber-900/60 text-white shadow-lg ring-2 ring-white/30"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-colors flex-shrink-0" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span class="text-base sm:text-lg font-black">إعدادات الشركة</span>
      </router-link>

      <!-- الإعدادات العامة Button -->
      <router-link 
        v-if="authStore.canManageWarehouses"
        to="/settings" 
        @click="closeMobile"
        class="flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] text-base sm:text-lg font-black tracking-wide bg-black/10 hover:bg-white/15"
        :class="[isRTL ? 'text-right' : 'text-left']"
        active-class="bg-amber-900/60 text-white shadow-lg ring-2 ring-white/30"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-colors flex-shrink-0" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="text-base sm:text-lg font-black">الإعدادات العامة</span>
      </router-link>

      <!-- Super Admin only buttons -->
      <template v-if="isSuperAdmin">
        <router-link 
          to="/super-admin/tenants" 
          @click="closeMobile"
          class="flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] text-base sm:text-lg font-black tracking-wide bg-black/10 hover:bg-white/15"
          :class="[isRTL ? 'text-right' : 'text-left']"
          active-class="bg-amber-900/60 text-white shadow-lg ring-2 ring-white/30"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-colors flex-shrink-0" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span class="text-base sm:text-lg font-black">المستأجرين</span>
        </router-link>

        <router-link 
          to="/super-admin/users" 
          @click="closeMobile"
          class="flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] text-base sm:text-lg font-black tracking-wide bg-black/10 hover:bg-white/15"
          :class="[isRTL ? 'text-right' : 'text-left']"
          active-class="bg-amber-900/60 text-white shadow-lg ring-2 ring-white/30"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-colors flex-shrink-0" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span class="text-base sm:text-lg font-black">المستخدمين</span>
        </router-link>
      </template>

      <div class="h-4"></div>
    </nav>

    <!-- Logout Footer – also a card -->
    <div class="border-t border-white/20 p-3 sm:p-4 flex-shrink-0 mt-auto">
      <button 
        @click="handleLogout"
        class="flex items-center justify-center w-full px-5 sm:px-6 py-3 sm:py-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] bg-black/10 hover:bg-red-500/30 text-red-200 hover:text-red-100 group font-black text-base sm:text-lg"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-colors flex-shrink-0 ml-2 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span class="text-base sm:text-lg font-black">تسجيل الخروج</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useRoute } from 'vue-router'

defineProps<{
  isMobileOpen?: boolean
}>()

const emit = defineEmits<{
  (e: 'closeMobile'): void
}>()

const authStore = useAuthStore()
const languageStore = useLanguageStore()
const router = useRouter()
const route = useRoute()

const isSuperAdmin = computed(() => authStore.isSuperAdmin)
const isRTL = computed(() => languageStore.direction === 'rtl')

const dashboardLink = computed(() => {
  if (authStore.isSuperAdmin) return '/super-admin/dashboard'
  if (authStore.isCompanyManager) return '/admin/dashboard'
  if (authStore.isWarehouseManager) return '/warehouse-manager/dashboard'
  if (authStore.isViewer) return '/viewer/dashboard'
  return '/admin/dashboard'
})

const isDashboardActive = computed(() => {
  const path = route.path
  return path === dashboardLink.value || 
         path === '/' || 
         path === '/admin/dashboard' || 
         path === '/super-admin/dashboard' || 
         path === '/warehouse-manager/dashboard' || 
         path === '/viewer/dashboard'
})

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
  width: 4px;
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
  min-height: 0;
}

/* Footer stays at bottom */
.flex-shrink-0:last-child {
  flex-shrink: 0;
}

/* Force boldness for Arabic text */
.router-link-active span,
.router-link span,
a span,
button span {
  font-weight: 900 !important;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

/* Active link enhancements */
.router-link-active {
  letter-spacing: 0.02em;
}
</style>