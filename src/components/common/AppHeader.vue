<template>
  <header 
    class="app-header" 
    :dir="languageStore.direction"
    role="banner"
  >
    <div class="app-header-inner">
      <!-- Left Section -->
      <div class="app-header-left">
        <!-- Mobile menu button -->
        <button 
          @click="$emit('toggle-sidebar')" 
          class="header-btn header-btn-mobile"
          aria-label="فتح القائمة الجانبية"
          title="القائمة"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Breadcrumb / Page Title -->
        <div class="header-title-wrapper">
          <h1 class="header-title">{{ pageTitle }}</h1>
          <span v-if="breadcrumb" class="header-breadcrumb">{{ breadcrumb }}</span>
        </div>
      </div>

      <!-- Right Section -->
      <div class="app-header-right">
        <!-- Search (Desktop) -->
        <div class="header-search-wrapper hidden sm:flex">
          <svg class="header-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            :placeholder="isRTL ? 'بحث...' : 'Search...'"
            class="header-search-input"
            @focus="showSearchResults = true"
            @blur="hideSearchResults"
          />
        </div>

        <!-- Notifications -->
        <div ref="notificationMenuRef" class="relative">
          <button 
            @click.stop="toggleNotificationMenu" 
            class="header-btn relative"
            :aria-label="isRTL ? 'الإشعارات' : 'Notifications'"
            title="الإشعارات"
          >
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span v-if="unreadCount > 0" class="header-badge">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <!-- Notification Dropdown -->
          <div 
            v-if="showNotificationMenu" 
            class="header-dropdown header-dropdown-notifications"
            :class="[isRTL ? 'header-dropdown-left' : 'header-dropdown-right']"
          >
            <div class="header-dropdown-header">
              <span class="header-dropdown-title">{{ isRTL ? 'الإشعارات' : 'Notifications' }}</span>
              <button 
                v-if="unreadCount > 0" 
                @click="markAllAsRead" 
                class="header-dropdown-action"
              >
                {{ isRTL ? 'تحديد الكل كمقروء' : 'Mark all as read' }}
              </button>
            </div>
            <div class="header-dropdown-body">
              <div v-if="notifications.length === 0" class="header-dropdown-empty">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>{{ isRTL ? 'لا توجد إشعارات' : 'No notifications' }}</span>
              </div>
              <div 
                v-for="notification in notifications" 
                :key="notification.id" 
                class="header-dropdown-item"
                :class="{ 'header-dropdown-item-unread': !notification.read }"
              >
                <div class="header-dropdown-item-content">
                  <p class="header-dropdown-item-text">{{ notification.message }}</p>
                  <span class="header-dropdown-item-time">{{ formatTime(notification.time) }}</span>
                </div>
              </div>
            </div>
            <div class="header-dropdown-footer">
              <router-link to="/notifications" class="header-dropdown-link">
                {{ isRTL ? 'عرض الكل' : 'View all' }}
              </router-link>
            </div>
          </div>
        </div>

        <!-- Dark Mode Toggle -->
        <button 
          @click="$emit('toggle-dark-mode')" 
          class="header-btn"
          :aria-label="isRTL ? 'الوضع الليلي' : 'Dark mode'"
          :title="isRTL ? 'الوضع الليلي' : 'Dark mode'"
        >
          <svg v-if="isDarkMode" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <!-- Language Switcher -->
        <div ref="languageMenuRef" class="relative">
          <button 
            @click.stop="toggleLanguageMenu" 
            class="header-btn header-btn-language"
            :aria-label="isRTL ? 'تغيير اللغة' : 'Change language'"
            title="اللغة"
          >
            <span class="header-language-text">
              {{ languageStore.current === 'en' ? 'EN' : 'ع' }}
            </span>
          </button>
          <div 
            v-if="showLanguageMenu" 
            class="header-dropdown"
            :class="[isRTL ? 'header-dropdown-left' : 'header-dropdown-right']"
          >
            <button 
              @click="switchLanguage('en')" 
              class="header-dropdown-item"
              :class="{ 'header-dropdown-item-active': languageStore.current === 'en' }"
            >
              <span class="header-dropdown-item-flag">🇬🇧</span>
              <span>English</span>
              <svg v-if="languageStore.current === 'en'" class="header-dropdown-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button 
              @click="switchLanguage('ar')" 
              class="header-dropdown-item"
              :class="{ 'header-dropdown-item-active': languageStore.current === 'ar' }"
            >
              <span class="header-dropdown-item-flag">🇸🇦</span>
              <span>العربية</span>
              <svg v-if="languageStore.current === 'ar'" class="header-dropdown-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- User Menu -->
        <div ref="userMenuRef" class="relative">
          <button 
            @click.stop="toggleUserMenu" 
            class="header-btn header-btn-user"
            :aria-label="isRTL ? 'قائمة المستخدم' : 'User menu'"
            title="المستخدم"
          >
            <div class="header-avatar">
              {{ userInitials }}
            </div>
            <span class="header-username hidden md:inline">{{ userName }}</span>
            <svg class="header-dropdown-arrow hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div 
            v-if="showUserMenu" 
            class="header-dropdown header-dropdown-user"
            :class="[isRTL ? 'header-dropdown-left' : 'header-dropdown-right']"
          >
            <div class="header-dropdown-user-info">
              <div class="header-dropdown-user-avatar">
                {{ userInitials }}
              </div>
              <div class="header-dropdown-user-details">
                <p class="header-dropdown-user-name">{{ user?.name || 'مستخدم' }}</p>
                <p class="header-dropdown-user-email">{{ user?.email }}</p>
                <span class="header-dropdown-user-role">{{ formatRole(user?.role) }}</span>
              </div>
            </div>
            <hr class="header-dropdown-divider">
            <router-link 
              to="/profile" 
              class="header-dropdown-item"
              @click="closeAllMenus"
            >
              <svg class="header-dropdown-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {{ isRTL ? 'الملف الشخصي' : 'Profile' }}
            </router-link>
            <router-link 
              v-if="!isSuperAdmin"
              to="/settings" 
              class="header-dropdown-item"
              @click="closeAllMenus"
            >
              <svg class="header-dropdown-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ isRTL ? 'الإعدادات' : 'Settings' }}
            </router-link>
            <router-link 
              v-if="isSuperAdmin"
              to="/super-admin/settings" 
              class="header-dropdown-item"
              @click="closeAllMenus"
            >
              <svg class="header-dropdown-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ isRTL ? 'إعدادات النظام' : 'System Settings' }}
            </router-link>
            <hr class="header-dropdown-divider">
            <button 
              @click="handleLogout" 
              class="header-dropdown-item header-dropdown-item-danger"
            >
              <svg class="header-dropdown-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {{ isRTL ? 'تسجيل الخروج' : 'Logout' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
  (e: 'logout'): void
  (e: 'toggle-dark-mode'): void
}>()

