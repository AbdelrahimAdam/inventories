<template>
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">الحركات</h1>
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

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">إجمالي الحركات</p>
        <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(filteredTransactions.length) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">إجمالي الإضافات</p>
        <p class="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{{ formatNumber(totalAdded) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">إجمالي الصرف</p>
        <p class="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{{ formatNumber(totalDispatched) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">إجمالي التحويلات</p>
        <p class="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{{ formatNumber(totalTransfers) }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 transition-colors duration-200 border border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث بالمنتج أو الكود أو المستخدم..."
            class="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
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
        <button @click="resetFilters" class="text-sm text-gray-500 hover:text-gray-700 underline">
          إعادة تعيين الفلاتر
        </button>
        <div class="text-xs text-gray-400">
          إجمالي {{ formatNumber(filteredTransactions.length) }} حركة
        </div>
      </div>
    </div>

    <!-- Desktop Table View -->
    <div class="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
      <div class="overflow-x-auto">
        <div class="overflow-y-auto" style="max-height: calc(100vh - 380px); min-height: 400px;">
          <table class="w-full min-w-[800px]">
            <thead class="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المنتج</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">من مخزن</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إلى مخزن</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الكمية</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستخدم</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="tx in paginatedTransactions" :key="tx.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{{ formatDate(tx.createdAt) }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="getTypeBadge(tx.type)" class="px-2 py-1 text-xs rounded-full">
                    {{ getTypeText(tx.type) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ tx.itemName }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ tx.itemCode }}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ getWarehouseName(tx.fromWarehouse) }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ getWarehouseName(tx.toWarehouse) || tx.destination || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm" :class="getQuantityClass(tx.totalDelta)">
                  {{ formatDelta(tx.totalDelta) }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ tx.createdBy || tx.userId || '-' }}</td>
              </tr>
              <tr v-if="filteredTransactions.length === 0">
                <td colspan="7" class="px-4 py-12 text-center text-gray-500">
                  <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>لا توجد حركات</p>
                  <p class="text-sm mt-1">حاول تعديل البحث أو الفلاتر</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Mobile Card View -->
    <div class="lg:hidden space-y-3">
      <div v-for="tx in paginatedTransactions" :key="tx.id" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-start mb-3">
          <div>
            <div class="font-medium text-gray-900 dark:text-white">{{ tx.itemName }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ tx.itemCode }}</div>
          </div>
          <span :class="getTypeBadge(tx.type)" class="px-2 py-1 text-xs rounded-full">{{ getTypeText(tx.type) }}</span>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm mb-3">
          <div><span class="text-gray-500">التاريخ:</span> <span class="text-gray-700 dark:text-gray-300">{{ formatDate(tx.createdAt) }}</span></div>
          <div><span class="text-gray-500">الكمية:</span> <span :class="getQuantityClass(tx.totalDelta)" class="font-semibold">{{ formatDelta(tx.totalDelta) }}</span></div>
          <div><span class="text-gray-500">من:</span> <span class="text-gray-700 dark:text-gray-300">{{ getWarehouseName(tx.fromWarehouse) || '-' }}</span></div>
          <div><span class="text-gray-500">إلى:</span> <span class="text-gray-700 dark:text-gray-300">{{ getWarehouseName(tx.toWarehouse) || tx.destination || '-' }}</span></div>
          <div class="col-span-2"><span class="text-gray-500">المستخدم:</span> <span class="text-gray-700 dark:text-gray-300">{{ tx.createdBy || tx.userId || '-' }}</span></div>
        </div>
      </div>
      <div v-if="filteredTransactions.length === 0" class="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-lg border">
        لا توجد حركات
      </div>
    </div>

    <!-- Pagination / Load More -->
    <div v-if="filteredTransactions.length > itemsPerPage" class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
      <div class="text-sm text-gray-600 order-2 sm:order-1">
        عرض {{ ((currentPage - 1) * itemsPerPage) + 1 }} إلى {{ Math.min(currentPage * itemsPerPage, filteredTransactions.length) }} من {{ formatNumber(filteredTransactions.length) }} حركة
      </div>
      <div class="flex gap-2 order-1 sm:order-2">
        <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm">السابق</button>
        <span class="px-3 py-1 text-sm">صفحة {{ currentPage }} من {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm">التالي</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import * as XLSX from 'xlsx'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Filters
const searchQuery = ref('')
const typeFilter = ref('')
const warehouseFilter = ref('')
const dateFilter = ref('')

// Set default filter to today
const setTodayFilter = () => {
  dateFilter.value = new Date().toISOString().split('T')[0]
}

// Accessible warehouses based on user role
const accessibleWarehouses = computed(() => {
  if (authStore.isSuperAdmin || authStore.isCompanyManager) return warehouseStore.warehouses
  if (authStore.isWarehouseManager) return warehouseStore.warehouses.filter(w => authStore.canAccessWarehouse(w.id))
  return []
})

const warehouses = computed(() => warehouseStore.warehouses)

// All transactions from store (no limit)
const allTransactions = computed(() => inventoryStore.transactions)

// Filtered transactions
const filteredTransactions = computed(() => {
  let transactions = [...allTransactions.value]
  
  // Warehouse manager access filter
  if (authStore.isWarehouseManager) {
    const accessibleIds = accessibleWarehouses.value.map(w => w.id)
    transactions = transactions.filter(tx =>
      !tx.fromWarehouse || accessibleIds.includes(tx.fromWarehouse) ||
      !tx.toWarehouse || accessibleIds.includes(tx.toWarehouse)
    )
  }
  
  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    transactions = transactions.filter(tx =>
      tx.itemName?.toLowerCase().includes(q) ||
      tx.itemCode?.toLowerCase().includes(q) ||
      tx.createdBy?.toLowerCase().includes(q) ||
      tx.userId?.toLowerCase().includes(q)
    )
  }
  
  // Type filter
  if (typeFilter.value) transactions = transactions.filter(tx => tx.type === typeFilter.value)
  
  // Warehouse filter (from or to)
  if (warehouseFilter.value) {
    transactions = transactions.filter(tx =>
      tx.fromWarehouse === warehouseFilter.value || tx.toWarehouse === warehouseFilter.value
    )
  }
  
  // Date filter
  if (dateFilter.value) {
    const filterDate = new Date(dateFilter.value).toDateString()
    transactions = transactions.filter(tx => new Date(tx.createdAt).toDateString() === filterDate)
  }
  
  // Sort by date descending (newest first)
  return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// Stats
const totalAdded = computed(() =>
  filteredTransactions.value.filter(tx => tx.type === 'ADD').reduce((sum, tx) => sum + (tx.totalDelta > 0 ? tx.totalDelta : 0), 0)
)
const totalDispatched = computed(() =>
  filteredTransactions.value.filter(tx => tx.type === 'DISPATCH').reduce((sum, tx) => sum + Math.abs(tx.totalDelta), 0)
)
const totalTransfers = computed(() => filteredTransactions.value.filter(tx => tx.type === 'TRANSFER').length)

// Pagination
const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / itemsPerPage.value))
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredTransactions.value.slice(start, start + itemsPerPage.value)
})

