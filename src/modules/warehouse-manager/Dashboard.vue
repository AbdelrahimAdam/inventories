<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">لوحة تحكم مدير المستودع</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">مرحباً بك، {{ userName }} 👋</p>
        <p v-if="lastUpdateTime" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          آخر تحديث: {{ lastUpdateTime }}
        </p>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <button
          @click="refreshData"
          :disabled="inventoryStore.isLoading"
          class="flex-1 sm:flex-none px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm font-semibold min-h-[44px] disabled:opacity-50"
        >
          <svg v-if="inventoryStore.isLoading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span class="hidden xs:inline">{{ inventoryStore.isLoading ? 'جاري التحديث...' : 'تحديث' }}</span>
          <span class="xs:hidden">{{ inventoryStore.isLoading ? '...' : '🔄' }}</span>
        </button>
        <router-link
          to="/inventory/items/new"
          class="flex-1 sm:flex-none px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm font-semibold min-h-[44px]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden xs:inline">إضافة صنف</span>
          <span class="xs:hidden">إضافة</span>
        </router-link>
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
        </div>
      </div>
    </div>

    <!-- Active Warehouse Filter -->
    <div v-if="activeWarehouseFilter" class="mb-4 flex flex-wrap items-center gap-2">
      <span class="text-sm text-gray-600 dark:text-gray-400">المستودع الحالي:</span>
      <span class="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-lg text-sm font-semibold">
        {{ getWarehouseName(activeWarehouseFilter) }}
      </span>
      <button
        @click="clearWarehouseFilter"
        class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium min-h-[36px] px-2"
      >
        ✕ إلغاء التصفية
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-3 sm:p-6 text-white hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-100 text-[10px] sm:text-sm font-medium">إجمالي الأصناف</p>
            <p class="text-xl sm:text-3xl font-bold">{{ formatNumber(displayStats.totalItems) }}</p>
          </div>
          <div class="bg-white/20 rounded-full p-2 sm:p-3">
            <svg class="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-3 sm:p-6 text-white hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-yellow-100 text-[10px] sm:text-sm font-medium">المخزون المنخفض</p>
            <p class="text-xl sm:text-3xl font-bold">{{ formatNumber(displayStats.lowStock) }}</p>
          </div>
          <div class="bg-white/20 rounded-full p-2 sm:p-3">
            <svg class="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-3 sm:p-6 text-white hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-red-100 text-[10px] sm:text-sm font-medium">المخزون الحرج</p>
            <p class="text-xl sm:text-3xl font-bold">{{ formatNumber(displayStats.criticalStock) }}</p>
          </div>
          <div class="bg-white/20 rounded-full p-2 sm:p-3">
            <svg class="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-3 sm:p-6 text-white hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-100 text-[10px] sm:text-sm font-medium">إجمالي الوحدات</p>
            <p class="text-xl sm:text-3xl font-bold">{{ formatNumber(displayStats.totalQuantity) }}</p>
          </div>
          <div class="bg-white/20 rounded-full p-2 sm:p-3">
            <svg class="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Action Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      <router-link
        to="/inventory/items"
        class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95"
      >
        <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="p-4 sm:p-6 flex items-center gap-4">
          <div class="bg-white/20 rounded-full p-2 sm:p-3 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div class="text-white">
            <h3 class="font-bold text-base sm:text-lg">إدارة الأصناف</h3>
            <p class="text-emerald-100 text-xs sm:text-sm">عرض وإدارة المخزون</p>
          </div>
        </div>
      </router-link>

      <router-link
        to="/inventory/transactions"
        class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95"
      >
        <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="p-4 sm:p-6 flex items-center gap-4">
          <div class="bg-white/20 rounded-full p-2 sm:p-3 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div class="text-white">
            <h3 class="font-bold text-base sm:text-lg">الحركات</h3>
            <p class="text-sky-100 text-xs sm:text-sm">عرض سجل الحركات</p>
          </div>
        </div>
      </router-link>

      <router-link
        to="/inventory/items/new"
        class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95"
      >
        <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="p-4 sm:p-6 flex items-center gap-4">
          <div class="bg-white/20 rounded-full p-2 sm:p-3 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div class="text-white">
            <h3 class="font-bold text-base sm:text-lg">إضافة صنف</h3>
            <p class="text-purple-100 text-xs sm:text-sm">إضافة صنف جديد</p>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Low Stock Alerts -->
    <div v-if="lowStockItems.length > 0 || criticalStockItems.length > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-3 sm:p-6 mb-8">
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        تنبيهات المخزون
      </h2>
      <div class="space-y-3 max-h-[300px] overflow-y-auto">
        <div v-if="criticalStockItems.length > 0" class="p-3 bg-red-50 dark:bg-red-900/20 border-r-4 border-red-500 rounded-lg">
          <p class="font-bold text-red-700 dark:text-red-300 text-sm">🔴 مخزون حرج ({{ criticalStockItems.length }})</p>
          <p class="text-xs text-red-600 dark:text-red-400 mt-0.5">أصناف بمستوى 250 وحدة أو أقل</p>
        </div>
        <div v-if="lowStockItems.length > 0" class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-r-4 border-yellow-500 rounded-lg">
          <p class="font-bold text-yellow-700 dark:text-yellow-300 text-sm">🟡 مخزون منخفض ({{ lowStockItems.length }})</p>
          <p class="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">أصناف بمستوى 500 وحدة أو أقل</p>
        </div>
      </div>
      <div class="mt-4">
        <router-link
          to="/inventory/items"
          class="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline"
        >
          عرض جميع الأصناف →
        </router-link>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div v-if="recentTransactions.length > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-3 sm:p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">آخر الحركات</h2>
        <router-link
          to="/inventory/transactions"
          class="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline"
        >
          عرض الكل
        </router-link>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[400px]">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="px-3 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400">التاريخ</th>
              <th class="px-3 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400">النوع</th>
              <th class="px-3 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الصنف</th>
              <th class="px-3 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الكمية</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="tx in recentTransactions" :key="tx.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{{ formatDate(tx.createdAt) }}</td>
              <td class="px-3 py-2">
                <span :class="getTypeBadge(tx.type)" class="px-2 py-0.5 text-xs rounded-full font-semibold">
                  {{ getTypeText(tx.type) }}
                </span>
              </td>
              <td class="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">{{ tx.itemName }}</td>
              <td class="px-3 py-2 text-sm font-bold" :class="tx.totalDelta > 0 ? 'text-green-600' : 'text-red-600'">
                {{ tx.totalDelta > 0 ? '+' : '' }}{{ formatNumber(tx.totalDelta) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onActivated, watch, ref, onBeforeUnmount } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

const warehouseNameMap = ref<Map<string, string>>(new Map())
const lastUpdateTime = ref('')
let refreshTimer: ReturnType<typeof setInterval> | null = null

const userName = computed(() => {
  return authStore.user?.name || authStore.user?.email?.split('@')[0] || 'مدير المستودع'
})

const activeWarehouseFilter = computed(() => {
  const filter = inventoryStore.currentFilters.warehouseId
  if (!filter) return null
  if (authStore.isSuperAdmin || authStore.isCompanyManager) return filter
  const allowedIds = authStore.user?.allowedWarehouses || []
  if (allowedIds.includes('all') || allowedIds.includes(filter)) return filter
  return null
})

// ✅ Single source of truth - all data from store
const displayStats = computed(() => {
  const warehouseId = inventoryStore.currentFilters.warehouseId
  if (warehouseId) {
    const filtered = inventoryStore.items.filter(item => item.warehouseId === warehouseId)
    return calculateStats(filtered)
  }
  return inventoryStore.summaryStats
})

function calculateStats(items: any[]) {
  let totalItems = items.length
  let totalQuantity = 0
  let lowStock = 0
  let criticalStock = 0
  let outOfStock = 0

  for (const item of items) {
    const qty = item.remainingQuantity || 0
    totalQuantity += qty

    if (qty === 0) {
      outOfStock++
    } else if (qty <= 250) {
      criticalStock++
    } else if (qty <= 500) {
      lowStock++
    }
  }

  return { totalItems, totalQuantity, lowStock, criticalStock, outOfStock }
}

const lowStockItems = computed(() => {
  const items = inventoryStore.lowStockItems
  const warehouseId = inventoryStore.currentFilters.warehouseId
  if (warehouseId) {
    return items.filter(item => item.warehouseId === warehouseId)
  }
  return items
})

const criticalStockItems = computed(() => {
  const items = inventoryStore.criticalStockItems
  const warehouseId = inventoryStore.currentFilters.warehouseId
  if (warehouseId) {
    return items.filter(item => item.warehouseId === warehouseId)
  }
  return items
})

const recentTransactions = computed(() => {
  let transactions = inventoryStore.transactions
  const warehouseId = inventoryStore.currentFilters.warehouseId
  if (warehouseId) {
    transactions = transactions.filter(tx => 
      tx.fromWarehouse === warehouseId || 
      tx.toWarehouse === warehouseId
    )
  }
  return transactions.slice(0, 5)
})

const formatNumber = (num: number): string => num?.toLocaleString() || '0'
const formatDate = (date: Date | string): string => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getTypeBadge = (type: string): string => {
  const badges: Record<string, string> = {
    ADD: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    TRANSFER: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    TRANSFER_IN: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    TRANSFER_OUT: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
    DISPATCH: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    UPDATE: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    DELETE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  }
  return badges[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}

const getTypeText = (type: string): string => {
  const texts: Record<string, string> = {
    ADD: 'إضافة',
    TRANSFER: 'تحويل',
    TRANSFER_IN: 'رصيد داخل',
    TRANSFER_OUT: 'رصيد خارج',
    DISPATCH: 'صرف',
    UPDATE: 'تحديث',
    DELETE: 'حذف',
  }
  return texts[type] || type
}

const getWarehouseName = (warehouseId: string): string => {
  return warehouseNameMap.value.get(warehouseId) || '—'
}

function updateWarehouseNameMap() {
  const map = new Map<string, string>()
  for (const w of warehouseStore.warehouses) {
    map.set(w.id, w.name_ar || w.name || '—')
  }
  warehouseNameMap.value = map
}

// ✅ Single unified data loading - uses store cache
async function loadDashboardData(force = false) {
  const tenantId = authStore.currentTenantId
  if (!tenantId) return

  try {
    await warehouseStore.fetchWarehouses()
    updateWarehouseNameMap()

    // ✅ Try cache first
    if (!force) {
      const cacheLoaded = inventoryStore.loadFromCache(tenantId)
      if (cacheLoaded) {
        // Load transactions if not loaded
        if (inventoryStore.transactions.length === 0) {
          await inventoryStore.fetchTransactions(1, 10)
        }
        lastUpdateTime.value = new Date().toLocaleString('ar-EG')
        return
      }
    }

    // ✅ Cache miss or force - load fresh
    await inventoryStore.fetchItems()
    await inventoryStore.fetchSummaryStats()
    await inventoryStore.fetchTransactions(1, 10)
    
    // ✅ Save to cache
    inventoryStore.saveToCache(tenantId)
    lastUpdateTime.value = new Date().toLocaleString('ar-EG')
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

// ✅ Refresh - uses store's force refresh
async function refreshData() {
  if (inventoryStore.isLoading) return
  
  try {
    await inventoryStore.forceRefreshAll()
    await inventoryStore.fetchTransactions(1, 10)
    lastUpdateTime.value = new Date().toLocaleString('ar-EG')
  } catch (error) {
    console.error('Error refreshing data:', error)
  }
}

const clearWarehouseFilter = () => {
  inventoryStore.currentFilters.warehouseId = ''
}

// ✅ Background refresh - checks for changes efficiently
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
            await inventoryStore.fetchSummaryStats()
            await inventoryStore.fetchTransactions(1, 10)
            inventoryStore.saveToCache(tenantId)
            lastUpdateTime.value = new Date().toLocaleString('ar-EG')
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

// ✅ Watch for warehouse filter changes - update stats
watch(() => inventoryStore.currentFilters.warehouseId, () => {
  // Stats update automatically via computed properties
})

// ✅ Watch for warehouse list changes
watch(() => warehouseStore.warehouses, () => {
  updateWarehouseNameMap()
}, { deep: false })

// ✅ Watch for auth changes
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    loadDashboardData(false)
    startBackgroundRefresh()
  } else {
    stopBackgroundRefresh()
  }
})

// Lifecycle hooks
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
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}
.group:hover .group-hover\:-translate-y-1 {
  transform: translateY(-0.25rem);
}
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

@media (min-width: 480px) {
  .xs\:inline { display: inline; }
  .xs\:hidden { display: none; }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Remove number input arrows */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>