defineProps<{
  isDarkMode?: boolean
}>()

const authStore = useAuthStore()
const languageStore = useLanguageStore()
const route = useRoute()

const showLanguageMenu = ref(false)
const showUserMenu = ref(false)
const showNotificationMenu = ref(false)
const showSearchResults = ref(false)
const languageMenuRef = ref<HTMLElement | null>(null)
const userMenuRef = ref<HTMLElement | null>(null)
const notificationMenuRef = ref<HTMLElement | null>(null)

const isRTL = computed(() => languageStore.direction === 'rtl')
const isSuperAdmin = computed(() => authStore.isSuperAdmin)

// User data
const user = computed(() => authStore.user)
const userName = computed(() => {
  if (user.value?.name) {
    return user.value.name.split(' ')[0]
  }
  if (authStore.user?.email) {
    return authStore.user.email.split('@')[0]
  }
  return 'مستخدم'
})

const userInitials = computed(() => {
  const name = user.value?.name || authStore.user?.email || 'U'
  if (name.includes('@')) {
    return name.charAt(0).toUpperCase()
  }
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

// Breadcrumb
const breadcrumb = computed(() => {
  const path = route.path
  const parts = path.split('/').filter(Boolean)
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1]
    if (lastPart.match(/^[0-9a-f-]+$/)) {
      return 'تفاصيل'
    }
  }
  return ''
})

