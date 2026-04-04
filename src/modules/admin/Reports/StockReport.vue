<template>
  <div class="container mx-auto px-4 py-8" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <h1 class="text-2xl font-bold mb-6">{{ $t('reports.stock.title') }}</h1>
    
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('reports.stock.dateRange') }}</label>
          <input type="date" v-model="filters.dateFrom" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
          <input type="date" v-model="filters.dateTo" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('reports.stock.warehouse') }}</label>
          <select v-model="filters.warehouseId" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">{{ $t('inventory.items.allWarehouses') }}</option>
            <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('reports.stock.status') }}</label>
          <select v-model="filters.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">{{ $t('common.all') }}</option>
            <option value="in_stock">{{ $t('inventory.items.inStock') }}</option>
            <option value="low_stock">{{ $t('inventory.items.lowStock') }}</option>
            <option value="out_of_stock">{{ $t('inventory.items.outOfStock') }}</option>
          </select>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button @click="generateReport" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
          {{ $t('reports.stock.generate') }}
        </button>
        <button @click="exportToExcel" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          {{ $t('reports.stock.export') }}
        </button>
      </div>
    </div>
    
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm">{{ $t('dashboard.totalItems') }}</p>
        <p class="text-2xl font-bold">{{ summary.totalItems }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm">{{ $t('dashboard.totalQuantity') }}</p>
        <p class="text-2xl font-bold">{{ summary.totalQuantity }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm">{{ $t('dashboard.lowStock') }}</p>
        <p class="text-2xl font-bold text-yellow-600">{{ summary.lowStock }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-gray-600 text-sm">{{ $t('dashboard.outOfStock') }}</p>
        <p class="text-2xl font-bold text-red-600">{{ summary.outOfStock }}</p>
      </div>
    </div>
    
    <!-- Items Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('inventory.items.name') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('inventory.items.code') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('inventory.items.warehouse') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('inventory.items.totalQuantity') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('common.status') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">{{ item.name }}</td>
              <td class="px-6 py-4"><span class="px-2 py-1 bg-gray-100 rounded text-sm">{{ item.code }}</span></td>
              <td class="px-6 py-4">{{ getWarehouseName(item.warehouseId) }}</td>
              <td class="px-6 py-4 font-semibold">{{ item.remainingQuantity }}</td>
              <td class="px-6 py-4">
                <span :class="getStatusClass(item.remainingQuantity)" class="px-2 py-1 text-xs rounded-full">
                  {{ getStatusText(item.remainingQuantity) }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredItems.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                {{ $t('common.noData') }}
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

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()

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
  return warehouse?.name || 'Unknown'
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
}

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await inventoryStore.fetchItems()
})
</script>