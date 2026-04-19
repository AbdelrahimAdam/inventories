<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Header Section (unchanged) -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white">
      <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold mb-2">تقرير المخزون</h1>
            <p class="text-blue-100 dark:text-blue-200 opacity-90">تحليل كامل للأصناف والكميات والموردين</p>
          </div>
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div class="flex items-center gap-4 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-xl px-4 py-3">
              <div class="text-center">
                <div class="text-2xl font-bold">{{ currentTime }}</div>
                <div class="text-sm opacity-90">{{ currentDate }}</div>
              </div>
              <div class="h-10 w-px bg-white/20"></div>
              <div class="text-center">
                <div class="text-sm opacity-90">آخر تحديث</div>
                <div class="font-medium">{{ formatRelativeTime(lastUpdated) }}</div>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="exportToExcel" class="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl transition-all duration-200 inline-flex items-center gap-2 backdrop-blur-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-4" /></svg>
                <span class="hidden sm:inline">تصدير Excel</span>
              </button>
              <button @click="refreshReport" class="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl transition-all duration-200 inline-flex items-center gap-2 backdrop-blur-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span class="hidden sm:inline">تحديث</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
      <!-- Loading Overlay (using store's isLoading) -->
      <div v-if="inventoryStore.isLoading" class="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-80 z-50 flex flex-col items-center justify-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-lg font-semibold">جاري تحميل التقرير...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="inventoryStore.error" class="flex flex-col items-center justify-center py-12">
        <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <svg class="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.195 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        </div>
        <h2 class="text-xl font-bold mb-2">حدث خطأ</h2>
        <p class="text-gray-600 mb-4">{{ inventoryStore.error }}</p>
        <button @click="refreshReport" class="px-6 py-2 bg-blue-600 text-white rounded-lg">إعادة المحاولة</button>
      </div>

      <!-- Report Content (when data is loaded) -->
      <template v-else>
        <!-- KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border">
            <div class="flex justify-between items-start">
              <div><p class="text-sm text-gray-500">إجمالي الأصناف</p><p class="text-2xl font-bold">{{ formatNumber(summary.totalItems) }}</p></div>
              <div class="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center"><svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>
            </div>
            <div class="mt-2 text-xs text-gray-500">المتوسط: {{ avgQuantityPerItem }} وحدة/صنف</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border">
            <div class="flex justify-between items-start">
              <div><p class="text-sm text-gray-500">إجمالي الوحدات</p><p class="text-2xl font-bold">{{ formatNumber(summary.totalQuantity) }}</p></div>
              <div class="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center"><svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            </div>
            <div class="mt-2 text-xs text-gray-500">كراتين: {{ formatNumber(totalCartonsFromItems) }} | فردي: {{ formatNumber(totalSinglesFromItems) }}</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border">
            <div class="flex justify-between items-start">
              <div><p class="text-sm text-gray-500">مخزون منخفض (&le;50)</p><p class="text-2xl font-bold text-orange-600">{{ formatNumber(summary.lowStock) }}</p></div>
              <div class="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center"><svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
            </div>
            <div class="mt-2 text-xs text-gray-500">نسبة {{ lowStockPercentage }}% من الأصناف</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border">
            <div class="flex justify-between items-start">
              <div><p class="text-sm text-gray-500">نفد المخزون</p><p class="text-2xl font-bold text-red-600">{{ formatNumber(summary.outOfStock) }}</p></div>
              <div class="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center"><svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            </div>
            <div class="mt-2 text-xs text-gray-500">نسبة {{ outOfStockPercentage }}% من الأصناف</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border">
            <div class="flex justify-between items-start">
              <div><p class="text-sm text-gray-500">القيمة التقديرية</p><p class="text-2xl font-bold text-purple-600">{{ formatNumber(estimatedTotalValue) }} ج</p></div>
              <div class="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center"><svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            </div>
            <div class="mt-2 text-xs text-gray-500">تقديري (25 ج/وحدة)</div>
          </div>
        </div>

        <!-- Advanced Filters with Debounced Search -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 mb-8 border">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">بحث (اسم/كود)</label>
              <input type="text" v-model="searchInput" @input="onSearchInput" placeholder="اسم الصنف أو الكود..." class="w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المخزن</label>
              <select v-model="filters.warehouseId" class="w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700">
                <option value="">جميع المخازن</option>
                <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name_ar || w.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">حالة المخزون</label>
              <select v-model="filters.status" class="w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700">
                <option value="">الكل</option>
                <option value="in_stock">متوفر (&gt;500)</option>
                <option value="critical_stock">حرج (51-500)</option>
                <option value="low_stock">منخفض (1-50)</option>
                <option value="out_of_stock">نفد (0)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المورد</label>
              <select v-model="filters.supplier" class="w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700">
                <option value="">جميع الموردين</option>
                <option v-for="sup in uniqueSuppliers" :key="sup" :value="sup">{{ sup }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Table with Fixed Header and Scrollable Body + v-memo -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border overflow-hidden">
          <div class="relative overflow-x-auto">
            <div class="max-h-[500px] overflow-y-auto relative">
              <table class="w-full min-w-[1000px]">
                <thead class="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700 shadow-sm">
                  <tr>
                    <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b">الصنف</th>
                    <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b">الكود</th>
                    <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b">المخزن</th>
                    <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b">الكراتين</th>
                    <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b">فردي</th>
                    <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b">إجمالي الكمية</th>
                    <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b">الحالة</th>
                    <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b">المورد</th>
                    <th class="px-4 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b">آخر تحديث</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr 
                    v-for="item in paginatedItems" 
                    :key="item.id" 
                    v-memo="[item.remainingQuantity, item.name, item.code, item.supplier]"
                    class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <td class="px-4 py-3 text-center font-medium">{{ item.name }}</td>
                    <td class="px-4 py-3 text-center"><span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{{ item.code }}</span></td>
                    <td class="px-4 py-3 text-center">{{ getWarehouseName(item.warehouseId) }}</td>
                    <td class="px-4 py-3 text-center">{{ formatNumber(item.cartonsCount) }} × {{ formatNumber(item.perCartonCount) }}</td>
                    <td class="px-4 py-3 text-center">{{ formatNumber(item.singleBottlesCount) }}</td>
                    <td class="px-4 py-3 text-center font-bold">{{ formatNumber(item.remainingQuantity) }}</td>
                    <td class="px-4 py-3 text-center"><span :class="getStatusClass(item.remainingQuantity)" class="px-2 py-1 text-xs rounded-full">{{ getStatusText(item.remainingQuantity) }}</span></td>
                    <td class="px-4 py-3 text-center">{{ item.supplier || '—' }}</td>
                    <td class="px-4 py-3 text-center text-sm text-gray-500">{{ formatDate(item.updatedAt) }}</td>
                  </tr>
                  <tr v-if="paginatedItems.length === 0">
                    <td colspan="9" class="px-4 py-12 text-center text-gray-500">لا توجد أصناف تطابق المعايير</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- Pagination -->
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-4 border-t bg-gray-50 dark:bg-gray-700/30">
            <div class="text-sm text-gray-600">عرض {{ ((currentPage-1)*itemsPerPage)+1 }} إلى {{ Math.min(currentPage*itemsPerPage, filteredItems.length) }} من {{ formatNumber(filteredItems.length) }} صنف</div>
            <div class="flex gap-2">
              <button @click="prevPage" :disabled="currentPage===1" class="px-4 py-2 border rounded-xl disabled:opacity-40 hover:bg-gray-100">السابق</button>
              <span class="px-4 py-2">صفحة {{ currentPage }} من {{ totalPages }}</span>
              <button @click="nextPage" :disabled="currentPage===totalPages" class="px-4 py-2 border rounded-xl disabled:opacity-40 hover:bg-gray-100">التالي</button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import * as XLSX from 'xlsx'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()

// UI state
const currentTime = ref('')
const currentDate = ref('')
const lastUpdated = ref(new Date())

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(15)

// Filters
const searchInput = ref('')
const searchDebounced = ref('')
let debounceTimer: any = null

const filters = ref({
  warehouseId: '',
  status: '',
  supplier: '',
})

// Warehouses
const warehouses = computed(() => warehouseStore.warehouses || [])

// Unique suppliers from inventory store items
const uniqueSuppliers = computed(() => {
  const suppliers = new Set<string>()
  inventoryStore.items.forEach(item => {
    if (item.supplier) suppliers.add(item.supplier)
  })
  return Array.from(suppliers).sort()
})

// Filtered items (client-side filtering)
const filteredItems = computed(() => {
  let items = inventoryStore.items

  if (searchDebounced.value) {
    const searchLower = searchDebounced.value.toLowerCase()
    items = items.filter(item => 
      item.name.toLowerCase().includes(searchLower) || 
      item.code.toLowerCase().includes(searchLower)
    )
  }

  if (filters.value.warehouseId) {
    items = items.filter(item => item.warehouseId === filters.value.warehouseId)
  }

  if (filters.value.supplier) {
    items = items.filter(item => item.supplier === filters.value.supplier)
  }

  if (filters.value.status === 'in_stock') {
    items = items.filter(item => item.remainingQuantity > 500)
  } else if (filters.value.status === 'critical_stock') {
    items = items.filter(item => item.remainingQuantity > 50 && item.remainingQuantity <= 500)
  } else if (filters.value.status === 'low_stock') {
    items = items.filter(item => item.remainingQuantity > 0 && item.remainingQuantity <= 50)
  } else if (filters.value.status === 'out_of_stock') {
    items = items.filter(item => item.remainingQuantity === 0)
  }

  return items
})

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage.value))
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredItems.value.slice(start, end)
})

