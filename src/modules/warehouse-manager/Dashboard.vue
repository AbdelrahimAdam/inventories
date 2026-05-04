<template>
  <div class="p-4 sm:p-6" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">لوحة تحكم مدير المستودع</h1>

    <!-- Optional: Show which warehouse is currently active -->
    <div v-if="activeWarehouseFilter" class="mb-4 text-sm text-gray-600 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg inline-block">
      <span class="font-medium">المستودع الحالي:</span> {{ getWarehouseName(activeWarehouseFilter) }}
      <button @click="clearWarehouseFilter" class="mr-2 text-red-500 hover:text-red-700 text-xs">✕ إلغاء التصفية</button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">إجمالي الأصناف</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(filteredItems.length) }}</p>
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
            <p class="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ formatNumber(lowStockCount) }}</p>
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
            <p class="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{{ formatNumber(criticalStockCount) }}</p>
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

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-8 border border-gray-200 dark:border-gray-700">
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">تنبيهات المخزون المنخفض</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[600px]">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الصنف</th>
              <th class="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الكود</th>
              <th class="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المخزن</th>
              <th class="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الكمية</th>
              <th class="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الحالة</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in lowStockList" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-center text-sm text-gray-900 dark:text-white">{{ item.name }}</td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-center text-sm text-gray-500 dark:text-gray-400 font-mono">{{ item.code }}</td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-center text-sm text-gray-600 dark:text-gray-300">{{ getWarehouseName(item.warehouseId) }}</td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-center text-sm font-semibold text-yellow-600 dark:text-yellow-400">{{ formatNumber(item.remainingQuantity) }}</td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-center text-sm">
                <span :class="item.remainingQuantity <= 250 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'" class="px-2 py-1 text-xs rounded-full font-medium">
                  {{ item.remainingQuantity <= 250 ? 'حرج' : 'منخفض' }}
                </span>
              </td>
            </tr>
            <tr v-if="lowStockList.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">لا توجد أصناف منخفضة المخزون</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

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

    <div v-if="inventoryStore.isLoading" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
import { computed, onMounted, onActivated, watch } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const getWarehouseName = (warehouseId: string) => {
  const warehouse = warehouseStore.warehouses.find(w => w.id === warehouseId)
  return warehouse?.name_ar || warehouse?.name || '—'
}

// The effective warehouse filter from the inventory store (persisted)
const activeWarehouseFilter = computed(() => {
  const filter = inventoryStore.currentFilters.warehouseId
  if (!filter) return null
  // Only apply if user has access to this warehouse
  if (authStore.isSuperAdmin || authStore.isCompanyManager) return filter
  const allowedIds = authStore.user?.allowedWarehouses || []
  if (allowedIds.includes('all') || allowedIds.includes(filter)) return filter
  return null
})

// Clear the shared filter (resets to show all allowed warehouses)
const clearWarehouseFilter = () => {
  inventoryStore.currentFilters.warehouseId = ''
}

// Filter items based on user permissions AND the active warehouse filter
const filteredItems = computed(() => {
  let items = inventoryStore.items

  // First apply user permission filtering (allowed warehouses)
  if (!(authStore.isSuperAdmin || authStore.isCompanyManager)) {
    const allowedIds = authStore.user?.allowedWarehouses || []
    if (allowedIds.length > 0 && !allowedIds.includes('all')) {
      items = items.filter(item => allowedIds.includes(item.warehouseId))
    } else if (allowedIds.length === 0) {
      // No access to any warehouse – show nothing
      items = []
    }
  }

  // Then apply the shared warehouse filter if set
  const warehouseId = activeWarehouseFilter.value
  if (warehouseId) {
    items = items.filter(item => item.warehouseId === warehouseId)
  }

  return items
})

const totalUnits = computed(() => filteredItems.value.reduce((sum, item) => sum + (item.remainingQuantity || 0), 0))

const lowStockCount = computed(() => filteredItems.value.filter(i => i.remainingQuantity <= 500 && i.remainingQuantity > 0).length)
const criticalStockCount = computed(() => filteredItems.value.filter(i => i.remainingQuantity <= 250 && i.remainingQuantity > 0).length)

const lowStockList = computed(() => filteredItems.value.filter(i => i.remainingQuantity <= 500 && i.remainingQuantity > 0).slice(0, 10))

// Load full items data (and warehouses) when needed
const loadFullData = async () => {
  // Fetch all items if the store is empty or incomplete
  if (inventoryStore.items.length === 0 || inventoryStore.items.length < inventoryStore.totalCount) {
    await inventoryStore.fetchItems()
  }
  // Fetch warehouses if missing
  if (warehouseStore.warehouses.length === 0) {
    warehouseStore.fetchWarehouses().catch(() => {})
  }
}

// Refetch data when the warehouse filter changes (to ensure we have the correct items if they were not loaded)
watch(
  () => activeWarehouseFilter.value,
  async (newWarehouse, oldWarehouse) => {
    if (newWarehouse !== oldWarehouse) {
      // If a specific warehouse is selected, ensure the store contains items for that warehouse.
      // The store already has all items, but if not, we could fetch. For now, just reload if items are empty.
      if (inventoryStore.items.length === 0) {
        await loadFullData()
      }
    }
  }
)

onMounted(async () => {
  await loadFullData()
})

onActivated(async () => {
  // Refresh data when the dashboard becomes active (e.g., after navigation)
  await loadFullData()
})
</script>

<style scoped>
.transition-shadow {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.hover\:shadow-md:hover {
  transform: translateY(-2px);
}

.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

@media (max-width: 640px) {
  .grid {
    gap: 0.75rem;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