// Page title
const pageTitle = computed(() => {
  const path = route.path
  const titles: Record<string, string> = {
    '/admin/dashboard': 'لوحة التحكم',
    '/super-admin/dashboard': 'لوحة التحكم',
    '/inventory/items': 'الأصناف',
    '/inventory/transactions': 'الحركات',
    '/warehouses': 'المخازن',
    '/brands': 'الماركات',
    '/products': 'المنتجات',
    '/invoices': 'الفواتير',
    '/invoices/new': 'فاتورة جديدة',
    '/reports/stock': 'تقرير المخزون',
    '/super-admin/tenants': 'المستأجرين',
    '/super-admin/users': 'المستخدمين',
    '/profile': 'الملف الشخصي',
    '/settings': 'الإعدادات'
  }
  if (path.match(/^\/invoices\/[\w-]+$/)) {
    return 'تفاصيل الفاتورة'
  }
  if (path.match(/^\/inventory\/items\/[\w-]+$/)) {
    return 'تفاصيل الصنف'
  }
  return titles[path] || 'الرئيسية'
})

// Notifications (mock data)
const notifications = ref([
  { id: 1, message: 'تم إنشاء فاتورة جديدة #INV-001', read: false, time: new Date(Date.now() - 1000 * 60 * 5) },
  { id: 2, message: 'تم تحديث المخزون - 5 أصناف', read: false, time: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 3, message: 'انتهت صلاحية اشتراك شركة "نور مجيك"', read: true, time: new Date(Date.now() - 1000 * 60 * 60 * 2) },
])
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

// Format time
const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60 * 1000) return 'الآن'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} دقيقة`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))} ساعة`
  return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
}

// Format role
const formatRole = (role?: string) => {
  const roles: Record<string, string> = {
    superadmin: 'مشرف عام',
    company_manager: 'مدير شركة',
    warehouse_manager: 'مدير مستودع',
    viewer: 'مشاهد'
  }
  return roles[role || ''] || ''
}

// Toggle menus
const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
  if (showLanguageMenu.value) {
    showUserMenu.value = false
    showNotificationMenu.value = false
  }
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value) {
    showLanguageMenu.value = false
    showNotificationMenu.value = false
  }
}

const toggleNotificationMenu = () => {
  showNotificationMenu.value = !showNotificationMenu.value
  if (showNotificationMenu.value) {
    showLanguageMenu.value = false
    showUserMenu.value = false
  }
}

const closeAllMenus = () => {
  showLanguageMenu.value = false
  showUserMenu.value = false
  showNotificationMenu.value = false
  showSearchResults.value = false
}

const switchLanguage = (lang: 'en' | 'ar') => {
  languageStore.switchLanguage(lang)
  closeAllMenus()
}

const handleLogout = () => {
  closeAllMenus()
  emit('logout')
}

const markAllAsRead = () => {
  notifications.value = notifications.value.map(n => ({ ...n, read: true }))
}

const hideSearchResults = () => {
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

// Handle clicks outside dropdowns
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  
  if (languageMenuRef.value && !languageMenuRef.value.contains(target)) {
    showLanguageMenu.value = false
  }
  
  if (userMenuRef.value && !userMenuRef.value.contains(target)) {
    showUserMenu.value = false
  }
  
  if (notificationMenuRef.value && !notificationMenuRef.value.contains(target)) {
    showNotificationMenu.value = false
  }
}

// Handle escape key
const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeAllMenus()
  }
}

