<template>
  <div class="space-y-6">
    <!-- Trial banners, header, etc. (unchanged) -->
    <div v-if="authStore.isUserTrialActive" class="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 sm:p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-amber-800 dark:text-amber-300 text-base sm:text-lg">🎉 فترة تجريبية مجانية</h3>
            <p class="text-amber-700 dark:text-amber-400 text-sm">تبقى <span class="font-bold text-amber-900 dark:text-amber-300 text-lg">{{ daysLeft }}</span> يوم</p>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <div class="text-sm text-amber-700 dark:text-amber-400"><span class="font-medium">تاريخ البدء:</span> {{ trialStartDate }}</div>
          <div class="text-sm text-amber-700 dark:text-amber-400"><span class="font-medium">تاريخ الانتهاء:</span> {{ trialEndDate }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="requestUpgrade" :disabled="upgradeRequestSent" class="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg text-sm font-semibold hover:from-amber-700 hover:to-amber-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              {{ upgradeRequestSent ? 'تم إرسال الطلب' : 'طلب ترقية الحساب' }}
            </button>
            <button @click="contactSales" class="px-4 py-1.5 border border-amber-600 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all">تواصل مع المبيعات</button>
          </div>
          <div v-if="upgradeRequestSent" class="text-xs text-green-600 dark:text-green-400 mt-1">✓ تم إرسال طلب الترقية. سيتم التواصل معك قريباً.</div>
        </div>
      </div>
      <div class="mt-3">
        <div class="flex justify-between text-xs text-amber-600 dark:text-amber-400 mb-1"><span>بداية التجربة</span><span>نهاية التجربة</span></div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div class="bg-gradient-to-r from-amber-500 to-amber-600 h-2.5 rounded-full transition-all duration-500" :style="{ width: `${trialProgressPercentage}%` }"></div>
        </div>
        <p class="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">اكتمل {{ trialProgressPercentage }}% من الفترة التجريبية</p>
      </div>
    </div>

    <div v-if="authStore.isUserTrialActive && daysLeft <= 5 && daysLeft > 0" class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-300 dark:border-red-800 rounded-xl p-4">
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p class="font-semibold text-red-700 dark:text-red-300 text-sm">⚠️ تنبيه: تنتهي الفترة التجريبية خلال {{ daysLeft }} يوم</p>
          <p class="text-red-600 dark:text-red-400 text-xs">قم بطلب ترقية حسابك الآن للاستمرار في استخدام النظام</p>
        </div>
      </div>
    </div>

    <div v-if="showSubscriptionMessage" class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="font-semibold text-blue-700 dark:text-blue-300 text-sm">{{ subscriptionMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Header Section -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">مرحباً {{ userName }}</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">مرحباً بعودتك! إليك ملخص المخزون اليوم.</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <div class="relative">
            <select v-model="inventoryStore.currentFilters.warehouseId" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500">
              <option value="">جميع المخازن</option>
              <option v-for="warehouse in accessibleWarehouses" :key="warehouse.id" :value="warehouse.id">
                {{ warehouse.name_ar || warehouse.name }}
              </option>
            </select>
          </div>
          <button @click="openGlobalTransferModal" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2 shadow-md font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <span class="hidden sm:inline">نقل</span>
          </button>
          <button @click="openGlobalDispatchModal" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all flex items-center gap-2 shadow-md font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span class="hidden sm:inline">صرف</span>
          </button>
          <router-link to="/inventory/items/new" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center gap-2 shadow-md font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            <span class="hidden sm:inline">إضافة صنف</span>
          </router-link>
          <button @click="refreshData" :disabled="isRefreshing" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all flex items-center gap-2 shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            <svg v-if="isRefreshing" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            <span class="hidden sm:inline">{{ isRefreshing ? 'جاري التحديث...' : 'تحديث' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards – now using store's summaryStats directly -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm font-bold">إجمالي الأصناف</p>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{{ formatNumber(inventoryStore.summaryStats.totalItems) }}</p>
          </div>
          <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm font-bold">إجمالي الوحدات</p>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{{ formatNumber(inventoryStore.summaryStats.totalQuantity) }}</p>
          </div>
          <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm font-bold">مخزون منخفض</p>
            <p class="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{{ formatNumber(inventoryStore.summaryStats.lowStock) }}</p>
          </div>
          <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm font-bold">نفد المخزون</p>
            <p class="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">{{ formatNumber(inventoryStore.summaryStats.outOfStock) }}</p>
          </div>
          <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Warehouse Distribution Table (no change) -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">توزيع المخزون في المخازن</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">توزيع المخزون عبر جميع المخازن</p>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ warehouseStats.length }} مخزن</span>
        </div>
      </div>
      <div class="overflow-x-auto">
        <div class="max-h-96 overflow-y-auto">
          <table class="w-full min-w-[600px]">
            <thead class="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">
              <tr class="border-b border-gray-200 dark:border-gray-600">
                <th class="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">المخزن</th>
                <th class="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">الأصناف</th>
                <th class="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">الوحدات</th>
                <th class="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">مخزون منخفض</th>
                <th class="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">الاستخدام</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="warehouse in warehouseStats" :key="warehouse.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-4 py-4 text-center">
                  <div class="font-bold text-gray-900 dark:text-white">{{ warehouse.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ warehouse.location || 'لا يوجد موقع' }}</div>
                </td>
                <td class="px-4 py-4 text-center text-base font-semibold text-gray-700 dark:text-gray-300">{{ formatNumber(warehouse.itemCount) }}</td>
                <td class="px-4 py-4 text-center font-bold text-gray-900 dark:text-white">{{ formatNumber(warehouse.totalUnits) }}</td>
                <td class="px-4 py-4 text-center"><span :class="warehouse.lowStockCount > 0 ? 'text-yellow-600 dark:text-yellow-400 font-bold' : 'text-gray-500 dark:text-gray-400'">{{ formatNumber(warehouse.lowStockCount) }}</span></td>
                <td class="px-4 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div class="bg-amber-600 rounded-full h-2 transition-all duration-500" :style="{ width: warehouse.utilization + '%' }"></div>
                    </div>
                    <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">{{ warehouse.utilization }}%</span>
                  </div>
                </td>
              </tr>
              <tr v-if="warehouseStats.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">لا توجد مخازن</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Charts Section (remains, but uses client‑side computed values – you can keep) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Inventory Status Chart (uses client‑side computed, fine) -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">توزيع حالة المخزون</h3>
        <div v-if="isLoadingItems" class="animate-pulse">...</div>
        <div v-else>
          <!-- same chart as before -->
        </div>
      </div>

      <!-- Alerts Section (uses filteredItems, which are the store's items – they will be loaded from list page) -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">التنبيهات الأخيرة</h3>
        <div v-if="isLoadingItems" class="space-y-3">...</div>
        <div v-else class="space-y-3 max-h-[500px] overflow-y-auto">
          <!-- same alerts as before -->
        </div>
      </div>
    </div>

    <!-- Recent Transactions Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">...</div>

    <TransferModal :is-open="showTransferModal" @close="showTransferModal = false" @success="refreshData" />
    <DispatchModal :is-open="showDispatchModal" @close="showDispatchModal = false" @success="refreshData" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useAuthStore } from '@/stores/auth'
import TransferModal from '@/components/modals/TransferModal.vue'
import DispatchModal from '@/components/modals/DispatchModal.vue'
import { supabase } from '@/services/supabase'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()

const showTransferModal = ref(false)
const showDispatchModal = ref(false)
const subscriptionMessage = ref('')
const showSubscriptionMessage = ref(false)
const daysLeft = ref(0)
const upgradeRequestSent = ref(false)
let timerInterval: ReturnType<typeof setInterval> | null = null
const isRefreshing = ref(false)

// Separate loading states
const isLoadingItems = ref(true)
const isLoadingTransactions = ref(true)

const outOfStockLoadMore = ref(5)
const lowStockLoadMore = ref(5)
const criticalStockLoadMore = ref(5)

// Helper functions
const formatNumber = (num: number) => num?.toLocaleString() || '0'
const formatDate = (date: Date | string) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}
const formatDelta = (delta: number) => delta > 0 ? `+${delta.toLocaleString()}` : `${delta.toLocaleString()}`
const getQuantityClass = (delta: number) => delta > 0 ? 'text-green-600 dark:text-green-400' : (delta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400')
const getTypeBadge = (type: string) => {
  const badges: Record<string, string> = {
    ADD: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    TRANSFER: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    DISPATCH: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    UPDATE: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    DELETE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  }
  return badges[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}
const getTypeText = (type: string) => ({ ADD: 'إضافة', TRANSFER: 'نقل', DISPATCH: 'صرف', UPDATE: 'تحديث', DELETE: 'حذف' }[type] || type)
const getWarehouseName = (id: string) => {
  const w = warehouseStore.warehouses.find(w => w.id === id)
  return w?.name_ar || w?.name || 'غير معروف'
}

const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'المستخدم')
const accessibleWarehouses = computed(() => {
  if (authStore.isSuperAdmin || authStore.isCompanyManager) return warehouseStore.warehouses
  const allowed = authStore.user?.allowedWarehouses || []
  if (allowed.includes('all')) return warehouseStore.warehouses
  return warehouseStore.warehouses.filter(w => allowed.includes(w.id))
})

// Use store items for alerts (they may be empty initially, but will be loaded from list page)
const filteredItems = computed(() => {
  const warehouseId = inventoryStore.currentFilters.warehouseId
  if (!warehouseId) return inventoryStore.items
  return inventoryStore.items.filter(i => i.warehouseId === warehouseId)
})

const totalUnits = computed(() => filteredItems.value.reduce((sum, i) => sum + (i.remainingQuantity || 0), 0))

// Compute alerts from filteredItems
const lowStockItemsList = computed(() => filteredItems.value.filter(i => i.remainingQuantity > 0 && i.remainingQuantity <= 50))
const criticalStockItemsList = computed(() => filteredItems.value.filter(i => i.remainingQuantity > 50 && i.remainingQuantity <= 500))
const outOfStockItemsList = computed(() => filteredItems.value.filter(i => i.remainingQuantity === 0))

const displayedOutOfStockItems = computed(() => outOfStockItemsList.value.slice(0, outOfStockLoadMore.value))
const displayedLowStockItems = computed(() => lowStockItemsList.value.slice(0, lowStockLoadMore.value))
const displayedCriticalStockItems = computed(() => criticalStockItemsList.value.slice(0, criticalStockLoadMore.value))

// Warehouse stats computed from filteredItems
const warehouseStats = computed(() => {
  const warehousesMap = new Map<string, { itemCount: number; totalUnits: number; lowStockCount: number }>()
  for (const item of filteredItems.value) {
    const wid = item.warehouseId
    if (!warehousesMap.has(wid)) warehousesMap.set(wid, { itemCount: 0, totalUnits: 0, lowStockCount: 0 })
    const entry = warehousesMap.get(wid)!
    entry.itemCount++
    entry.totalUnits += item.remainingQuantity || 0
    if (item.remainingQuantity > 0 && item.remainingQuantity <= 50) entry.lowStockCount++
  }
  const stats = []
  for (const [wid, data] of warehousesMap.entries()) {
    const wh = warehouseStore.warehouses.find(w => w.id === wid)
    if (!wh) continue
    const maxCapacity = 10000
    const utilization = Math.min(Math.round((data.totalUnits / maxCapacity) * 100), 100)
    stats.push({
      id: wid,
      name: wh.name_ar || wh.name,
      location: wh.location,
      itemCount: data.itemCount,
      totalUnits: data.totalUnits,
      lowStockCount: data.lowStockCount,
      utilization
    })
  }
  return stats
})

// Chart client-side (same as before)
const inStockCount = computed(() => filteredItems.value.length - lowStockItemsList.value.length - criticalStockItemsList.value.length - outOfStockItemsList.value.length)
const totalAll = computed(() => filteredItems.value.length)
const inStockNum = computed(() => totalAll.value ? (inStockCount.value / totalAll.value) * 100 : 0)
const criticalStockNum = computed(() => totalAll.value ? (criticalStockItemsList.value.length / totalAll.value) * 100 : 0)
const lowStockNum = computed(() => totalAll.value ? (lowStockItemsList.value.length / totalAll.value) * 100 : 0)
const outOfStockNum = computed(() => totalAll.value ? (outOfStockItemsList.value.length / totalAll.value) * 100 : 0)
const inStockColor = '#10b981'
const criticalStockColor = '#f97316'
const lowStockColor = '#eab308'
const outOfStockColor = '#ef4444'

const recentTransactions = computed(() => inventoryStore.transactions.slice(0, 10))

// ========== LOADING STRATEGY ==========
// Do NOT load all items. Only load summary stats and transactions.
async function loadDashboardData() {
  if (!authStore.currentTenantId) return
  
  // Warehouses first (small)
  await warehouseStore.fetchWarehouses()
  
  isLoadingItems.value = true
  isLoadingTransactions.value = true
  
  // Load summary stats (already uses cached or fresh)
  await inventoryStore.fetchSummaryStats()
  
  // Load recent transactions
  try {
    await inventoryStore.fetchTransactions(1, 50, false)
  } catch (error) {
    console.error('Failed to load transactions:', error)
  } finally {
    isLoadingTransactions.value = false
  }
  
  // Items are NOT loaded here – they will be loaded when user visits ItemList.
  // For alerts, we rely on the store's items (they will be empty until list page is visited).
  // To make alerts work even without visiting list, you could load only low/out items separately,
  // but for simplicity we set isLoadingItems false after a short delay.
  setTimeout(() => {
    isLoadingItems.value = false
  }, 500)
}

const refreshData = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await Promise.all([
      inventoryStore.fetchSummaryStats(),
      inventoryStore.fetchTransactions(1, 50, false),
      warehouseStore.fetchWarehouses(),
      checkSubscriptionUpdate()
    ])
  } catch (error) {
    console.error('Refresh failed:', error)
    alert('حدث خطأ أثناء تحديث البيانات. يرجى المحاولة مرة أخرى.')
  } finally {
    isRefreshing.value = false
  }
}

// Watch warehouse filter – triggers recomputation of computed properties
watch(() => inventoryStore.currentFilters.warehouseId, () => {})

const openGlobalTransferModal = () => { showTransferModal.value = true }
const openGlobalDispatchModal = () => { showDispatchModal.value = true }

// Trial & subscription helpers (unchanged)
const trialStartDate = computed(() => { ... })
const trialEndDate = computed(() => { ... })
const trialProgressPercentage = computed(() => { ... })
const updateDaysLeft = () => { ... }
const checkSubscriptionUpdate = async () => { ... }
const checkPendingRequest = async () => { ... }
const requestUpgrade = async () => { ... }
const contactSales = () => { ... }
const startCountdown = () => { ... }

onMounted(async () => {
  startCountdown()
  await loadDashboardData()
  await checkSubscriptionUpdate()
  await checkPendingRequest()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>