const prevPage = () => { if (currentPage.value > 1) { currentPage.value--; window.scrollTo({ top: 0, behavior: 'smooth' }) } }
const nextPage = () => { if (currentPage.value < totalPages.value) { currentPage.value++; window.scrollTo({ top: 0, behavior: 'smooth' }) } }

const resetFilters = () => {
  searchQuery.value = ''
  typeFilter.value = ''
  warehouseFilter.value = ''
  dateFilter.value = ''
  currentPage.value = 1
}

const refreshData = async () => {
  await inventoryStore.fetchTransactions(500, 0) // fetch more transactions
}

const formatNumber = (num: number) => num?.toLocaleString() || '0'
const formatDate = (date: Date | string) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
const formatDelta = (delta: number) => delta > 0 ? `+${delta}` : `${delta}`
const getQuantityClass = (delta: number) => delta > 0 ? 'text-green-600 font-semibold' : delta < 0 ? 'text-red-600 font-semibold' : 'text-gray-600'

const getTypeBadge = (type: string) => {
  const badges: Record<string, string> = {
    ADD: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    TRANSFER: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    DISPATCH: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  }
  return badges[type] || 'bg-gray-100 text-gray-800'
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
  await warehouseStore.fetchWarehouses()
  await inventoryStore.fetchTransactions(500) // fetch up to 500 transactions (or remove limit)
  setTodayFilter() // default to today
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