const prevPage = () => { if (currentPage.value > 1) { currentPage.value--; window.scrollTo({ top: 0, behavior: 'smooth' }) } }
const nextPage = () => { if (currentPage.value < totalPages.value) { currentPage.value++; window.scrollTo({ top: 0, behavior: 'smooth' }) } }

// Summary stats
const summary = computed(() => ({
  totalItems: filteredItems.value.length,
  totalQuantity: filteredItems.value.reduce((sum, i) => sum + (i.remainingQuantity || 0), 0),
  lowStock: filteredItems.value.filter(i => i.remainingQuantity > 0 && i.remainingQuantity <= 50).length,
  outOfStock: filteredItems.value.filter(i => i.remainingQuantity === 0).length,
}))

const lowStockPercentage = computed(() => summary.value.totalItems ? Math.round((summary.value.lowStock / summary.value.totalItems) * 100) : 0)
const outOfStockPercentage = computed(() => summary.value.totalItems ? Math.round((summary.value.outOfStock / summary.value.totalItems) * 100) : 0)
const avgQuantityPerItem = computed(() => summary.value.totalItems ? Math.round(summary.value.totalQuantity / summary.value.totalItems) : 0)
const estimatedTotalValue = computed(() => summary.value.totalQuantity * 25)
const totalCartonsFromItems = computed(() => filteredItems.value.reduce((sum, i) => sum + ((i.cartonsCount || 0) * (i.perCartonCount || 0)), 0))
const totalSinglesFromItems = computed(() => filteredItems.value.reduce((sum, i) => sum + (i.singleBottlesCount || 0), 0))

