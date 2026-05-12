<template>
  <div class="w-full px-3 sm:px-4 py-4 sm:py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">الحركات</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1 font-medium">سجل جميع حركات المخزون</p>
      </div>
      <div class="flex gap-3 w-full sm:w-auto">
        <button @click="exportToExcel" class="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all inline-flex items-center gap-2 shadow-md font-bold min-h-[44px]">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-4" />
          </svg>
          تصدير Excel
        </button>
        <button @click="refreshData" :disabled="isRefreshing" class="px-5 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl transition-all inline-flex items-center gap-2 shadow-md font-bold disabled:opacity-50 min-h-[44px]">
          <svg v-if="isRefreshing" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ isRefreshing ? 'جاري التحديث...' : 'تحديث' }}
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4 mb-8">
      <div class="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg p-4 text-white">
        <p class="text-slate-100 text-sm font-bold">إجمالي الحركات</p>
        <p class="text-3xl sm:text-4xl font-black">{{ formatNumber(storeStats.total) }}</p>
      </div>
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
        <p class="text-green-100 text-sm font-bold">إضافة</p>
        <p class="text-3xl sm:text-4xl font-black">{{ formatNumber(storeStats.add) }}</p>
      </div>
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
        <p class="text-blue-100 text-sm font-bold">تعديل</p>
        <p class="text-3xl sm:text-4xl font-black">{{ formatNumber(storeStats.update) }}</p>
      </div>
      <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-4 text-white">
        <p class="text-red-100 text-sm font-bold">حذف</p>
        <p class="text-3xl sm:text-4xl font-black">{{ formatNumber(storeStats.delete) }}</p>
      </div>
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
        <p class="text-purple-100 text-sm font-bold">تحويل</p>
        <p class="text-3xl sm:text-4xl font-black">{{ formatNumber(storeStats.transfer) }}</p>
      </div>
      <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-4 text-white">
        <p class="text-amber-100 text-sm font-bold">صرف</p>
        <p class="text-3xl sm:text-4xl font-black">{{ formatNumber(storeStats.dispatch) }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث بالمنتج أو الكود أو المستخدم..."
            class="w-full pl-9 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium min-h-[44px]"
          />
          <div v-if="isSearching" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4">
            <svg class="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
        </div>
        <select v-model="typeFilter" class="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium min-h-[44px]">
          <option value="">جميع الأنواع</option>
          <option value="ADD">إضافة</option>
          <option value="UPDATE">تعديل</option>
          <option value="DELETE">حذف</option>
          <option value="TRANSFER">تحويل</option>
          <option value="DISPATCH">صرف</option>
        </select>
        <select v-model="warehouseFilter" class="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium min-h-[44px]">
          <option value="">جميع المخازن</option>
          <option v-for="warehouse in accessibleWarehouses" :key="warehouse.id" :value="warehouse.id">
            {{ warehouse.name_ar || warehouse.name }}
          </option>
        </select>
        <div class="flex gap-2">
          <input
            v-model="dateFilterString"
            type="date"
            class="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium min-h-[44px]"
          />
          <button @click="setTodayFilter" class="px-4 py-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl text-sm font-bold hover:bg-amber-200 transition-colors whitespace-nowrap min-h-[44px]">
            اليوم
          </button>
        </div>
      </div>
      <div class="flex justify-between items-center mt-3">
        <button @click="resetFilters" class="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline min-h-[44px]">
          إعادة تعيين الفلاتر
        </button>
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
          إجمالي {{ formatNumber(filteredTransactions.length) }} حركة (بعد التصفية)
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <div class="overflow-y-auto" style="max-height: calc(100vh - 380px); min-height: 400px;">
          <table class="w-full min-w-[800px]">
            <thead class="sticky top-0 z-10 bg-gradient-to-r from-amber-700 to-amber-800 text-white">
              <table>
                <th class="px-4 py-4 text-center text-sm font-extrabold uppercase tracking-wider border-r border-white/20">التاريخ</th>
                <th class="px-4 py-4 text-center text-sm font-extrabold uppercase tracking-wider border-r border-white/20">النوع</th>
                <th class="px-4 py-4 text-center text-sm font-extrabold uppercase tracking-wider border-r border-white/20">المنتج</th>
                <th class="px-4 py-4 text-center text-sm font-extrabold uppercase tracking-wider border-r border-white/20">من مخزن</th>
                <th class="px-4 py-4 text-center text-sm font-extrabold uppercase tracking-wider border-r border-white/20">إلى مخزن</th>
                <th class="px-4 py-4 text-center text-sm font-extrabold uppercase tracking-wider border-r border-white/20">الكمية</th>
                <th class="px-4 py-4 text-center text-sm font-extrabold uppercase tracking-wider border-r border-white/20">المستخدم</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <template v-if="isLoadingStore">
                <tr v-for="i in 5" :key="i" class="animate-pulse">
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div></td>
                  <td class="px-4 py-3"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mx-auto"></div></td>
                </tr>
              </template>
              <template v-else>
                <tr v-for="tx in paginatedTransactions" :key="tx.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="px-4 py-3 text-center text-base font-medium text-gray-800 dark:text-gray-200">{{ formatDate(tx.createdAt) }}</td>
                  <td class="px-4 py-3 text-center"><span :class="getTypeBadge(tx.type)" class="px-3 py-1.5 text-sm font-black rounded-full inline-block">{{ getTypeText(tx.type) }}</span></td>
                  <td class="px-4 py-3 text-center"><div class="text-base font-black text-gray-900 dark:text-white">{{ tx.itemName }}</div><div class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ tx.itemCode }}</div></td>
                  <td class="px-4 py-3 text-center text-base font-medium">{{ getWarehouseName(tx.fromWarehouse) || '-' }}</td>
                  <td class="px-4 py-3 text-center text-base font-medium">{{ getWarehouseName(tx.toWarehouse) || tx.destination || '-' }}</td>
                  <td class="px-4 py-3 text-center text-base font-black" :class="getQuantityClass(tx.totalDelta)">{{ formatDelta(tx.totalDelta) }}</td>
                  <td class="px-4 py-3 text-center text-base font-medium">{{ tx.createdBy || tx.userId || '-' }}</td>
                </tr>
              </template>
              <tr v-if="!isLoadingStore && filteredTransactions.length === 0">
                <td colspan="7" class="px-4 py-12 text-center text-gray-500">
                  <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p class="text-base font-bold">لا توجد حركات</p>
                  <p class="text-sm mt-1">حاول تعديل البحث أو الفلاتر</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Load More (only for very large datasets) -->
    <div v-if="!isSearchActive && paginatedTransactions.length < filteredTransactions.length" class="flex justify-center mt-6">
      <button @click="loadMoreItems" class="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl shadow-md font-bold transition-all min-h-[48px]">
        تحميل المزيد ({{ paginatedTransactions.length }} من {{ filteredTransactions.length }})
      </button>
    </div>
    <div v-if="isSearchActive" class="text-center text-amber-600 dark:text-amber-400 text-sm font-bold mt-4">
      نتائج البحث: {{ filteredTransactions.length }} حركة
      <button @click="clearSearch" class="mr-2 underline min-h-[40px]">إلغاء البحث</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import * as XLSX from 'xlsx'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

