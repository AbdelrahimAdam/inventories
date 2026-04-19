<template>
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- Initial Loading Spinner -->
    <div v-if="isInitialLoading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
    </div>

    <div v-else>
      <!-- Header (unchanged) -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">الحركات</h1>
        <div class="flex gap-2 w-full sm:w-auto">
          <button @click="exportToExcel" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm shadow-md">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-4" />
            </svg>
            تصدير Excel
          </button>
          <button @click="refreshData" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm shadow-md">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث
          </button>
        </div>
      </div>

      <!-- Stats Cards (unchanged) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <!-- ... same stats cards ... -->
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 transition-colors duration-200 border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <!-- Search input with debouncing -->
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="بحث بالمنتج أو الكود أو المستخدم..."
              class="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <div v-if="isSearching" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4">
              <svg class="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            </div>
          </div>
          <select v-model="typeFilter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
            <option value="">جميع الأنواع</option>
            <option value="ADD">إضافة</option>
            <option value="UPDATE">تعديل</option>
            <option value="DELETE">حذف</option>
            <option value="TRANSFER">تحويل</option>
            <option value="DISPATCH">صرف</option>
          </select>
          <select v-model="warehouseFilter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
            <option value="">جميع المخازن</option>
            <option v-for="warehouse in accessibleWarehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name_ar || warehouse.name }}
            </option>
          </select>
          <div class="flex gap-2">
            <input
              v-model="dateFilter"
              type="date"
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <button @click="setTodayFilter" class="px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm hover:bg-amber-200 transition-colors whitespace-nowrap">
              اليوم
            </button>
          </div>
        </div>
        <div class="flex justify-between items-center mt-3">
          <button @click="resetFilters" class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline">
            إعادة تعيين الفلاتر
          </button>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            إجمالي {{ formatNumber(displayedTransactions.length) }} حركة
          </div>
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div class="overflow-x-auto">
          <div class="overflow-y-auto" style="max-height: calc(100vh - 380px); min-height: 400px;">
            <table class="w-full min-w-[800px]">
              <thead class="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">التاريخ</th>
                  <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">النوع</th>
                  <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">المنتج</th>
                  <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">من مخزن</th>
                  <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">إلى مخزن</th>
                  <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">الكمية</th>
                  <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">المستخدم</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="tx in paginatedTransactions" :key="tx.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="px-4 py-3 text-center text-base text-gray-800 dark:text-gray-200">{{ formatDate(tx.createdAt) }}</td>
                  <td class="px-4 py-3 text-center">
                    <span :class="getTypeBadge(tx.type)" class="px-3 py-1.5 text-sm font-semibold rounded-full inline-block">
                      {{ getTypeText(tx.type) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="text-base font-semibold text-gray-900 dark:text-white">{{ tx.itemName }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ tx.itemCode }}</div>
                  </td>
                  <td class="px-4 py-3 text-center text-base text-gray-800 dark:text-gray-200">{{ getWarehouseName(tx.fromWarehouse) }}</td>
                  <td class="px-4 py-3 text-center text-base text-gray-800 dark:text-gray-200">{{ getWarehouseName(tx.toWarehouse) || tx.destination || '-' }}</td>
                  <td class="px-4 py-3 text-center text-base font-bold" :class="getQuantityClass(tx.totalDelta)">
                    {{ formatDelta(tx.totalDelta) }}
                  </td>
                  <td class="px-4 py-3 text-center text-base text-gray-800 dark:text-gray-200">{{ tx.createdBy || tx.userId || '-' }}</td>
                </tr>
                <tr v-if="displayedTransactions.length === 0">
                  <td colspan="7" class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p class="text-base">لا توجد حركات</p>
                    <p class="text-sm mt-1">حاول تعديل البحث أو الفلاتر</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Mobile Card View (similar change) -->
      <div class="lg:hidden space-y-3">
        <div v-for="tx in paginatedTransactions" :key="tx.id" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <!-- same content as before -->
        </div>
        <div v-if="displayedTransactions.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg border">
          لا توجد حركات
        </div>
      </div>

      <!-- Load More Button (only when not searching and more pages exist) -->
      <div v-if="!isSearchActive && hasMore" class="flex justify-center mt-6">
        <button
          @click="loadMore"
          :disabled="isLoadingMore"
          class="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <span v-if="isLoadingMore" class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            جاري التحميل...
          </span>
          <span v-else>تحميل المزيد</span>
        </button>
      </div>
      <div v-else-if="!isSearchActive && allTransactions.length > 0 && !hasMore" class="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
        تم تحميل جميع الحركات ({{ allTransactions.length }})
      </div>

      <!-- Search results info -->
      <div v-if="isSearchActive" class="text-center text-amber-600 dark:text-amber-400 text-sm mt-4">
        نتائج البحث: {{ displayedTransactions.length }} حركة
        <button @click="clearSearch" class="mr-2 underline">إلغاء البحث</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, debounce } from 'vue'
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
const isInitialLoading = ref(true)
const isLoadingMore = ref(false)
const isSearching = ref(false)
const currentPage = ref(1)
const pageSize = ref(50)
const totalTransactions = ref(0)

// Search state
const searchQuery = ref('')
const searchResults = ref<any[]>([])  // results from server-side search
const isSearchActive = computed(() => searchQuery.value.trim().length >= 2)

// Other filters (applied client-side on search results or loaded transactions)
const typeFilter = ref('')
const warehouseFilter = ref('')
const dateFilter = ref('')

