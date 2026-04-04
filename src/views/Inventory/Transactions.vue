<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Transaction History</h1>
    
    <div class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Item</th>
            <th>From/To</th>
            <th>Quantity</th>
            <th>New Remaining</th>
            <th>Notes</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in inventory.transactions" :key="tx.id">
            <td>{{ formatDate(tx.created_at) }}</td>
            <td>
              <span :class="getTypeBadge(tx.type)" class="badge">
                {{ tx.type }}
              </span>
            </td>
            <td>
              <div>{{ tx.item_name }}</div>
              <div class="text-xs text-gray-500">{{ tx.item_code }}</div>
            </td>
            <td>
              <div v-if="tx.from_warehouse">From: {{ getWarehouseName(tx.from_warehouse) }}</div>
              <div v-if="tx.to_warehouse">To: {{ getWarehouseName(tx.to_warehouse) }}</div>
              <div v-if="tx.destination">To: {{ tx.destination }}</div>
            </td>
            <td :class="getQuantityClass(tx.total_delta)">
              {{ formatQuantity(tx.total_delta) }}
            </td>
            <td>{{ tx.new_remaining }}</td>
            <td class="max-w-xs truncate">{{ tx.notes }}</td>
            <td>{{ tx.created_by || 'System' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'

const inventory = useInventoryStore()

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatQuantity = (delta) => {
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta}`
}

const getQuantityClass = (delta) => {
  if (delta > 0) return 'text-success font-bold'
  if (delta < 0) return 'text-error font-bold'
  return ''
}

const getTypeBadge = (type) => {
  const badges = {
    ADD: 'badge-success',
    TRANSFER: 'badge-info',
    DISPATCH: 'badge-warning',
    UPDATE: 'badge-primary',
    DELETE: 'badge-error'
  }
  return badges[type] || 'badge-ghost'
}

const getWarehouseName = (warehouseId) => {
  const w = inventory.warehouses.find(w => w.id === warehouseId)
  return w?.name || warehouseId?.slice(0, 8)
}

onMounted(async () => {
  await inventory.loadWarehouses()
  await inventory.loadTransactions()
})
</script>