// UI states
const isLoadingStore = ref(true)
const isRefreshing = ref(false)
const isSearching = ref(false)

// Local filters
const searchQuery = ref('')
const typeFilter = ref('')
const warehouseFilter = ref('')
const dateFilterString = ref('')

const displayPage = ref(1)
const displayPageSize = ref(20)

// All transactions from store
const allTransactions = computed(() => inventoryStore.transactions)

// Stats computed from all transactions
const storeStats = computed(() => {
  const transactions = allTransactions.value
  
  let filteredForStats = [...transactions]
  if (authStore.isWarehouseManager) {
    const accessibleIds = accessibleWarehouses.value.map(w => w.id)
    filteredForStats = filteredForStats.filter(tx =>
      !tx.fromWarehouse || accessibleIds.includes(tx.fromWarehouse) ||
      !tx.toWarehouse || accessibleIds.includes(tx.toWarehouse)
    )
  }
  
  return {
    total: filteredForStats.length,
    add: filteredForStats.filter(tx => tx.type === 'ADD').length,
    update: filteredForStats.filter(tx => tx.type === 'UPDATE').length,
    delete: filteredForStats.filter(tx => tx.type === 'DELETE').length,
    transfer: filteredForStats.filter(tx => tx.type === 'TRANSFER').length,
    dispatch: filteredForStats.filter(tx => tx.type === 'DISPATCH').length,
  }
})

