<template>
  <div class="container mx-auto px-4 py-8" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <h1 class="text-2xl font-bold mb-6">{{ $t('inventory.transactions.title') }}</h1>
    
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('inventory.transactions.date') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('inventory.transactions.type') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('inventory.transactions.item') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('inventory.transactions.fromWarehouse') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('inventory.transactions.toWarehouse') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('inventory.transactions.quantity') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('common.user') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="tx in inventoryStore.transactions" :key="tx.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatDate(tx.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getTypeBadge(tx.type)" class="px-2 py-1 text-xs rounded-full">
                  {{ $t(`inventory.transactions.${tx.type.toLowerCase()}`) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium">{{ tx.itemName }}</div>
                <div class="text-xs text-gray-500">{{ tx.itemCode }}</div>
              </td>
              <td class="px-6 py-4 text-sm">{{ getWarehouseName(tx.fromWarehouse) }}</td>
              <td class="px-6 py-4 text-sm">{{ getWarehouseName(tx.toWarehouse) || tx.destination }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm" :class="getQuantityClass(tx.totalDelta)">
                {{ formatDelta(tx.totalDelta) }}
              </td>
              <td class="px-6 py-4 text-sm">{{ tx.createdBy }}</td>
            </tr>
            <tr v-if="inventoryStore.transactions.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
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
import { computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()

const warehouses = computed(() => warehouseStore.warehouses)

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString()
}

const formatDelta = (delta: number) => {
  return delta > 0 ? `+${delta}` : `${delta}`
}

const getQuantityClass = (delta: number) => {
  if (delta > 0) return 'text-green-600 font-semibold'
  if (delta < 0) return 'text-red-600 font-semibold'
  return ''
}

const getTypeBadge = (type: string) => {
  const badges: Record<string, string> = {
    ADD: 'bg-green-100 text-green-800',
    UPDATE: 'bg-blue-100 text-blue-800',
    DELETE: 'bg-red-100 text-red-800',
    TRANSFER: 'bg-purple-100 text-purple-800',
    DISPATCH: 'bg-yellow-100 text-yellow-800',
  }
  return badges[type] || 'bg-gray-100 text-gray-800'
}

const getWarehouseName = (warehouseId?: string) => {
  if (!warehouseId) return '-'
  const warehouse = warehouses.value.find(w => w.id === warehouseId)
  return warehouse?.name || warehouseId.slice(0, 8)
}

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await inventoryStore.fetchTransactions()
})
</script>