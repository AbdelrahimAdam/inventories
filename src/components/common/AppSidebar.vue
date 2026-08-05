<template>
  <aside 
    class="fixed inset-y-0 z-40 w-[75%] max-w-[320px] sm:w-80 lg:w-72 xl:w-80 bg-gradient-to-br from-amber-800 via-amber-700 to-gray-700 dark:from-amber-900 dark:via-amber-800 dark:to-gray-800 text-white shadow-2xl backdrop-blur-sm transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col h-screen overflow-hidden"
    :class="[
      isRTL ? 'right-0' : 'left-0',
      isMobileOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')
    ]"
  >
    <!-- Header with Logo -->
    <div class="sidebar-header">
      <div class="flex flex-col items-center justify-center">
        <div class="logo-container">
          <img 
            src="/icon-source.png" 
            alt="P.commerce Logo" 
            class="logo-image"
          />
        </div>
        <h2 class="brand-name">
          P.commerce
        </h2>
        <p v-if="!isSuperAdmin" class="brand-subtitle">
          نظام إدارة المخزون
        </p>
        <p v-else class="brand-subtitle brand-subtitle-admin">
          لوحة التحكم الإدارية
        </p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <!-- Dashboard Button -->
      <router-link 
        :to="dashboardLink"
        @click="closeMobile"
        class="nav-link"
        :class="[
          isRTL ? 'text-right' : 'text-left',
          isDashboardActive ? 'nav-link-active' : ''
        ]"
      >
        <svg class="nav-icon" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="nav-label">الرئيسية</span>
      </router-link>

      <!-- Super Admin: System Management Links -->
      <template v-if="isSuperAdmin">
        <router-link 
          to="/super-admin/tenants" 
          @click="closeMobile"
          class="nav-link"
          :class="[isRTL ? 'text-right' : 'text-left']"
          active-class="nav-link-active"
        >
          <svg class="nav-icon" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span class="nav-label">المستأجرين</span>
        </router-link>

        <router-link 
          to="/super-admin/users" 
          @click="closeMobile"
          class="nav-link"
          :class="[isRTL ? 'text-right' : 'text-left']"
          active-class="nav-link-active"
        >
          <svg class="nav-icon" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span class="nav-label">المستخدمين</span>
        </router-link>

        <router-link 
          to="/super-admin/requests" 
          @click="closeMobile"
          class="nav-link"
          :class="[isRTL ? 'text-right' : 'text-left']"
          active-class="nav-link-active"
        >
          <svg class="nav-icon" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="nav-label">طلبات الترقية</span>
        </router-link>

        <router-link 
          to="/super-admin/settings" 
          @click="closeMobile"
          class="nav-link"
          :class="[isRTL ? 'text-right' : 'text-left']"
          active-class="nav-link-active"
        >
          <svg class="nav-icon" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="nav-label">إعدادات النظام</span>
        </router-link>

        <div class="nav-divider"></div>
      </template>

      <!-- Regular User Links -->
      <template v-else>
        <router-link 
          v-if="authStore.canEdit"
          to="/inventory/items" 
          @click="closeMobile"
          class="nav-link"
          :class="[isRTL ? 'text-right' : 'text-left']"
          active-class="nav-link-active"
        >
          <svg class="nav-icon" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span class="nav-label">الأصناف</span>
        </router-link>

        <router-link 
          v-if="authStore.canEdit"
          to="/inventory/transactions" 
          @click="closeMobile"
          class="nav-link"
          :class="[isRTL ? 'text-right' : 'text-left']"
          active-class="nav-link-active"
        >
          <svg class="nav-icon" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span class="nav-label">الحركات</span>
        </router-link>

        <router-link 
          v-if="authStore.canEdit"
          to="/warehouses" 
          @click="closeMobile"
          class="nav-link"
          :class="[isRTL ? 'text-right' : 'text-left']"
          active-class="nav-link-active"
        >
          <svg class="nav-icon" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span class="nav-label">المخازن</span>
        </router-link>

        <router-link 
          v-if="authStore.canEdit"
          to="/invoices" 
          @click="closeMobile"
          class="nav-link"
          :class="[isRTL ? 'text-right' : 'text-left']"
          active-class="nav-link-active"
        >
          <svg class="nav-icon" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="nav-label">الفواتير</span>
        </router-link>

        <router-link 
          v-if="authStore.canManageUsers"
          to="/admin/users" 
          @click="closeMobile"
          class="nav-link"
          :class="[isRTL ? 'text-right' : 'text-left']"
          active-class="nav-link-active"
        >
          <svg class="nav-icon" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span class="nav-label">إدارة المستخدمين</span>
        </router-link>

        <router-link 
          v-if="authStore.canManageWarehouses"
          to="/settings/company" 
          @click="closeMobile"
          class="nav-link"
          :class="[isRTL ? 'text-right' : 'text-left']"
          active-class="nav-link-active"
        >
          <svg class="nav-icon" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span class="nav-label">إعدادات الشركة</span>
        </router-link>

        <router-link 
          v-if="authStore.canManageWarehouses"
          to="/settings" 
          @click="closeMobile"
          class="nav-link"
          :class="[isRTL ? 'text-right' : 'text-left']"
          active-class="nav-link-active"
        >
          <svg class="nav-icon" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="nav-label">الإعدادات العامة</span>
        </router-link>
      </template>

      <!-- Profile -->
      <router-link 
        to="/profile" 
        @click="closeMobile"
        class="nav-link"
        :class="[isRTL ? 'text-right' : 'text-left']"
        active-class="nav-link-active"
      >
        <svg class="nav-icon" :class="isRTL ? 'ml-3' : 'mr-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="nav-label">الملف الشخصي</span>
      </router-link>
    </nav>

    <!-- Logout Footer - Always visible -->
    <div class="sidebar-footer">
      <button 
        @click="handleLogout"
        class="logout-btn"
      >
        <svg class="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span class="logout-label">تسجيل الخروج</span>
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
/* Scrollbar */
.sidebar-nav::-webkit-scrollbar {
  width: 3px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* Sidebar Container */
aside {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* Header - Logo & Brand */
.sidebar-header {
  flex-shrink: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2), transparent);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 12px 14px 10px;
}

