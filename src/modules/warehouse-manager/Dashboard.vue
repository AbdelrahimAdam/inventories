<template>
  <div class="p-4 sm:p-6" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">لوحة تحكم مدير المستودع</h1>

    <!-- Optional: Show which warehouse is currently active -->
    <div v-if="activeWarehouseFilter" class="mb-4 text-sm text-gray-600 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg inline-block">
      <span class="font-medium">المستودع الحالي:</span> {{ getWarehouseName(activeWarehouseFilter) }}
      <button @click="clearWarehouseFilter" class="mr-2 text-red-500 hover:text-red-700 text-xs">✕ إلغاء التصفية</button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
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

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
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

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
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

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
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

    <!-- Low Stock Alerts Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-8 border border-gray-200 dark:border-gray-700">
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">تنبيهات المخزون المنخفض</h2>
        <div v-if="inventoryStore.isLoading" class="text-sm text-gray-500 flex items-center gap-2">
          <svg class="animate-spin h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span>تحديث...</span>
        </div>
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
            <tr v-if="lowStockList.length === 0 && !inventoryStore.isLoading">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">لا توجد أصناف منخفضة المخزون</td>
            </tr>
            <tr v-if="lowStockList.length === 0 && inventoryStore.isLoading">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                <div class="flex justify-center items-center gap-2">
                  <svg class="animate-spin h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>جاري تحميل البيانات...</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick Action Cards -->
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onActivated, ref, watch } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

// ---------- Warehouse Name Cache ----------
// Prevents repeated .find() inside getWarehouseName
const warehouseNameMap = ref<Map<string, string>>(new Map())

function updateWarehouseNameMap() {
  const map = new Map<string, string>()
  for (const w of warehouseStore.warehouses) {
    map.set(w.id, w.name_ar || w.name || '—')
  }
  warehouseNameMap.value = map
}

// Watch warehouses array to keep cache fresh
watch(() => warehouseStore.warehouses, () => {
  updateWarehouseNameMap()
}, { immediate: true, deep: false })

const getWarehouseName = (warehouseId: string): string => {
  return warehouseNameMap.value.get(warehouseId) || '—'
}

// ---------- Filtered Items (Single Source of Truth) ----------
const filteredItems = computed(() => {
  let items = inventoryStore.items

  // 1. Filter by user permissions (allowed warehouses)
  const isAdmin = authStore.isSuperAdmin || authStore.isCompanyManager
  if (!isAdmin) {
    const allowedIds = authStore.user?.allowedWarehouses || []
    // If allowedIds contains 'all', no filter needed
    if (allowedIds.length > 0 && !allowedIds.includes('all')) {
      items = items.filter(item => allowedIds.includes(item.warehouseId))
    } else if (allowedIds.length === 0) {
      return []
    }
  }

  // 2. Apply active warehouse filter (from inventory store)
  const warehouseFilter = inventoryStore.currentFilters.warehouseId
  if (warehouseFilter) {
    items = items.filter(item => item.warehouseId === warehouseFilter)
  }

  return items
})

// ---------- Computed Stats (Derived Once) ----------
const totalUnits = computed(() => {
  let sum = 0
  for (const item of filteredItems.value) {
    sum += item.remainingQuantity || 0
  }
  return sum
})

const lowStockCount = computed(() => {
  let count = 0
  for (const item of filteredItems.value) {
    if (item.remainingQuantity <= 500 && item.remainingQuantity > 0) count++
  }
  return count
})

const criticalStockCount = computed(() => {
  let count = 0
  for (const item of filteredItems.value) {
    if (item.remainingQuantity <= 250 && item.remainingQuantity > 0) count++
  }
  return count
})

const lowStockList = computed(() => {
  // Already filtered by permissions and warehouse, then limit to 10
  const result: typeof inventoryStore.items = []
  for (const item of filteredItems.value) {
    if (item.remainingQuantity <= 500 && item.remainingQuantity > 0) {
      result.push(item)
      if (result.length >= 10) break
    }
  }
  return result
})

const activeWarehouseFilter = computed(() => {
  const filter = inventoryStore.currentFilters.warehouseId
  if (!filter) return null
  // Validate that user has access to this warehouse (if not admin)
  if (authStore.isSuperAdmin || authStore.isCompanyManager) return filter
  const allowedIds = authStore.user?.allowedWarehouses || []
  if (allowedIds.includes('all') || allowedIds.includes(filter)) return filter
  return null
})

const clearWarehouseFilter = () => {
  inventoryStore.currentFilters.warehouseId = ''
}

// ---------- Data Loading (Optimised, No Duplicate Fetches) ----------
let dataLoaded = false

const ensureDataLoaded = async () => {
  if (dataLoaded) return
  if (!authStore.isAuthenticated) return

  // Load items only if store is empty
  if (inventoryStore.items.length === 0) {
    await inventoryStore.fetchItems()
  }
  // Load warehouses only if store is empty
  if (warehouseStore.warehouses.length === 0) {
    await warehouseStore.fetchWarehouses().catch(() => {})
  }
  dataLoaded = true
}

onMounted(async () => {
  await ensureDataLoaded()
})

onActivated(async () => {
  // When tab becomes active again, we could refresh data if needed.
  // But to avoid unnecessary network calls, we only load if still empty.
  if (inventoryStore.items.length === 0 || warehouseStore.warehouses.length === 0) {
    await ensureDataLoaded()
  }
})

// Watch warehouse filter change – no need to re-fetch because we already have all items.
// The filteredItems computed will automatically update.
watch(activeWarehouseFilter, () => {
  // No op – reactivity handles UI update automatically.
})

// Helper
const formatNumber = (num: number): string => num?.toLocaleString() || '0'
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
