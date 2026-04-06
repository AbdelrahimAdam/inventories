<template>
  <div class="container mx-auto px-4 py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <h1 class="text-2xl font-bold mb-6">Stock Report</h1>
    
    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <input type="date" v-model="filters.dateFrom" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
          <input type="date" v-model="filters.dateTo" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Warehouse</label>
          <select v-model="filters.warehouseId" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">All Warehouses</option>
            <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name_ar || warehouse.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select v-model="filters.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">All Items</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 mt-4">
        <button @click="generateReport" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          Generate Report
        </button>
        <button @click="exportToExcel" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Export to Excel
        </button>
      </div>
    </div>
    
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm">Total Items</p>
        <p class="text-2xl font-bold">{{ summary.totalItems }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm">Total Quantity</p>
        <p class="text-2xl font-bold">{{ summary.totalQuantity }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm">Low Stock</p>
        <p class="text-2xl font-bold text-yellow-600">{{ summary.lowStock }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm">Out of Stock</p>
        <p class="text-2xl font-bold text-red-600">{{ summary.outOfStock }}</p>
      </div>
    </div>
    
    <!-- Items Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cartons</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Singles</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Qty</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap font-medium">{{ item.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 bg-gray-100 rounded text-sm">{{ item.code }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">{{ getWarehouseName(item.warehouseId) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ item.cartonsCount }} × {{ item.perCartonCount }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ item.singleBottlesCount }}</td>
              <td class="px-6 py-4 whitespace-nowrap font-semibold">{{ item.remainingQuantity }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(item.remainingQuantity)" class="px-2 py-1 text-xs rounded-full">
                  {{ getStatusText(item.remainingQuantity) }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredItems.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                No items found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()

const filters = ref({
  dateFrom: '',
  dateTo: '',
  warehouseId: '',
  status: '',
})

const warehouses = computed(() => warehouseStore.warehouses)

const filteredItems = computed(() => {
  let items = inventoryStore.items
  
  if (filters.value.warehouseId) {
    items = items.filter(item => item.warehouseId === filters.value.warehouseId)
  }
  
  if (filters.value.status === 'in_stock') {
    items = items.filter(item => item.remainingQuantity > 10)
  } else if (filters.value.status === 'low_stock') {
    items = items.filter(item => item.remainingQuantity <= 10 && item.remainingQuantity > 0)
  } else if (filters.value.status === 'out_of_stock') {
    items = items.filter(item => item.remainingQuantity === 0)
  }
  
  // Date filtering would require created_at field on items
  // Add if needed
  
  return items
})

const summary = computed(() => ({
  totalItems: filteredItems.value.length,
  totalQuantity: filteredItems.value.reduce((sum, item) => sum + item.remainingQuantity, 0),
  lowStock: filteredItems.value.filter(item => item.remainingQuantity <= 10 && item.remainingQuantity > 0).length,
  outOfStock: filteredItems.value.filter(item => item.remainingQuantity === 0).length,
}))

const getWarehouseName = (warehouseId: string) => {
  const warehouse = warehouses.value.find(w => w.id === warehouseId)
  return warehouse?.name_ar || warehouse?.name || 'Unknown'
}

const getStatusClass = (quantity: number) => {
  if (quantity === 0) return 'bg-red-100 text-red-800'
  if (quantity < 10) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const getStatusText = (quantity: number) => {
  if (quantity === 0) return 'Out of Stock'
  if (quantity < 10) return 'Low Stock'
  return 'In Stock'
}

const generateReport = () => {
  // Report already filters reactively
  console.log('Report generated with filters:', filters.value)
}

const exportToExcel = () => {
  // Implement Excel export
  console.log('Exporting to Excel...')
  alert('Export to Excel feature coming soon!')
}

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await inventoryStore.fetchItems()
})
</script>