@media (min-width: 640px) {
  .sidebar-header {
    padding: 16px 20px 12px;
  }
}

@media (min-width: 1024px) {
  .sidebar-header {
    padding: 20px 24px 16px;
  }
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 6px;
}

@media (min-width: 640px) {
  .logo-container {
    margin-bottom: 8px;
  }
}

.logo-image {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  background: rgba(255,255,255,0.15);
  padding: 3px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

@media (min-width: 640px) {
  .logo-image {
    width: 52px;
    height: 52px;
  }
}

@media (min-width: 1024px) {
  .logo-image {
    width: 60px;
    height: 60px;
  }
}

.brand-name {
  font-size: 1rem;
  font-weight: 900;
  color: white;
  text-align: center;
  letter-spacing: -0.5px;
  margin-bottom: 1px;
}

@media (min-width: 640px) {
  .brand-name {
    font-size: 1.2rem;
  }
}

@media (min-width: 1024px) {
  .brand-name {
    font-size: 1.4rem;
  }
}

.brand-subtitle {
  font-size: 0.6rem;
  color: rgba(255,255,255,0.7);
  text-align: center;
  font-weight: 600;
  margin-top: 1px;
}

@media (min-width: 640px) {
  .brand-subtitle {
    font-size: 0.7rem;
  }
}

.brand-subtitle-admin {
  color: rgba(251, 191, 36, 0.8);
}

/* Navigation */
.sidebar-nav {
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  padding: 6px 10px 4px;
}

@media (min-width: 640px) {
  .sidebar-nav {
    padding: 8px 14px 6px;
  }
}

@media (min-width: 1024px) {
  .sidebar-nav {
    padding: 10px 16px 8px;
  }
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 700;
  font-size: 0.95rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 3px;
  text-decoration: none;
  color: rgba(255,255,255,0.8);
  min-height: 44px;
}

@media (min-width: 640px) {
  .nav-link {
    padding: 12px 18px;
    font-size: 1rem;
    min-height: 48px;
  }
}

@media (min-width: 1024px) {
  .nav-link {
    padding: 12px 20px;
    font-size: 1.05rem;
    min-height: 50px;
  }
}

.nav-link:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.2);
  color: white;
}

