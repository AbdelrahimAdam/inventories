<template>
  <div class="p-4 sm:p-6" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- View-only Banner -->
    <div v-if="authStore.isViewOnly" class="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-6">
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

    <!-- Loading Progress -->
    <div v-if="inventoryStore.isLoading && inventoryStore.loadingProgress < 100" class="mb-4">
      <div class="flex items-center gap-3">
        <div class="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent flex-shrink-0"></div>
        <div class="flex-1">
          <div class="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-0.5">
            <span>جاري تحميل البيانات...</span>
            <span>{{ Math.round(inventoryStore.loadingProgress) }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-amber-500 to-amber-600 h-1.5 rounded-full transition-all duration-500" :style="{ width: inventoryStore.loadingProgress + '%' }"></div>
          </div>
          <div class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            تم تحميل {{ inventoryStore.items.length }} صنف
          </div>
        </div>
      </div>
    </div>

    <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">لوحة المعلومات</h1>

    <!-- Stats Cards -->
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

    <!-- Recent Items -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">أحدث الأصناف</h2>
      </div>

      <!-- Desktop Table View -->
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
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">لا توجد أصناف ضمن المستودعات المسموح بها</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
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
          لا توجد أصناف ضمن المستودعات المسموح بها
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated, watch, onBeforeUnmount } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

const isLoading = ref(false)
let refreshTimer: ReturnType<typeof setInterval> | null = null

const formatNumber = (num: number) => num?.toLocaleString() || '0'

const allowedWarehouseIds = computed(() => {
  const user = authStore.user
  if (!user) return []

  if (authStore.isSuperAdmin || authStore.isCompanyManager) {
    return warehouseStore.warehouses.map(w => w.id)
  }

  if (authStore.isWarehouseManager || authStore.isViewOnly) {
    const allowed = user.allowedWarehouses || []
    if (allowed.includes('all')) {
      return warehouseStore.warehouses.map(w => w.id)
    }
    return allowed
  }

  return []
})

const accessibleWarehouses = computed(() => {
  const allPrimary = warehouseStore.warehouses.filter(w => w.type !== 'dispatch')
  if (authStore.isSuperAdmin || authStore.isCompanyManager) {
    return allPrimary
  }
  if (authStore.isWarehouseManager || authStore.isViewOnly) {
    const allowedIds = authStore.user?.allowedWarehouses || []
    if (allowedIds.length === 0) return []
    if (allowedIds.includes('all')) return allPrimary
    return allPrimary.filter(w => allowedIds.includes(w.id))
  }
  return []
})

const restrictedItems = computed(() => {
  const items = inventoryStore.items
  const allowedIds = allowedWarehouseIds.value

  if (items.length === 0 || allowedIds.length === 0) return []

  if (authStore.isSuperAdmin || authStore.isCompanyManager) {
    return items
  }

  return items.filter(item => allowedIds.includes(item.warehouseId))
})

const totalItems = computed(() => restrictedItems.value.length)
const totalUnits = computed(() => restrictedItems.value.reduce((sum, i) => sum + i.remainingQuantity, 0))
const totalWarehouses = computed(() => accessibleWarehouses.value.length)

const totalTransactions = computed(() => {
  const allowedIds = allowedWarehouseIds.value
  if (authStore.isSuperAdmin || authStore.isCompanyManager) {
    return inventoryStore.transactions.length
  }
  return inventoryStore.transactions.filter(tx =>
    allowedIds.includes(tx.fromWarehouse) || allowedIds.includes(tx.toWarehouse)
  ).length
})

const recentItems = computed(() => restrictedItems.value.slice(0, 10))

const getWarehouseName = (warehouseId: string) => {
  const warehouse = warehouseStore.warehouses.find(w => w.id === warehouseId)
  return warehouse?.name_ar || warehouse?.name || '—'
}

async function loadDashboardData(force = false) {
  const tenantId = authStore.currentTenantId
  if (!tenantId) return

  isLoading.value = true

  try {
    await warehouseStore.fetchWarehouses()

    if (!force) {
      const cacheLoaded = inventoryStore.loadFromCache(tenantId)
      if (cacheLoaded) {
        if (inventoryStore.transactions.length === 0) {
          await inventoryStore.fetchTransactions(1, 10)
        }
        isLoading.value = false
        return
      }
    }

    await inventoryStore.fetchItems()
    await inventoryStore.fetchTransactions(1, 10)
    inventoryStore.saveToCache(tenantId)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    isLoading.value = false
  }
}

// ✅ Background refresh
function startBackgroundRefresh() {
  if (refreshTimer) return
  refreshTimer = setInterval(async () => {
    if (!document.hidden && authStore.isAuthenticated) {
      const tenantId = authStore.currentTenantId
      if (tenantId) {
        try {
          const hasChanged = await inventoryStore.hasDataChanged(tenantId)
          if (hasChanged) {
            await inventoryStore.fetchItems()
            await inventoryStore.fetchTransactions(1, 10)
            inventoryStore.saveToCache(tenantId)
          }
        } catch (e) {
          console.warn('Background refresh failed:', e)
        }
      }
    }
  }, 60000)
}

function stopBackgroundRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

watch(() => warehouseStore.warehouses, () => {
  // Computed properties will update automatically
}, { deep: false })

watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    loadDashboardData(false)
    startBackgroundRefresh()
  } else {
    stopBackgroundRefresh()
  }
})

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await loadDashboardData(false)
    startBackgroundRefresh()
  }
})

onActivated(async () => {
  if (authStore.isAuthenticated) {
    const tenantId = authStore.currentTenantId
    if (tenantId) {
      const hasChanged = await inventoryStore.hasDataChanged(tenantId)
      if (hasChanged) {
        await loadDashboardData(true)
      }
    }
  }
})

onBeforeUnmount(() => {
  stopBackgroundRefresh()
})
</script>

<style scoped>
.transition-shadow {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.hover\:shadow-md:hover {
  transform: translateY(-2px);
}
@media (max-width: 640px) {
  .grid {
    gap: 0.75rem;
  }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>