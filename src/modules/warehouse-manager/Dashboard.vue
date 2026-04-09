<template>
  <div class="p-4 sm:p-6" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">لوحة تحكم مدير المستودع</h1>
    
    <!-- Stats Cards - Responsive Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">إجمالي الأصناف</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(totalItems) }}</p>
          </div>
          <div class="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 sm:p-3">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">المخزون المنخفض</p>
            <p class="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ formatNumber(lowStockItems) }}</p>
          </div>
          <div class="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-2 sm:p-3">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">المخزون الحرج</p>
            <p class="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{{ formatNumber(criticalStockItems) }}</p>
          </div>
          <div class="bg-red-100 dark:bg-red-900/30 rounded-full p-2 sm:p-3">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">إجمالي الوحدات</p>
            <p class="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{{ formatNumber(totalUnits) }}</p>
          </div>
          <div class="bg-green-100 dark:bg-green-900/30 rounded-full p-2 sm:p-3">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Low Stock Alert Section - Mobile Responsive -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-8 border border-gray-200 dark:border-gray-700">
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">تنبيهات المخزون المنخفض</h2>
      </div>
      
      <!-- Desktop Table View (hidden on mobile) -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">المنتج</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">الكود</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">الكمية</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">الحالة</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in lowStockList" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-sm">{{ item.name }}</td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-sm">{{ item.code }}</td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-yellow-600">{{ formatNumber(item.remainingQuantity) }}</td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-sm">
                <span :class="item.remainingQuantity <= 250 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'" class="px-2 py-1 text-xs rounded-full">
                  {{ item.remainingQuantity <= 250 ? 'حرج' : 'منخفض' }}
                </span>
              </td>
            </tr>
            <tr v-if="lowStockList.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">لا توجد أصناف منخفضة المخزون</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View (visible only on mobile) -->
      <div class="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
        <div v-for="item in lowStockList" :key="item.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ item.name }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">الكود: {{ item.code }}</p>
            </div>
            <div class="text-right">
              <span class="text-lg font-bold text-yellow-600">{{ formatNumber(item.remainingQuantity) }}</span>
              <div class="mt-1">
                <span :class="item.remainingQuantity <= 250 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'" class="px-2 py-1 text-xs rounded-full">
                  {{ item.remainingQuantity <= 250 ? 'حرج' : 'منخفض' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="lowStockList.length === 0" class="p-8 text-center text-gray-500">
          لا توجد أصناف منخفضة المخزون
        </div>
      </div>
    </div>

    <!-- Quick Actions - Mobile Responsive -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <router-link to="/inventory/items" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group">
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="bg-green-100 dark:bg-green-900/30 rounded-full p-2 sm:p-3 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">إدارة الأصناف</h3>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">عرض وإدارة المخزون</p>
          </div>
        </div>
      </router-link>

      <router-link to="/inventory/transactions" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group">
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 sm:p-3 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">الحركات</h3>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">عرض سجل الحركات</p>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center gap-3">
        <svg class="animate-spin h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-gray-700 dark:text-gray-300">جاري التحميل...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useLanguageStore } from '@/stores/language'

const inventoryStore = useInventoryStore()
const languageStore = useLanguageStore()

const isLoading = ref(false)

// Format numbers for better readability
const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const totalItems = computed(() => inventoryStore.items.length)
const totalUnits = computed(() => inventoryStore.totalQuantity)
const lowStockItems = computed(() => inventoryStore.items.filter(i => i.remainingQuantity <= 500 && i.remainingQuantity > 0).length)
const criticalStockItems = computed(() => inventoryStore.items.filter(i => i.remainingQuantity <= 250 && i.remainingQuantity > 0).length)
const lowStockList = computed(() => inventoryStore.items.filter(i => i.remainingQuantity <= 500 && i.remainingQuantity > 0).slice(0, 10))

onMounted(async () => {
  isLoading.value = true
  try {
    await inventoryStore.fetchItems()
  } catch (error) {
    console.error('Error loading warehouse manager dashboard:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* Smooth transitions */
.transition-shadow {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.hover\:shadow-md:hover {
  transform: translateY(-2px);
}

/* Group hover scale animation */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .grid {
    gap: 0.75rem;
  }
}

/* Loading spinner animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>