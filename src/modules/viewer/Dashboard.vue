<template>
  <div class="p-4 sm:p-6" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- View-only Banner -->
    <div class="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-6">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <div>
          <h3 class="font-semibold text-yellow-800 dark:text-yellow-300 text-sm sm:text-base">وضع العرض فقط</h3>
          <p class="text-xs sm:text-sm text-yellow-700 dark:text-yellow-400">يمكنك عرض البيانات فقط. لا يمكنك إضافة أو تعديل أو حذف</p>
        </div>
      </div>
    </div>

    <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">لوحة المعلومات</h1>
    
    <!-- Stats Cards (Read-only) - Responsive Grid -->
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
            <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">إجمالي الوحدات</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(totalUnits) }}</p>
          </div>
          <div class="bg-green-100 dark:bg-green-900/30 rounded-full p-2 sm:p-3">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">المخازن</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(totalWarehouses) }}</p>
          </div>
          <div class="bg-purple-100 dark:bg-purple-900/30 rounded-full p-2 sm:p-3">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">الحركات</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(totalTransactions) }}</p>
          </div>
          <div class="bg-orange-100 dark:bg-orange-900/30 rounded-full p-2 sm:p-3">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Items - Mobile Responsive Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">أحدث الأصناف</h2>
      </div>
      
      <!-- Desktop Table View (hidden on mobile) -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">المنتج</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">الكود</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">المخزن</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">الكمية</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in recentItems" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-sm">{{ item.name }}</td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-sm">{{ item.code }}</td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-sm">{{ getWarehouseName(item.warehouseId) }}</td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-green-600 dark:text-green-400">{{ formatNumber(item.remainingQuantity) }}</td>
            </tr>
            <tr v-if="recentItems.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">لا توجد أصناف</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View (visible only on mobile) -->
      <div class="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
        <div v-for="item in recentItems" :key="item.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ item.name }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">الكود: {{ item.code }}</p>
            </div>
            <span class="text-lg font-bold text-green-600 dark:text-green-400">{{ formatNumber(item.remainingQuantity) }}</span>
          </div>
          <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <span class="text-xs text-gray-500 dark:text-gray-400">المخزن:</span>
            <span class="text-xs text-gray-700 dark:text-gray-300">{{ getWarehouseName(item.warehouseId) }}</span>
          </div>
        </div>
        <div v-if="recentItems.length === 0" class="p-8 text-center text-gray-500">
          لا توجد أصناف
        </div>
      </div>
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
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()

const isLoading = ref(false)

// Format numbers for better readability
const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const totalItems = computed(() => inventoryStore.items.length)
const totalUnits = computed(() => inventoryStore.totalQuantity)
const totalWarehouses = computed(() => warehouseStore.warehouses.length)
const totalTransactions = computed(() => inventoryStore.transactions.length)
const recentItems = computed(() => inventoryStore.items.slice(0, 10))

const getWarehouseName = (warehouseId: string) => {
  const warehouse = warehouseStore.warehouses.find(w => w.id === warehouseId)
  return warehouse?.name_ar || warehouse?.name || '—'
}

onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([
      warehouseStore.fetchWarehouses(),
      inventoryStore.fetchItems(),
      inventoryStore.fetchTransactions()
    ])
  } catch (error) {
    console.error('Error loading dashboard data:', error)
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