<template>
  <div class="container mx-auto px-4 py-8" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b bg-gray-50">
        <h1 class="text-2xl font-bold">{{ $t('inventory.items.itemDetails') }}</h1>
      </div>
      
      <div v-if="item" class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500">{{ $t('inventory.items.name') }}</h3>
            <p class="mt-1 text-lg">{{ item.name }}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">{{ $t('inventory.items.code') }}</h3>
            <p class="mt-1"><span class="px-2 py-1 bg-gray-100 rounded">{{ item.code }}</span></p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">{{ $t('inventory.items.color') }}</h3>
            <div class="mt-1 flex items-center space-x-2">
              <span class="w-6 h-6 rounded-full" :style="{ backgroundColor: item.color }"></span>
              <span>{{ item.color }}</span>
            </div>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">{{ $t('inventory.items.warehouse') }}</h3>
            <p class="mt-1">{{ getWarehouseName(item.warehouseId) }}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">{{ $t('inventory.items.cartons') }}</h3>
            <p class="mt-1">{{ item.cartonsCount }} × {{ item.perCartonCount }}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">{{ $t('inventory.items.singles') }}</h3>
            <p class="mt-1">{{ item.singleBottlesCount }}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">{{ $t('inventory.items.totalQuantity') }}</h3>
            <p class="mt-1 text-2xl font-bold text-primary">{{ item.remainingQuantity }}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">{{ $t('common.status') }}</h3>
            <p class="mt-1">
              <span :class="getStatusClass(item.remainingQuantity)" class="px-2 py-1 text-xs rounded-full">
                {{ getStatusText(item.remainingQuantity) }}
              </span>
            </p>
          </div>
          
          <div v-if="item.supplier">
            <h3 class="text-sm font-medium text-gray-500">{{ $t('inventory.items.supplier') }}</h3>
            <p class="mt-1">{{ item.supplier }}</p>
          </div>
          
          <div v-if="item.location">
            <h3 class="text-sm font-medium text-gray-500">{{ $t('inventory.items.location') }}</h3>
            <p class="mt-1">{{ item.location }}</p>
          </div>
          
          <div v-if="item.notes" class="md:col-span-2">
            <h3 class="text-sm font-medium text-gray-500">{{ $t('inventory.items.notes') }}</h3>
            <p class="mt-1">{{ item.notes }}</p>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-8 pt-6 border-t">
          <router-link to="/inventory/items" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
            {{ $t('common.back') }}
          </router-link>
          <router-link :to="`/inventory/items/${item.id}?edit=true`" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
            {{ $t('common.edit') }}
          </router-link>
        </div>
      </div>
      
      <div v-else class="p-12 text-center text-gray-500">
        {{ $t('common.loading') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import type { InventoryItem } from '@/types'

const route = useRoute()
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()

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

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await inventoryStore.fetchItems()
  
  const itemId = route.params.id as string
  item.value = inventoryStore.items.find(i => i.id === itemId) || null
})
</script>