<template>
  <div class="p-4 sm:p-6" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">لوحة تحكم مدير المستودع</h1>

    <!-- Optional: Show which warehouse is currently active -->
    <div v-if="activeWarehouseFilter" class="mb-4 text-sm text-gray-600 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg inline-block">
      <span class="font-medium">المستودع الحالي:</span> {{ getWarehouseName(activeWarehouseFilter) }}
      <button @click="clearWarehouseFilter" class="mr-2 text-red-500 hover:text-red-700 text-xs">✕ إلغاء التصفية</button>
    </div>

    <!-- Stats Cards (using summaryStats from store) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-100 text-xs sm:text-sm">إجمالي الأصناف</p>
            <p class="text-2xl sm:text-3xl font-bold">{{ formatNumber(inventoryStore.summaryStats.totalItems) }}</p>
          </div>
          <div class="bg-white/20 rounded-full p-2 sm:p-3">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-yellow-100 text-xs sm:text-sm">المخزون المنخفض</p>
            <p class="text-2xl sm:text-3xl font-bold">{{ formatNumber(inventoryStore.summaryStats.lowStock) }}</p>
          </div>
          <div class="bg-white/20 rounded-full p-2 sm:p-3">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-red-100 text-xs sm:text-sm">المخزون الحرج</p>
            <p class="text-2xl sm:text-3xl font-bold">{{ formatNumber(inventoryStore.summaryStats.criticalStock) }}</p>
          </div>
          <div class="bg-white/20 rounded-full p-2 sm:p-3">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-100 text-xs sm:text-sm">إجمالي الوحدات</p>
            <p class="text-2xl sm:text-3xl font-bold">{{ formatNumber(inventoryStore.summaryStats.totalQuantity) }}</p>
          </div>
          <div class="bg-white/20 rounded-full p-2 sm:p-3">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Action Cards (Vibrant) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <router-link to="/inventory/items" class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
        <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="p-6 flex items-center gap-4">
          <div class="bg-white/20 rounded-full p-3 group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div class="text-white">
            <h3 class="font-bold text-lg">إدارة الأصناف</h3>
            <p class="text-emerald-100 text-sm">عرض وإدارة المخزون</p>
          </div>
        </div>
      </router-link>

      <router-link to="/inventory/transactions" class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
        <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="p-6 flex items-center gap-4">
          <div class="bg-white/20 rounded-full p-3 group-hover:scale-110 transition-transform">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div class="text-white">
            <h3 class="font-bold text-lg">الحركات</h3>
            <p class="text-sky-100 text-sm">عرض سجل الحركات</p>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onActivated, watch, ref } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

// ---------- Warehouse Name Cache ----------
const warehouseNameMap = ref<Map<string, string>>(new Map())

function updateWarehouseNameMap() {
  const map = new Map<string, string>()
  for (const w of warehouseStore.warehouses) {
    map.set(w.id, w.name_ar || w.name || '—')
  }
  warehouseNameMap.value = map
}

watch(() => warehouseStore.warehouses, () => {
  updateWarehouseNameMap()
}, { immediate: true, deep: false })

const getWarehouseName = (warehouseId: string): string => {
  return warehouseNameMap.value.get(warehouseId) || '—'
}

// ---------- Active Warehouse Filter ----------
const activeWarehouseFilter = computed(() => {
  const filter = inventoryStore.currentFilters.warehouseId
  if (!filter) return null
  if (authStore.isSuperAdmin || authStore.isCompanyManager) return filter
  const allowedIds = authStore.user?.allowedWarehouses || []
  if (allowedIds.includes('all') || allowedIds.includes(filter)) return filter
  return null
})

const clearWarehouseFilter = () => {
  inventoryStore.currentFilters.warehouseId = ''
}

// ---------- Refresh Summary Stats when Filter Changes ----------
async function refreshStats() {
  if (!authStore.currentTenantId) return
  await inventoryStore.fetchSummaryStats({
    search: inventoryStore.currentFilters.search || undefined,
    warehouseId: inventoryStore.currentFilters.warehouseId || undefined,
    color: inventoryStore.currentFilters.color || undefined,
    size: inventoryStore.currentFilters.size || undefined,
  })
}

// ---------- Data Loading (Only once, plus stats refresh on filter) ----------
let dataLoaded = false

async function ensureDataLoaded() {
  if (dataLoaded) return
  if (!authStore.isAuthenticated) return

  // Load warehouses (needed for name mapping)
  if (warehouseStore.warehouses.length === 0) {
    await warehouseStore.fetchWarehouses().catch(() => {})
  }

  // Load summary stats only – no need to load all items for dashboard
  await refreshStats()

  dataLoaded = true
}

// Watch warehouse filter to update stats
watch(() => inventoryStore.currentFilters.warehouseId, () => {
  refreshStats()
})

onMounted(async () => {
  await ensureDataLoaded()
})

onActivated(async () => {
  // Refresh stats when tab becomes active again (in case something changed elsewhere)
  if (authStore.currentTenantId) {
    await refreshStats()
  }
})

// Helper
const formatNumber = (num: number): string => num?.toLocaleString() || '0'
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
</style>
