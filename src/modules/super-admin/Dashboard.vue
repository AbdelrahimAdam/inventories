<template>
  <div class="p-3 sm:p-6" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">لوحة تحكم المشرف العام</h1>
      <div class="flex flex-wrap gap-2 w-full sm:w-auto">
        <button @click="refreshData" :disabled="isRefreshing" class="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2 text-sm min-h-[40px]">
          <svg v-if="isRefreshing" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <svg v-else class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span class="hidden xs:inline">تحديث</span>
          <span class="xs:hidden">تحديث</span>
        </button>
        <router-link to="/super-admin/tenants" class="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 text-sm min-h-[40px]">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span class="hidden xs:inline">إدارة المستأجرين</span>
          <span class="xs:hidden">المستأجرين</span>
        </router-link>
      </div>
    </div>

    <!-- Pending Requests Alert -->
    <div v-if="stats.pendingRequests > 0" class="mb-4 sm:mb-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div class="flex items-start sm:items-center gap-3 w-full sm:w-auto">
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <p class="font-bold text-purple-800 dark:text-purple-300 text-sm sm:text-base">{{ stats.pendingRequests }} طلب ترقية في انتظار الموافقة</p>
          <p class="text-xs sm:text-sm text-purple-600 dark:text-purple-400">قم بمراجعة طلبات الترقية من صفحة إدارة المستأجرين</p>
        </div>
      </div>
      <router-link to="/super-admin/tenants" class="w-full sm:w-auto px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-md text-xs sm:text-sm font-bold text-center min-h-[36px] sm:min-h-[40px] flex items-center justify-center">
        عرض الطلبات
      </router-link>
    </div>

    <!-- Expiring Soon Alert -->
    <div v-if="stats.expiringSoon > 0" class="mb-4 sm:mb-6 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div class="flex items-start sm:items-center gap-3 w-full sm:w-auto">
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="font-bold text-amber-800 dark:text-amber-300 text-sm sm:text-base">{{ stats.expiringSoon }} اشتراكات تنتهي خلال 7 أيام</p>
          <p class="text-xs sm:text-sm text-amber-600 dark:text-amber-400">قم بتمديد الاشتراكات قبل انتهائها</p>
        </div>
      </div>
      <router-link to="/super-admin/tenants" class="w-full sm:w-auto px-3 sm:px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-md text-xs sm:text-sm font-bold text-center min-h-[36px] sm:min-h-[40px] flex items-center justify-center">
        عرض الاشتراكات
      </router-link>
    </div>

    <!-- Stats Cards - Mobile responsive grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="min-w-0">
            <p class="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-medium">إجمالي المستأجرين</p>
            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">{{ formatNumber(stats.totalTenants) }}</p>
          </div>
          <div class="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 sm:p-2.5 flex-shrink-0">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="min-w-0">
            <p class="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-medium">نشطة</p>
            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400 truncate">{{ formatNumber(stats.activeSubscriptions) }}</p>
          </div>
          <div class="bg-green-100 dark:bg-green-900/30 rounded-full p-2 sm:p-2.5 flex-shrink-0">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="min-w-0">
            <p class="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-medium">تجريبي</p>
            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-amber-600 dark:text-amber-400 truncate">{{ formatNumber(stats.trialTenants) }}</p>
          </div>
          <div class="bg-amber-100 dark:bg-amber-900/30 rounded-full p-2 sm:p-2.5 flex-shrink-0">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="min-w-0">
            <p class="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-medium">منتهية</p>
            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400 truncate">{{ formatNumber(stats.expiredSubscriptions) }}</p>
          </div>
          <div class="bg-red-100 dark:bg-red-900/30 rounded-full p-2 sm:p-2.5 flex-shrink-0">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 border border-gray-200 dark:border-gray-700 col-span-2 sm:col-span-1">
        <div class="flex items-center justify-between">
          <div class="min-w-0">
            <p class="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-medium">طلبات معلقة</p>
            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400 truncate">{{ formatNumber(stats.pendingRequests) }}</p>
          </div>
          <div class="bg-purple-100 dark:bg-purple-900/30 rounded-full p-2 sm:p-2.5 flex-shrink-0">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Subscription Status Chart -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 sm:p-5 mb-4 sm:mb-6">
      <h3 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">حالة اشتراكات المستأجرين</h3>
      <div class="flex flex-wrap items-center gap-2 sm:gap-4">
        <div class="flex items-center gap-1.5 sm:gap-2">
          <div class="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500"></div>
          <span class="text-xs sm:text-sm text-gray-700 dark:text-gray-300">نشط ({{ stats.activeSubscriptions }})</span>
        </div>
        <div class="flex items-center gap-1.5 sm:gap-2">
          <div class="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-500"></div>
          <span class="text-xs sm:text-sm text-gray-700 dark:text-gray-300">تجريبي ({{ stats.trialTenants }})</span>
        </div>
        <div class="flex items-center gap-1.5 sm:gap-2">
          <div class="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500"></div>
          <span class="text-xs sm:text-sm text-gray-700 dark:text-gray-300">منتهي ({{ stats.expiredSubscriptions }})</span>
        </div>
        <div class="flex items-center gap-1.5 sm:gap-2">
          <div class="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-500"></div>
          <span class="text-xs sm:text-sm text-gray-700 dark:text-gray-300">ملغي ({{ stats.cancelledSubscriptions }})</span>
        </div>
      </div>
      <div class="mt-3 h-3 sm:h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
        <div v-if="stats.activeSubscriptions > 0" class="bg-green-500 h-full transition-all" :style="{ width: stats.activeSubscriptionsPercentage + '%' }"></div>
        <div v-if="stats.trialTenants > 0" class="bg-amber-500 h-full transition-all" :style="{ width: stats.trialTenantsPercentage + '%' }"></div>
        <div v-if="stats.expiredSubscriptions > 0" class="bg-red-500 h-full transition-all" :style="{ width: stats.expiredSubscriptionsPercentage + '%' }"></div>
        <div v-if="stats.cancelledSubscriptions > 0" class="bg-gray-500 h-full transition-all" :style="{ width: stats.cancelledSubscriptionsPercentage + '%' }"></div>
      </div>
    </div>

    <!-- Expiring Subscriptions List -->
    <div v-if="expiringTenants.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
      <div class="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">⚠️ اشتراكات على وشك الانتهاء</h3>
        <span class="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
          {{ expiringTenants.length }} اشتراك
        </span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[400px]">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-3 sm:px-4 py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المستأجر</th>
              <th class="px-3 sm:px-4 py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">التاريخ</th>
              <th class="px-3 sm:px-4 py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الأيام</th>
              <th class="px-3 sm:px-4 py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="tenant in expiringTenants" :key="tenant.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{{ tenant.name }}</td>
              <td class="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{{ formatDate(tenant.paid_until) }}</td>
              <td class="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                <span :class="(tenant.daysLeft || 0) <= 3 ? 'text-red-600 font-bold' : 'text-amber-600'" class="text-xs sm:text-sm">
                  {{ tenant.daysLeft || 0 }} يوم
                </span>
              </td>
              <td class="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                <router-link to="/super-admin/tenants" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm font-medium">
                  تمديد
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Tenants -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div class="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">أحدث المستأجرين</h2>
        <router-link to="/super-admin/tenants" class="text-xs sm:text-sm text-amber-600 dark:text-amber-400 hover:underline">عرض الكل</router-link>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[450px]">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-3 sm:px-4 py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">اسم المستأجر</th>
              <th class="px-3 sm:px-4 py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المعرف</th>
              <th class="px-3 sm:px-4 py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المستخدمين</th>
              <th class="px-3 sm:px-4 py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الحالة</th>
              <th class="px-3 sm:px-4 py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">التاريخ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="tenant in recentTenants" :key="tenant.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td class="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{{ tenant.name }}</td>
              <td class="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                <span class="px-1.5 sm:px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-[10px] sm:text-xs">{{ tenant.slug }}</span>
              </td>
              <td class="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{{ formatNumber(tenant.userCount || 0) }}</td>
              <td class="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                <span :class="getSubscriptionBadge(tenant.subscription_status)" class="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full">
                  {{ formatSubscriptionStatus(tenant.subscription_status) }}
                </span>
              </td>
              <td class="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{{ formatDate(tenant.createdAt) }}</td>
            </tr>
            <tr v-if="recentTenants.length === 0">
              <td colspan="5" class="px-3 sm:px-4 py-6 sm:py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                لا توجد مستأجرين
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