// Handle scroll to close dropdowns
const handleScroll = () => {
  if (showLanguageMenu.value || showUserMenu.value || showNotificationMenu.value) {
    closeAllMenus()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscapeKey)
  document.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscapeKey)
  document.removeEventListener('scroll', handleScroll, true)
})
</script>

<style scoped>
/* ===== HEADER ===== */
.app-header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: linear-gradient(135deg, #b45309, #92400e);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  padding-top: env(safe-area-inset-top, 0px);
}

:global(.dark) .app-header {
  background: linear-gradient(135deg, #78350f, #451a03);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.app-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0.75rem;
  max-width: 100%;
  min-height: 52px;
}

@media (min-width: 640px) {
  .app-header-inner {
    padding: 0.5rem 1rem;
    min-height: 60px;
  }
}

@media (min-width: 1024px) {
  .app-header-inner {
    padding: 0.625rem 1.5rem;
    min-height: 68px;
  }
}

/* ===== LEFT SECTION ===== */
.app-header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

@media (min-width: 640px) {
  .app-header-left {
    gap: 0.75rem;
  }
}

/* ===== HEADER BUTTONS ===== */
.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
  min-width: 40px;
  touch-action: manipulation;
  position: relative;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.header-btn:active {
  transform: scale(0.95);
}

.header-btn-mobile {
  display: flex;
}

@media (min-width: 1024px) {
  .header-btn-mobile {
    display: none;
  }
}

.header-btn-language {
  padding: 0.25rem 0.5rem;
  font-weight: 700;
  font-size: 0.75rem;
}

@media (min-width: 640px) {
  .header-btn-language {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
}

.header-btn-user {
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
}

@media (min-width: 640px) {
  .header-btn-user {
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
  }
}

/* ===== AVATAR ===== */
.header-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: white;
  color: #b45309;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

@media (min-width: 640px) {
  .header-avatar {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 0.75rem;
  }
}

.header-username {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .header-username {
    max-width: 120px;
  }
}

.header-dropdown-arrow {
  width: 1rem;
  height: 1rem;
  color: rgba(255, 255, 255, 0.6);
}

/* ===== TITLE ===== */
.header-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.header-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

@media (min-width: 640px) {
  .header-title {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .header-title {
    font-size: 1.125rem;
  }
}

.header-breadcrumb {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.6);
  display: none;
  white-space: nowrap;
}

@media (min-width: 640px) {
  .header-breadcrumb {
    display: inline;
  }
}

/* ===== RIGHT SECTION ===== */
.app-header-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .app-header-right {
    gap: 0.5rem;
  }
}

/* ===== SEARCH ===== */
.header-search-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0 0.5rem;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  min-width: 120px;
}

