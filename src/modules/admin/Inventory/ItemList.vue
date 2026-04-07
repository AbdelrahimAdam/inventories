<template>
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">الأصناف</h1>
      <div class="flex gap-2 w-full sm:w-auto">
        <button @click="exportToExcel" class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center gap-2 shadow-md">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-4" />
          </svg>
          تصدير Excel
        </button>
        <router-link to="/inventory/items/new" class="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center gap-2 shadow-md">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          إضافة صنف
        </router-link>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-3 text-center hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ formatNumber(filteredItems.length) }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-300 font-medium">إجمالي الأصناف</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-3 text-center hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ formatNumber(totalStock) }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-300 font-medium">إجمالي الوحدات</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-3 text-center hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ formatNumber(lowStockCount) }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-300 font-medium">مخزون منخفض</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-3 text-center hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ formatNumber(criticalStockCount) }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-300 font-medium">مخزون حرج</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-3 text-center hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ formatNumber(outOfStockCount) }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-300 font-medium">نفد المخزون</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            v-model="filters.search"
            placeholder="بحث بالاسم أو الكود أو المقاس..."
            class="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <select v-model="filters.warehouseId" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">جميع المخازن</option>
          <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
            {{ warehouse.name }}
          </option>
        </select>
        <select v-model="filters.status" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">جميع الحالات</option>
          <option value="in_stock">متوفر</option>
          <option value="low_stock">مخزون منخفض</option>
          <option value="critical_stock">مخزون حرج</option>
          <option value="out_of_stock">نفد المخزون</option>
        </select>
        <button @click="resetFilters" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 text-sm text-gray-700 dark:text-gray-300">
          إعادة تعيين
        </button>
      </div>
    </div>

    <!-- Items Table - NO inner scroll, let parent handle scrolling -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[800px]">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الصنف</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الكود</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">اللون</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">المقاس</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">المخزن</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الكمية</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الحالة</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in paginatedItems" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-4 py-3">
                <div class="font-semibold text-gray-900 dark:text-white">{{ item.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">المورد: {{ item.supplier || '—' }}</div>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-mono">{{ item.code }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm" :style="{ backgroundColor: item.color }"></span>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.color }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">{{ item.size || '—' }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ getWarehouseName(item.warehouseId) }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex flex-col items-center">
                  <span class="text-lg font-bold" :class="getStockTextClass(item.remainingQuantity)">
                    {{ formatNumber(item.remainingQuantity) }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatNumber(item.cartonsCount) }} × {{ formatNumber(item.perCartonCount) }} + {{ formatNumber(item.singleBottlesCount) }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="getStatusBadgeClass(item.remainingQuantity)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getStatusText(item.remainingQuantity) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <router-link :to="`/inventory/items/${item.id}`" class="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="عرض">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </router-link>
                  <router-link :to="`/inventory/items/${item.id}?edit=true`" class="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="تعديل">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </router-link>
                  <button @click="openTransferModal(item)" class="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors" title="نقل">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                  </button>
                  <button @click="openDispatchModal(item)" class="p-1.5 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors" title="صرف">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                  </button>
                  <button v-if="authStore.isSuperAdmin" @click="confirmDelete(item)" class="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="حذف">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedItems.length === 0">
              <td colspan="8" class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
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
        <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-gray-300">
          السابق
        </button>
        <span class="px-3 py-1 text-gray-700 dark:text-gray-300">صفحة {{ currentPage }} من {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-gray-300">
          التالي
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">تأكيد الحذف</h3>
        <p class="mb-6 text-gray-600 dark:text-gray-400">هل أنت متأكد من حذف الصنف "{{ itemToDelete?.name }}"؟</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-gray-300">
            إلغاء
          </button>
          <button @click="deleteItem" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 shadow-md">
            حذف
          </button>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <TransferModal 
      :is-open="showTransferModal" 
      :item="selectedTransferItem"
      @close="closeTransferModal"
      @success="() => onTransferSuccess()"
    />

    <!-- Dispatch Modal -->
    <DispatchModal 
      :is-open="showDispatchModal" 
      @close="closeDispatchModal"
      @success="() => onDispatchSuccess()"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import type { InventoryItem } from '@/types'
import TransferModal from '@/components/modals/TransferModal.vue'
import DispatchModal from '@/components/modals/DispatchModal.vue'
import * as XLSX from 'xlsx'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(20)

const filters = ref({
  search: '',
  warehouseId: '',
  status: '',
})

const showDeleteModal = ref(false)
const itemToDelete = ref<InventoryItem | null>(null)

// Transfer and Dispatch modals state
const showTransferModal = ref(false)
const showDispatchModal = ref(false)
const selectedTransferItem = ref<InventoryItem | null>(null)

const warehouses = computed(() => warehouseStore.warehouses)

// Format numbers (keeps English numerals)
const formatNumber = (num: number): string => {
  if (num === undefined || num === null) return '0'
  return num.toLocaleString()
}

// Filtered items
const filteredItems = computed(() => {
  let items = inventoryStore.items
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    items = items.filter(item => 
      item.name.toLowerCase().includes(search) || 
      item.code.toLowerCase().includes(search) ||
      (item.size && item.size.toLowerCase().includes(search))
    )
  }
  
  if (filters.value.warehouseId) {
    items = items.filter(item => item.warehouseId === filters.value.warehouseId)
  }
  
  // Stock thresholds:
  // In Stock: > 500
  // Low Stock: 1-500
  // Critical Stock: 1-250
  if (filters.value.status === 'in_stock') {
    items = items.filter(item => item.remainingQuantity > 500)
  } else if (filters.value.status === 'low_stock') {
    items = items.filter(item => item.remainingQuantity <= 500 && item.remainingQuantity > 0)
  } else if (filters.value.status === 'critical_stock') {
    items = items.filter(item => item.remainingQuantity <= 250 && item.remainingQuantity > 0)
  } else if (filters.value.status === 'out_of_stock') {
    items = items.filter(item => item.remainingQuantity === 0)
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

// Stats
const totalStock = computed(() => filteredItems.value.reduce((sum, item) => sum + item.remainingQuantity, 0))
const lowStockCount = computed(() => filteredItems.value.filter(item => item.remainingQuantity <= 500 && item.remainingQuantity > 0).length)
const criticalStockCount = computed(() => filteredItems.value.filter(item => item.remainingQuantity <= 250 && item.remainingQuantity > 0).length)
const outOfStockCount = computed(() => filteredItems.value.filter(item => item.remainingQuantity === 0).length)

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

const getWarehouseName = (warehouseId: string) => {
  const warehouse = warehouses.value.find(w => w.id === warehouseId)
  return warehouse?.name || 'غير معروف'
}

const getStockTextClass = (quantity: number) => {
  if (quantity === 0) return 'text-red-600 dark:text-red-400'
  if (quantity <= 250) return 'text-orange-600 dark:text-orange-400'
  if (quantity <= 500) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-green-600 dark:text-green-400'
}

const getStatusBadgeClass = (quantity: number) => {
  if (quantity === 0) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  if (quantity <= 250) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
  if (quantity <= 500) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
  return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
}

const getStatusText = (quantity: number) => {
  if (quantity === 0) return 'نفد المخزون'
  if (quantity <= 250) return 'مخزون حرج'
  if (quantity <= 500) return 'مخزون منخفض'
  return 'متوفر'
}

const resetFilters = () => {
  filters.value = {
    search: '',
    warehouseId: '',
    status: '',
  }
  currentPage.value = 1
}

const confirmDelete = (item: InventoryItem) => {
  itemToDelete.value = item
  showDeleteModal.value = true
}

const deleteItem = async () => {
  if (itemToDelete.value) {
    await inventoryStore.deleteItem(itemToDelete.value.id)
    showDeleteModal.value = false
    itemToDelete.value = null
    await inventoryStore.fetchItems()
  }
}

// Export to Excel
const exportToExcel = () => {
  const exportData = filteredItems.value.map(item => ({
    'الصنف': item.name,
    'الكود': item.code,
    'اللون': item.color,
    'المقاس': item.size || '—',
    'المخزن': getWarehouseName(item.warehouseId),
    'الكراتين': item.cartonsCount,
    'لكل كرتون': item.perCartonCount,
    'فردي': item.singleBottlesCount,
    'إجمالي الكمية': item.remainingQuantity,
    'المورد': item.supplier || '—',
    'الحالة': getStatusText(item.remainingQuantity)
  }))
  
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير المخزون')
  XLSX.writeFile(wb, `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Transfer and Dispatch methods
const openTransferModal = (item: InventoryItem) => {
  selectedTransferItem.value = item
  showTransferModal.value = true
}

const closeTransferModal = () => {
  showTransferModal.value = false
  selectedTransferItem.value = null
}

const openDispatchModal = (item: InventoryItem) => {
  selectedTransferItem.value = item
  showDispatchModal.value = true
}

const closeDispatchModal = () => {
  showDispatchModal.value = false
  selectedTransferItem.value = null
}

const onTransferSuccess = async () => {
  await inventoryStore.fetchItems()
}

const onDispatchSuccess = async () => {
  await inventoryStore.fetchItems()
}

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await inventoryStore.fetchItems()
})
</script>

<style scoped>
/* No custom scroll - parent handles scrolling */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
}

/* Table minimum width for horizontal scroll on mobile */
table {
  min-width: 800px;
}

/* Smooth transitions */
tbody tr {
  transition: background-color 0.2s ease;
}
</style>