interface Tenant {
  id: string
  name: string
  slug: string
  createdAt: Date
  userCount?: number
  subscription_status?: string
  paid_until?: string | null
  daysLeft?: number
}

interface ExpiringTenant {
  id: string
  name: string
  slug: string
  createdAt: Date
  userCount?: number
  subscription_status?: string
  paid_until: string | null
  daysLeft: number
}

const stats = ref({
  totalTenants: 0,
  activeSubscriptions: 0,
  trialTenants: 0,
  expiredSubscriptions: 0,
  cancelledSubscriptions: 0,
  pendingRequests: 0,
  expiringSoon: 0,
  activeSubscriptionsPercentage: 0,
  trialTenantsPercentage: 0,
  expiredSubscriptionsPercentage: 0,
  cancelledSubscriptionsPercentage: 0,
})

const recentTenants = ref<Tenant[]>([])
const expiringTenants = ref<ExpiringTenant[]>([])
const isRefreshing = ref(false)

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ar-EG')
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const getSubscriptionBadge = (status?: string): string => {
  if (status === 'active') return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
  if (status === 'trial') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
  if (status === 'expired') return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  if (status === 'cancelled') return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
}

const formatSubscriptionStatus = (status?: string): string => {
  if (status === 'active') return 'نشط'
  if (status === 'trial') return 'تجريبي'
  if (status === 'expired') return 'منتهي'
  if (status === 'cancelled') return 'ملغي'
  return 'غير محدد'
}