.header-search-wrapper:focus-within {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.header-search-icon {
  width: 1rem;
  height: 1rem;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.header-search-input {
  background: transparent;
  border: none;
  padding: 0.375rem 0.5rem;
  color: white;
  font-size: 0.8125rem;
  width: 100%;
  min-width: 80px;
  outline: none;
}

.header-search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* ===== BADGE ===== */
.header-badge {
  position: absolute;
  top: 0.125rem;
  right: 0.125rem;
  background: #ef4444;
  color: white;
  font-size: 0.55rem;
  font-weight: 700;
  border-radius: 9999px;
  padding: 0.125rem 0.375rem;
  min-width: 1.25rem;
  text-align: center;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

/* ===== DROPDOWN ===== */
.header-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  min-width: 220px;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0.5rem 0;
  z-index: 50;
  overflow: hidden;
  max-height: 80vh;
  overflow-y: auto;
}

:global(.dark) .header-dropdown {
  background: #1f2937;
  border-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.header-dropdown-right {
  right: 0;
}

.header-dropdown-left {
  left: 0;
}

.header-dropdown-notifications {
  min-width: 320px;
  max-width: 400px;
}

.header-dropdown-user {
  min-width: 260px;
}

/* ===== DROPDOWN ITEMS ===== */
.header-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  color: #374151;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 0.875rem;
}

:global(.dark) .header-dropdown-item {
  color: #e5e7eb;
}

.header-dropdown-item:hover {
  background: #f3f4f6;
}

:global(.dark) .header-dropdown-item:hover {
  background: #374151;
}

.header-dropdown-item-active {
  background: #fef3c7;
}

:global(.dark) .header-dropdown-item-active {
  background: #78350f;
}

.header-dropdown-item-danger {
  color: #dc2626;
}

.header-dropdown-item-danger:hover {
  background: #fee2e2;
}

:global(.dark) .header-dropdown-item-danger {
  color: #f87171;
}

:global(.dark) .header-dropdown-item-danger:hover {
  background: #7f1d1d;
}

.header-dropdown-item-icon {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
  color: #6b7280;
}

:global(.dark) .header-dropdown-item-icon {
  color: #9ca3af;
}

.header-dropdown-check {
  width: 1rem;
  height: 1rem;
  color: #f59e0b;
  margin-left: auto;
  flex-shrink: 0;
}

.header-dropdown-item-flag {
  font-size: 1.125rem;
}

/* ===== DROPDOWN HEADER ===== */
.header-dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

:global(.dark) .header-dropdown-header {
  border-color: #374151;
}

.header-dropdown-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #111827;
}

:global(.dark) .header-dropdown-title {
  color: #f9fafb;
}

.header-dropdown-action {
  font-size: 0.75rem;
  color: #f59e0b;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.header-dropdown-action:hover {
  background: rgba(245, 158, 11, 0.1);
}

/* ===== DROPDOWN BODY ===== */
.header-dropdown-body {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.25rem 0;
}

.header-dropdown-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.header-dropdown-item-unread {
  background: rgba(59, 130, 246, 0.05);
  border-left: 3px solid #3b82f6;
}

:global(.dark) .header-dropdown-item-unread {
  background: rgba(59, 130, 246, 0.1);
  border-left-color: #3b82f6;
}

.header-dropdown-item-text {
  font-size: 0.8125rem;
  color: #374151;
  margin: 0;
}

:global(.dark) .header-dropdown-item-text {
  color: #e5e7eb;
}

.header-dropdown-item-time {
  font-size: 0.625rem;
  color: #9ca3af;
  margin-top: 0.125rem;
}

/* ===== DROPDOWN FOOTER ===== */
.header-dropdown-footer {
  padding: 0.625rem 1rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

:global(.dark) .header-dropdown-footer {
  border-color: #374151;
}

.header-dropdown-link {
  font-size: 0.8125rem;
  color: #f59e0b;
  text-decoration: none;
  font-weight: 500;
}

.header-dropdown-link:hover {
  text-decoration: underline;
}

/* ===== USER INFO IN DROPDOWN ===== */
.header-dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
}

.header-dropdown-user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.header-dropdown-user-details {
  flex: 1;
  min-width: 0;
}

.header-dropdown-user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

:global(.dark) .header-dropdown-user-name {
  color: #f9fafb;
}

.header-dropdown-user-email {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

:global(.dark) .header-dropdown-user-email {
  color: #9ca3af;
}

.header-dropdown-user-role {
  font-size: 0.625rem;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  display: inline-block;
  margin-top: 0.125rem;
}

.header-dropdown-divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0.25rem 0;
}

:global(.dark) .header-dropdown-divider {
  border-color: #374151;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .app-header-inner {
    padding: 0.25rem 0.5rem;
    min-height: 44px;
  }
  
  .header-title {
    font-size: 0.75rem;
  }
  
  .header-btn {
    min-height: 36px;
    min-width: 36px;
    padding: 0.375rem;
  }
  
  .header-avatar {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.5rem;
  }
  
  .header-dropdown-notifications {
    min-width: 280px;
  }
}

@media (max-width: 360px) {
  .header-title {
    font-size: 0.65rem;
  }
  
  .header-btn {
    min-height: 32px;
    min-width: 32px;
    padding: 0.25rem;
  }
}
</style>