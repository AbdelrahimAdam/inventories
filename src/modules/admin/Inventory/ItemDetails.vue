<template>
  <div class="container mx-auto px-4 py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b bg-gray-50">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">Item Details</h1>
          <div class="flex space-x-2">
            <router-link 
              :to="`/inventory/items/${item?.id}?edit=true`" 
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Edit Item
            </router-link>
            <router-link to="/inventory/items" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Back to List
            </router-link>
          </div>
        </div>
      </div>
      
      <div v-if="item" class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Name</h3>
            <p class="mt-1 text-lg font-semibold">{{ item.name }}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Code</h3>
            <p class="mt-1"><span class="px-2 py-1 bg-gray-100 rounded text-sm">{{ item.code }}</span></p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Color</h3>
            <div class="mt-1 flex items-center space-x-2">
              <span class="w-6 h-6 rounded-full border border-gray-300" :style="{ backgroundColor: item.color }"></span>
              <span>{{ item.color }}</span>
            </div>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Warehouse</h3>
            <p class="mt-1">{{ getWarehouseName(item.warehouseId) }}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Cartons</h3>
            <p class="mt-1">{{ item.cartonsCount }} cartons × {{ item.perCartonCount }} pieces per carton</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Single Bottles</h3>
            <p class="mt-1">{{ item.singleBottlesCount }} pieces</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Total Quantity</h3>
            <p class="mt-1 text-2xl font-bold text-green-600">{{ item.remainingQuantity }} units</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Status</h3>
            <p class="mt-1">
              <span :class="getStatusClass(item.remainingQuantity)" class="px-2 py-1 text-xs rounded-full">
                {{ getStatusText(item.remainingQuantity) }}
              </span>
            </p>
          </div>
          
          <div v-if="item.supplier">
            <h3 class="text-sm font-medium text-gray-500">Supplier</h3>
            <p class="mt-1">{{ item.supplier }}</p>
          </div>
          
          <div v-if="item.location">
            <h3 class="text-sm font-medium text-gray-500">Location</h3>
            <p class="mt-1">{{ item.location }}</p>
          </div>
          
          <div v-if="item.createdAt" class="md:col-span-2">
            <h3 class="text-sm font-medium text-gray-500">Created At</h3>
            <p class="mt-1">{{ formatDate(item.createdAt) }}</p>
          </div>
          
          <div v-if="item.updatedAt" class="md:col-span-2">
            <h3 class="text-sm font-medium text-gray-500">Last Updated</h3>
            <p class="mt-1">{{ formatDate(item.updatedAt) }}</p>
          </div>
          
          <div v-if="item.notes" class="md:col-span-2">
            <h3 class="text-sm font-medium text-gray-500">Notes</h3>
            <p class="mt-1 whitespace-pre-wrap">{{ item.notes }}</p>
          </div>
        </div>
      </div>
      
      <div v-else class="p-12 text-center text-gray-500">
        <div class="flex flex-col items-center">
          <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Item not found</p>
          <router-link to="/inventory/items" class="mt-4 text-green-600 hover:underline">
            Back to Items List
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import type { InventoryItem } from '@/types'

const route = useRoute()
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()

const item = ref<InventoryItem | null>(null)

const warehouses = computed(() => warehouseStore.warehouses)

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

const formatDate = (date: Date | string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString()
}

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await inventoryStore.fetchItems()
  
  const itemId = route.params.id as string
  if (itemId) {
    item.value = inventoryStore.items.find(i => i.id === itemId) || null
  }
})
</script>