.nav-link-active {
  background: rgba(251, 146, 60, 0.3) !important;
  border-color: rgba(255,255,255,0.4) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.nav-link-active .nav-icon {
  color: #fbbf24;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: rgba(255,255,255,0.6);
  transition: color 0.2s ease;
}

@media (min-width: 640px) {
  .nav-icon {
    width: 22px;
    height: 22px;
  }
}

.nav-link:hover .nav-icon {
  color: white;
}

.nav-label {
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

@media (min-width: 640px) {
  .nav-label {
    font-size: 1rem;
  }
}

.nav-divider {
  border-top: 1px solid rgba(255,255,255,0.08);
  margin: 6px 0;
}

/* Footer - Logout Button */
.sidebar-footer {
  flex-shrink: 0;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding: 10px 12px;
  background: linear-gradient(to top, rgba(0,0,0,0.15), transparent);
  margin-top: auto;
}

@media (min-width: 640px) {
  .sidebar-footer {
    padding: 12px 16px;
  }
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(239, 68, 68, 0.15);
  color: rgba(254, 202, 202, 0.8);
  font-weight: 700;
  font-size: 0.95rem;
  min-height: 44px;
}

@media (min-width: 640px) {
  .logout-btn {
    padding: 12px 20px;
    font-size: 1rem;
    min-height: 48px;
  }
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.4);
  color: white;
}

.logout-btn svg {
  color: rgba(254, 202, 202, 0.7);
  transition: color 0.2s ease;
}

.logout-btn:hover svg {
  color: white;
}

.logout-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin: 0 6px;
}

@media (min-width: 640px) {
  .logout-icon {
    width: 20px;
    height: 20px;
  }
}

.logout-label {
  font-size: 0.9rem;
  font-weight: 700;
}

@media (min-width: 640px) {
  .logout-label {
    font-size: 1rem;
  }
}

/* RTL Support */
[dir="rtl"] .nav-link {
  text-align: right;
}

[dir="rtl"] .nav-link-active {
  transform: translateX(-2px);
}

[dir="ltr"] .nav-link-active {
  transform: translateX(2px);
}

/* Mobile Specific */
@media (max-width: 640px) {
  .nav-link {
    padding: 8px 12px;
    font-size: 0.85rem;
    min-height: 40px;
    border-radius: 8px;
  }
  
  .nav-label {
    font-size: 0.8rem;
  }
  
  .nav-icon {
    width: 18px;
    height: 18px;
  }

  .logo-image {
    width: 38px;
    height: 38px;
  }
  
  .brand-name {
    font-size: 0.9rem;
  }
  
  .brand-subtitle {
    font-size: 0.55rem;
  }
  
  .sidebar-header {
    padding: 8px 10px 6px;
  }
  
  .sidebar-footer {
    padding: 6px 8px;
  }
  
  .logout-btn {
    padding: 8px 12px;
    font-size: 0.85rem;
    min-height: 38px;
  }
  
  .logout-icon {
    width: 16px;
    height: 16px;
  }
  
  .logout-label {
    font-size: 0.8rem;
  }
}

/* Very small screens */
@media (max-width: 400px) {
  .logo-image {
    width: 32px;
    height: 32px;
  }
  
  .brand-name {
    font-size: 0.8rem;
  }
  
  .brand-subtitle {
    font-size: 0.5rem;
  }
  
  .nav-link {
    padding: 6px 10px;
    font-size: 0.8rem;
    min-height: 36px;
  }
  
  .nav-label {
    font-size: 0.75rem;
  }
  
  .nav-icon {
    width: 16px;
    height: 16px;
  }
}
</style>