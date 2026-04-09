<template>
  <div class="p-6" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">لوحة تحكم المشرف العام</h1>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">إجمالي المستأجرين</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(stats.totalTenants) }}</p>
          </div>
          <div class="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">إجمالي المستخدمين</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(stats.totalUsers) }}</p>
          </div>
          <div class="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">إجمالي الأصناف</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(stats.totalItems) }}</p>
          </div>
          <div class="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-3">
            <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">القيمة الإجمالية</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(stats.totalValue) }} $</p>
          </div>
          <div class="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Tenants -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">أحدث المستأجرين</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">اسم المستأجر</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المعرف</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المستخدمين</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">تاريخ الإنشاء</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="tenant in recentTenants" :key="tenant.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{{ tenant.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">{{ tenant.slug }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{{ formatNumber(tenant.userCount || 0) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{{ formatDate(tenant.createdAt) }}</td>
            </tr>
            <tr v-if="recentTenants.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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
}

const stats = ref({
  totalTenants: 0,
  totalUsers: 0,
  totalItems: 0,
  totalValue: 0,
})

const recentTenants = ref<Tenant[]>([])

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ar-EG')
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const fetchStats = async () => {
  try {
    // Get total tenants
    const { count: tenantCount } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })
    stats.value.totalTenants = tenantCount || 0

    // Get total users
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    stats.value.totalUsers = userCount || 0

    // Get total items
    const { count: itemCount } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
    stats.value.totalItems = itemCount || 0

    // Get total value (you may need to adjust this based on your schema)
    const { data: items } = await supabase
      .from('items')
      .select('remaining_quantity, price')
    
    if (items) {
      stats.value.totalValue = items.reduce((sum, item) => sum + (item.remaining_quantity * (item.price || 0)), 0)
    }

    // Get recent tenants
    const { data: tenants } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (tenants) {
      recentTenants.value = tenants.map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        createdAt: new Date(t.created_at),
      }))

      // Get user counts for each tenant
      for (const tenant of recentTenants.value) {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
        tenant.userCount = count || 0
      }
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>