// Filtered transactions
const filteredTransactions = computed(() => {
  let transactions = [...allTransactions.value]
  
  if (authStore.isWarehouseManager) {
    const accessibleIds = accessibleWarehouses.value.map(w => w.id)
    transactions = transactions.filter(tx =>
      !tx.fromWarehouse || accessibleIds.includes(tx.fromWarehouse) ||
      !tx.toWarehouse || accessibleIds.includes(tx.toWarehouse)
    )
  }
  
  if (typeFilter.value) {
    transactions = transactions.filter(tx => tx.type === typeFilter.value)
  }
  
  if (warehouseFilter.value) {
    transactions = transactions.filter(tx => 
      tx.fromWarehouse === warehouseFilter.value || tx.toWarehouse === warehouseFilter.value
    )
  }
  
  if (dateFilterString.value) {
    const filterDate = new Date(dateFilterString.value)
    filterDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(filterDate)
    nextDay.setDate(nextDay.getDate() + 1)
    
    transactions = transactions.filter(tx => {
      const txDate = new Date(tx.createdAt)
      return txDate >= filterDate && txDate < nextDay
    })
  }
  
  if (searchQuery.value.trim().length >= 2) {
    const term = searchQuery.value.trim().toLowerCase()
    isSearching.value = true
    transactions = transactions.filter(tx =>
      tx.itemName?.toLowerCase().includes(term) ||
      tx.itemCode?.toLowerCase().includes(term) ||
      tx.createdBy?.toLowerCase().includes(term)
    )
    isSearching.value = false
  }
  
  return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const paginatedTransactions = computed(() => {
  const start = (displayPage.value - 1) * displayPageSize.value
  return filteredTransactions.value.slice(start, start + displayPageSize.value)
})

const isSearchActive = computed(() => searchQuery.value.trim().length >= 2)

const accessibleWarehouses = computed(() => {
  if (authStore.isSuperAdmin || authStore.isCompanyManager) return warehouseStore.warehouses
  if (authStore.isWarehouseManager) return warehouseStore.warehouses.filter(w => authStore.canAccessWarehouse(w.id))
  return []
})
const warehouses = computed(() => warehouseStore.warehouses)

const formatNumber = (num: number) => num?.toLocaleString() || '0'
const formatDate = (date: Date | string) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
const formatDelta = (delta: number) => delta > 0 ? `+${delta}` : `${delta}`
const getQuantityClass = (delta: number) => delta > 0 ? 'text-green-600 dark:text-green-400' : delta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600'

const getTypeBadge = (type: string) => {
  const badges: Record<string, string> = {
    ADD: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    TRANSFER: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    DISPATCH: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  }
  return badges[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}
const getTypeText = (type: string) => {
  const texts: Record<string, string> = { ADD: 'إضافة', UPDATE: 'تعديل', DELETE: 'حذف', TRANSFER: 'تحويل', DISPATCH: 'صرف' }
  return texts[type] || type
}
const getWarehouseName = (id?: string) => {
  if (!id) return '-'
  const w = warehouses.value.find(w => w.id === id)
  return w?.name_ar || w?.name || id.slice(0, 8)
}

const loadMoreItems = () => {
  displayPage.value++
}

const refreshData = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await inventoryStore.fetchTransactions(1, 10000, false)
  } catch (error) {
    console.error('Failed to refresh transactions:', error)
  } finally {
    isRefreshing.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  typeFilter.value = ''
  warehouseFilter.value = ''
  dateFilterString.value = ''
  displayPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  typeFilter.value = ''
  warehouseFilter.value = ''
  dateFilterString.value = ''
  displayPage.value = 1
}

const setTodayFilter = () => {
  const today = new Date()
  dateFilterString.value = today.toISOString().split('T')[0]
  displayPage.value = 1
}

const exportToExcel = () => {
  const data = filteredTransactions.value.map(tx => ({
    'التاريخ': formatDate(tx.createdAt),
    'النوع': getTypeText(tx.type),
    'اسم المنتج': tx.itemName,
    'كود المنتج': tx.itemCode,
    'من مخزن': getWarehouseName(tx.fromWarehouse),
    'إلى مخزن': getWarehouseName(tx.toWarehouse) || tx.destination || '-',
    'الكمية': tx.totalDelta,
    'المستخدم': tx.createdBy || tx.userId || '-'
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'الحركات')
  XLSX.writeFile(wb, `transactions_${new Date().toISOString().split('T')[0]}.xlsx`)
}

onMounted(async () => {
  isLoadingStore.value = true
  try {
    if (warehouseStore.warehouses.length === 0) {
      await warehouseStore.fetchWarehouses()
    }
    // Load all transactions (increase limit to get all)
    await inventoryStore.fetchTransactions(1, 10000, false)
  } catch (error) {
    console.error('Failed to load initial data:', error)
  } finally {
    isLoadingStore.value = false
  }
})

watch([searchQuery, typeFilter, warehouseFilter, dateFilterString], () => {
  displayPage.value = 1
})
</script>

<style scoped>
thead { position: sticky; top: 0; z-index: 10; }
.overflow-y-auto::-webkit-scrollbar { width: 8px; }
.overflow-y-auto::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
.overflow-y-auto::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
.dark .overflow-y-auto::-webkit-scrollbar-track { background: #1f2937; }
.dark .overflow-y-auto::-webkit-scrollbar-thumb { background: #4b5563; }

@media (max-width: 768px) {
  .min-h-[44px] { min-height: 44px; }
  .min-h-[48px] { min-height: 48px; }
  select, button, input { font-size: 14px; }
}
</style>
