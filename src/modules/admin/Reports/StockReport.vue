<template>
  <div class="w-full px-2 sm:px-4 py-4 sm:py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">تقرير المخزون</h1>
      <div class="flex gap-2 w-full sm:w-auto">
        <button @click="exportToExcel" class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-md text-sm sm:text-base">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-4" />
          </svg>
          <span class="hidden xs:inline">تصدير Excel</span>
          <span class="xs:hidden">Excel</span>
        </button>
        <button @click="generateReport" class="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-md text-sm sm:text-base">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span class="hidden xs:inline">تحديث التقرير</span>
          <span class="xs:hidden">تحديث</span>
        </button>
      </div>
    </div>

    <!-- Summary Cards - Dashboard Style (2 columns on mobile, 4 on desktop) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-xs">إجمالي الأصناف</p>
            <p class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">{{ formatNumber(summary.totalItems) }}</p>
          </div>
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-xs">إجمالي الوحدات</p>
            <p class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">{{ formatNumber(summary.totalQuantity) }}</p>
          </div>
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-xs">مخزون منخفض</p>
            <p class="text-base sm:text-lg font-bold text-yellow-600 dark:text-yellow-400 mt-1 truncate">{{ formatNumber(summary.lowStock) }}</p>
          </div>
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-xs">نفد المخزون</p>
            <p class="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 mt-1 truncate">{{ formatNumber(summary.outOfStock) }}</p>
          </div>
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters - Glass Card Style -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">من تاريخ</label>
          <input type="date" v-model="filters.dateFrom" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">إلى تاريخ</label>
          <input type="date" v-model="filters.dateTo" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المخزن</label>
          <select v-model="filters.warehouseId" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
            <option value="">جميع المخازن</option>
            <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name_ar || warehouse.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
          <select v-model="filters.status" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
            <option value="">جميع الأصناف</option>
            <option value="in_stock">متوفر</option>
            <option value="low_stock">مخزون منخفض</option>
            <option value="critical_stock">مخزون حرج</option>
            <option value="out_of_stock">نفد المخزون</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[800px]">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الصنف</th>
              <th class="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الكود</th>
              <th class="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">المخزن</th>
              <th class="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الكراتين</th>
              <th class="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">فردي</th>
              <th class="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">إجمالي الكمية</th>
              <th class="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الحالة</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in paginatedItems" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-3 sm:px-4 py-3">
                <div class="font-medium text-gray-900 dark:text-white text-sm">{{ item.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">المورد: {{ item.supplier || '—' }}</div>
              </td>
              <td class="px-3 sm:px-4 py-3">
                <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-mono">{{ item.code }}</span>
              </td>
              <td class="px-3 sm:px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ getWarehouseName(item.warehouseId) }}</td>
              <td class="px-3 sm:px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{{ formatNumber(item.cartonsCount) }} × {{ formatNumber(item.perCartonCount) }}</td>
              <td class="px-3 sm:px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{{ formatNumber(item.singleBottlesCount) }}</td>
              <td class="px-3 sm:px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">{{ formatNumber(item.remainingQuantity) }}</td>
              <td class="px-3 sm:px-4 py-3 text-center">
                <span :class="getStatusClass(item.remainingQuantity)" class="px-2 py-1 text-xs rounded-full">
                  {{ getStatusText(item.remainingQuantity) }}
                </span>
              </td>
            </tr>
            <tr v-if="paginatedItems.length === 0">
              <td colspan="7" class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
                </svg>
                <p>لا توجد أصناف</p>
                <p class="text-sm mt-1">حاول تعديل البحث أو الفلاتر</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredItems.length > itemsPerPage" class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
      <div class="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
        عرض {{ ((currentPage - 1) * itemsPerPage) + 1 }} إلى {{ Math.min(currentPage * itemsPerPage, filteredItems.length) }} من {{ formatNumber(filteredItems.length) }} صنف
      </div>
      <div class="flex gap-2 order-1 sm:order-2">
        <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm">
          السابق
        </button>
        <span class="px-3 py-1 text-gray-700 dark:text-gray-300 text-sm">صفحة {{ currentPage }} من {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm">
          التالي
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import * as XLSX from 'xlsx'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(15)

const filters = ref({
  dateFrom: '',
  dateTo: '',
  warehouseId: '',
  status: '',
})

const warehouses = computed(() => warehouseStore.warehouses)

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

// Filtered items with correct stock thresholds
const filteredItems = computed(() => {
  let items = inventoryStore.items
  
  if (filters.value.warehouseId) {
    items = items.filter(item => item.warehouseId === filters.value.warehouseId)
  }
  
  // Correct stock thresholds
  if (filters.value.status === 'in_stock') {
    items = items.filter(item => item.remainingQuantity > 500)
  } else if (filters.value.status === 'low_stock') {
    items = items.filter(item => item.remainingQuantity > 0 && item.remainingQuantity <= 50)
  } else if (filters.value.status === 'critical_stock') {
    items = items.filter(item => item.remainingQuantity > 50 && item.remainingQuantity <= 500)
  } else if (filters.value.status === 'out_of_stock') {
    items = items.filter(item => item.remainingQuantity === 0)
  }
  
  // Date filtering (if needed in future)
  if (filters.value.dateFrom && filters.value.dateTo) {
    // Would require created_at field on items
  }
  
  return items
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage.value))
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredItems.value.slice(start, end)
})

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const summary = computed(() => ({
  totalItems: filteredItems.value.length,
  totalQuantity: filteredItems.value.reduce((sum, item) => sum + item.remainingQuantity, 0),
  lowStock: filteredItems.value.filter(item => item.remainingQuantity > 0 && item.remainingQuantity <= 50).length,
  outOfStock: filteredItems.value.filter(item => item.remainingQuantity === 0).length,
}))

const getWarehouseName = (warehouseId: string) => {
  const warehouse = warehouses.value.find(w => w.id === warehouseId)
  return warehouse?.name_ar || warehouse?.name || 'غير معروف'
}

const getStatusClass = (quantity: number) => {
  if (quantity === 0) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  if (quantity <= 50) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
  if (quantity <= 500) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
  return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
}

const getStatusText = (quantity: number) => {
  if (quantity === 0) return 'نفد المخزون'
  if (quantity <= 50) return 'مخزون منخفض'
  if (quantity <= 500) return 'مخزون حرج'
  return 'متوفر'
}

const generateReport = () => {
  // Reset to first page when generating new report
  currentPage.value = 1
  console.log('Report generated with filters:', filters.value)
}

const exportToExcel = () => {
  const exportData = filteredItems.value.map(item => ({
    'الصنف': item.name,
    'الكود': item.code,
    'المخزن': getWarehouseName(item.warehouseId),
    'الكراتين': `${item.cartonsCount} × ${item.perCartonCount}`,
    'القطع الفردية': item.singleBottlesCount,
    'إجمالي الكمية': item.remainingQuantity,
    'المورد': item.supplier || '—',
    'الحالة': getStatusText(item.remainingQuantity)
  }))
  
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير المخزون')
  
  const fileName = `stock_report_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await inventoryStore.fetchItems()
})
</script>

<style scoped>
/* Responsive utilities */
@media (min-width: 480px) {
  .xs\:inline {
    display: inline;
  }
  .xs\:hidden {
    display: none;
  }
}

/* Truncate long numbers */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Table minimum width for horizontal scroll */
table {
  min-width: 800px;
}
</style>