// Helpers
const formatNumber = (num: number) => num?.toLocaleString() || '0'
const getWarehouseName = (id: string) => {
  const w = warehouses.value.find(w => w.id === id)
  return w?.name_ar || w?.name || 'غير معروف'
}
const getStatusClass = (qty: number) => {
  if (qty === 0) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  if (qty <= 50) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
  if (qty <= 500) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
}
const getStatusText = (qty: number) => {
  if (qty === 0) return 'نفد'
  if (qty <= 50) return 'منخفض'
  if (qty <= 500) return 'حرج'
  return 'متوفر'
}
const formatDate = (date: Date | string | undefined) => {
  if (!date) return '—'
  try {
    const d = new Date(date)
    return d.toLocaleDateString('ar-EG')
  } catch { return '—' }
}
const formatRelativeTime = (date: Date) => {
  const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000)
  if (diff < 1) return 'الآن'
  if (diff < 60) return `منذ ${diff} دقيقة`
  if (diff < 1440) return `منذ ${Math.floor(diff/60)} ساعة`
  return `منذ ${Math.floor(diff/1440)} يوم`
}
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })
  currentDate.value = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

// Debounced search handler
const onSearchInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  searchInput.value = value
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    searchDebounced.value = value
  }, 300)
}

// Export to Excel
const exportToExcel = () => {
  const data = filteredItems.value.map(item => ({
    'الصنف': item.name,
    'الكود': item.code,
    'المخزن': getWarehouseName(item.warehouseId),
    'الكراتين': `${item.cartonsCount} × ${item.perCartonCount}`,
    'فردي': item.singleBottlesCount,
    'إجمالي الكمية': item.remainingQuantity,
    'الحالة': getStatusText(item.remainingQuantity),
    'المورد': item.supplier || '—',
    'آخر تحديث': formatDate(item.updatedAt)
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير المخزون')
  XLSX.writeFile(wb, `stock_report_${new Date().toISOString().slice(0,10)}.xlsx`)
}

// Refresh report (manual refresh)
const refreshReport = async () => {
  try {
    // Force a fresh fetch regardless of cache
    await inventoryStore.fetchItems()
    if (warehouseStore.fetchWarehouses) await warehouseStore.fetchWarehouses()
    lastUpdated.value = new Date()
    currentPage.value = 1
  } catch (e: any) {
    console.error('Refresh error:', e)
  }
}

// Load data only if store is empty
const loadData = async () => {
  try {
    // Only fetch if we have no items (first load)
    if (inventoryStore.items.length === 0) {
      await inventoryStore.fetchItems()
    }
    if (warehouseStore.warehouses?.length === 0 && warehouseStore.fetchWarehouses) {
      await warehouseStore.fetchWarehouses()
    }
    lastUpdated.value = new Date()
  } catch (e: any) {
    console.error('Load error:', e)
  }
}

// Reset page when filters change
watch([searchDebounced, () => filters.value.warehouseId, () => filters.value.status, () => filters.value.supplier], () => {
  currentPage.value = 1
})

onMounted(() => {
  updateTime()
  const interval = setInterval(updateTime, 60000)
  loadData()
  onUnmounted(() => clearInterval(interval))
})
</script>
<style scoped>
.max-h-\[500px\] {
  max-height: 500px;
}
.sticky {
  position: sticky;
}
thead.sticky {
  top: 0;
  z-index: 10;
}
th, td {
  text-align: center;
  vertical-align: middle;
}
</style>