const fetchStats = async () => {
  try {
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('id, name, slug, subscription_status, paid_until, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    let active = 0, trial = 0, expired = 0, cancelled = 0
    const expiring: ExpiringTenant[] = []
    const now = new Date()

    for (const tenant of (tenants || [])) {
      const status = tenant.subscription_status || 'expired'
      if (status === 'active') active++
      else if (status === 'trial') trial++
      else if (status === 'expired') expired++
      else if (status === 'cancelled') cancelled++

      if (status === 'active' && tenant.paid_until) {
        const paidUntil = new Date(tenant.paid_until)
        const daysLeft = Math.ceil((paidUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (daysLeft <= 7 && daysLeft > 0) {
          expiring.push({
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            createdAt: new Date(tenant.created_at),
            subscription_status: status,
            paid_until: tenant.paid_until,
            daysLeft: daysLeft
          })
        }
      }
    }

    const { count: pendingCount } = await supabase
      .from('upgrade_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const total = (tenants || []).length
    const totalSubscriptions = active + trial + expired + cancelled || 1

    stats.value = {
      totalTenants: total,
      activeSubscriptions: active,
      trialTenants: trial,
      expiredSubscriptions: expired,
      cancelledSubscriptions: cancelled,
      pendingRequests: pendingCount || 0,
      expiringSoon: expiring.length,
      activeSubscriptionsPercentage: (active / totalSubscriptions) * 100,
      trialTenantsPercentage: (trial / totalSubscriptions) * 100,
      expiredSubscriptionsPercentage: (expired / totalSubscriptions) * 100,
      cancelledSubscriptionsPercentage: (cancelled / totalSubscriptions) * 100,
    }

    expiringTenants.value = expiring.sort((a, b) => a.daysLeft - b.daysLeft)

    const recent = (tenants || []).slice(0, 10)
    recentTenants.value = []
    for (const tenant of recent) {
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)

      recentTenants.value.push({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        createdAt: new Date(tenant.created_at),
        userCount: userCount || 0,
        subscription_status: tenant.subscription_status,
      })
    }

  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const refreshData = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await fetchStats()
  } catch (error) {
    console.error('Refresh failed:', error)
  } finally {
    isRefreshing.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
@media (min-width: 480px) {
  .xs\:inline { display: inline; }
  .xs\:hidden { display: none; }
}
</style>