// Computed data from store (normal paginated transactions)
const allTransactions = computed(() => inventoryStore.transactions)
const hasMore = computed(() => allTransactions.value.length < totalTransactions.value)

// The source of transactions to display (search results OR paginated loaded ones)
const sourceTransactions = computed(() => {
  if (isSearchActive.value) return searchResults.value
  return allTransactions.value
})

// Apply client-side filters (type, warehouse, date) to the source transactions
const displayedTransactions = computed(() => {
  let transactions = [...sourceTransactions.value]

  if (authStore.isWarehouseManager) {
    const accessibleIds = accessibleWarehouses.value.map(w => w.id)
    transactions = transactions.filter(tx =>
      !tx.fromWarehouse || accessibleIds.includes(tx.fromWarehouse) ||
      !tx.toWarehouse || accessibleIds.includes(tx.toWarehouse)
    )
  }

  if (typeFilter.value) transactions = transactions.filter(tx => tx.type === typeFilter.value)
  if (warehouseFilter.value) {
    transactions = transactions.filter(tx =>
      tx.fromWarehouse === warehouseFilter.value || tx.toWarehouse === warehouseFilter.value
    )
  }
  if (dateFilter.value) {
    const filterDate = new Date(dateFilter.value).toDateString()
    transactions = transactions.filter(tx => new Date(tx.createdAt).toDateString() === filterDate)
  }

  return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// Client-side pagination for displaying results (to avoid showing 200 rows at once)
const displayPage = ref(1)
const displayPageSize = ref(20)
const totalDisplayPages = computed(() => Math.ceil(displayedTransactions.value.length / displayPageSize.value))
const paginatedTransactions = computed(() => {
  const start = (displayPage.value - 1) * displayPageSize.value
  return displayedTransactions.value.slice(start, start + displayPageSize.value)
})

// Stats (based on displayedTransactions after filters)
const totalAdded = computed(() =>
  displayedTransactions.value.filter(tx => tx.type === 'ADD').reduce((sum, tx) => sum + (tx.totalDelta > 0 ? tx.totalDelta : 0), 0)
)
const totalDispatched = computed(() =>
  displayedTransactions.value.filter(tx => tx.type === 'DISPATCH').reduce((sum, tx) => sum + Math.abs(tx.totalDelta), 0)
)
const totalTransfers = computed(() => displayedTransactions.value.filter(tx => tx.type === 'TRANSFER').length)

// Accessible warehouses
const accessibleWarehouses = computed(() => {
  if (authStore.isSuperAdmin || authStore.isCompanyManager) return warehouseStore.warehouses
  if (authStore.isWarehouseManager) return warehouseStore.warehouses.filter(w => authStore.canAccessWarehouse(w.id))
  return []
})
const warehouses = computed(() => warehouseStore.warehouses)

// Helper functions (unchanged)
const formatNumber = (num: number) => num?.toLocaleString() || '0'
const formatDate = (date: Date | string) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
const formatDelta = (delta: number) => delta > 0 ? `+${delta}` : `${delta}`
const getQuantityClass = (delta: number) => delta > 0 ? 'text-green-600 dark:text-green-400' : delta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'

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

// Load more transactions (only for normal paginated mode)
const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value || isSearchActive.value) return
  isLoadingMore.value = true
  try {
    const nextPage = currentPage.value + 1
    const result = await inventoryStore.fetchTransactions(nextPage, pageSize.value, true)
    totalTransactions.value = result.total
    currentPage.value = nextPage
  } catch (error) {
    console.error('Failed to load more transactions:', error)
  } finally {
    isLoadingMore.value = false
  }
}

// Refresh / initial load (resets search and pagination)
const refreshData = async () => {
  isInitialLoading.value = true
  // Clear search
  searchQuery.value = ''
  searchResults.value = []
  currentPage.value = 1
  try {
    const result = await inventoryStore.fetchTransactions(1, pageSize.value, false)
    totalTransactions.value = result.total
  } catch (error) {
    console.error('Failed to load transactions:', error)
  } finally {
    isInitialLoading.value = false
  }
}

// Server-side search with debounce
const performSearch = debounce(async (term: string) => {
  if (!term || term.trim().length < 2) {
    searchResults.value = []
    return
  }
  isSearching.value = true
  try {
    const results = await inventoryStore.searchTransactions(term, 500) // get up to 500 matches
    searchResults.value = results
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}, 500)

// Watch searchQuery
watch(searchQuery, (newVal) => {
  if (newVal && newVal.trim().length >= 2) {
    performSearch(newVal.trim())
  } else {
    searchResults.value = []
  }
  displayPage.value = 1
})

// Clear search
const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
}

// Reset filters
const resetFilters = () => {
  typeFilter.value = ''
  warehouseFilter.value = ''
  dateFilter.value = ''
  displayPage.value = 1
  // If search is active, re-run search to refresh filtered results
  if (isSearchActive.value) {
    performSearch(searchQuery.value.trim())
  }
}

const setTodayFilter = () => {
  dateFilter.value = new Date().toISOString().split('T')[0]
  displayPage.value = 1
}

const exportToExcel = () => {
  const data = displayedTransactions.value.map(tx => ({
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

// Pagination controls for display
const nextDisplayPage = () => {
  if (displayPage.value < totalDisplayPages.value) {
    displayPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
const prevDisplayPage = () => {
  if (displayPage.value > 1) {
    displayPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await refreshData()
})
</script>

<style scoped>
thead {
  position: sticky;
  top: 0;
  z-index: 10;
}
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.dark .overflow-y-auto::-webkit-scrollbar-track {
  background: #1f2937;
}
.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
}
</style>
