<template>
  <div class="space-y-6">
    <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white drop-shadow-sm">Dashboard</h1>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      <!-- Total Items Card -->
      <GlassCard :hoverable="true" class="p-4 sm:p-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-gray-700 dark:text-gray-200 text-xs sm:text-sm truncate font-semibold">Total Items</p>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white drop-shadow-sm">{{ formatNumber(inventoryStore.totalItems) }}</p>
          </div>
          <div class="bg-blue-100/80 dark:bg-blue-900/40 rounded-full p-2 sm:p-3 ml-2 flex-shrink-0 backdrop-blur-sm">
            <svg class="w-4 h-4 sm:w-6 sm:h-6 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </GlassCard>

      <!-- Total Quantity Card -->
      <GlassCard :hoverable="true" class="p-4 sm:p-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-gray-700 dark:text-gray-200 text-xs sm:text-sm truncate font-semibold">Total Quantity</p>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white drop-shadow-sm">{{ formatNumber(inventoryStore.totalQuantity) }}</p>
          </div>
          <div class="bg-green-100/80 dark:bg-green-900/40 rounded-full p-2 sm:p-3 ml-2 flex-shrink-0 backdrop-blur-sm">
            <svg class="w-4 h-4 sm:w-6 sm:h-6 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </GlassCard>

      <!-- Low Stock Card -->
      <GlassCard :hoverable="true" class="p-4 sm:p-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-gray-700 dark:text-gray-200 text-xs sm:text-sm truncate font-semibold">Low Stock</p>
            <p class="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400 drop-shadow-sm">{{ formatNumber(inventoryStore.lowStockItems.length) }}</p>
          </div>
          <div class="bg-yellow-100/80 dark:bg-yellow-900/40 rounded-full p-2 sm:p-3 ml-2 flex-shrink-0 backdrop-blur-sm">
            <svg class="w-4 h-4 sm:w-6 sm:h-6 text-yellow-700 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </GlassCard>

      <!-- Out of Stock Card -->
      <GlassCard :hoverable="true" class="p-4 sm:p-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-gray-700 dark:text-gray-200 text-xs sm:text-sm truncate font-semibold">Out of Stock</p>
            <p class="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 drop-shadow-sm">{{ formatNumber(inventoryStore.outOfStockItems.length) }}</p>
          </div>
          <div class="bg-red-100/80 dark:bg-red-900/40 rounded-full p-2 sm:p-3 ml-2 flex-shrink-0 backdrop-blur-sm">
            <svg class="w-4 h-4 sm:w-6 sm:h-6 text-red-700 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </GlassCard>
    </div>

    <!-- Recent Transactions -->
    <GlassCard :hoverable="false" class="overflow-hidden">
      <div class="p-4 sm:p-6 border-b border-white/30 dark:border-gray-700/30">
        <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
      </div>
      
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Date</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Type</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Item</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Quantity</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/30 dark:divide-gray-700/30">
            <tr v-for="tx in recentTransactions" :key="tx.id" class="hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors">
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-800 dark:text-gray-200">{{ formatDate(tx.createdAt) }}</td>
              <td class="px-4 sm:px-6 py-3 sm:py-4">
                <span :class="getTypeBadge(tx.type)" class="px-2 py-1 text-xs rounded-full font-semibold">
                  {{ getTypeText(tx.type) }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-gray-900 dark:text-white">{{ tx.itemName }}</td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-sm font-bold" :class="getQuantityClass(tx.totalDelta)">
                {{ formatDelta(tx.totalDelta) }}
              </td>
            </tr>
            <tr v-if="recentTransactions.length === 0">
              <td colspan="4" class="px-4 sm:px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                No transactions found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile View -->
      <div class="sm:hidden divide-y divide-white/30 dark:divide-gray-700/30">
        <div v-for="tx in recentTransactions" :key="tx.id" class="p-4 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors">
          <div class="flex justify-between items-start mb-2">
            <span :class="getTypeBadge(tx.type)" class="px-2 py-1 text-xs rounded-full font-semibold">
              {{ getTypeText(tx.type) }}
            </span>
            <span class="text-xs text-gray-600 dark:text-gray-400">{{ formatDate(tx.createdAt) }}</span>
          </div>
          <div class="text-sm font-semibold text-gray-900 dark:text-white mb-1">{{ tx.itemName }}</div>
          <div class="text-sm font-bold" :class="getQuantityClass(tx.totalDelta)">
            {{ formatDelta(tx.totalDelta) }}
          </div>
        </div>
        <div v-if="recentTransactions.length === 0" class="p-8 text-center text-gray-600 dark:text-gray-400">
          No transactions found
        </div>
      </div>
    </GlassCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import GlassCard from '@/components/common/GlassCard.vue'

const inventoryStore = useInventoryStore()

const recentTransactions = computed(() => inventoryStore.transactions.slice(0, 10))

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const formatDate = (date: Date | string) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDelta = (delta: number) => {
  return delta > 0 ? `+${delta.toLocaleString()}` : `${delta.toLocaleString()}`
}

const getQuantityClass = (delta: number) => {
  if (delta > 0) return 'text-green-700 dark:text-green-400'
  if (delta < 0) return 'text-red-700 dark:text-red-400'
  return 'text-gray-700 dark:text-gray-400'
}

const getTypeBadge = (type: string) => {
  const badges: Record<string, string> = {
    ADD: 'bg-green-100/80 dark:bg-green-900/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 backdrop-blur-sm',
    TRANSFER: 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 backdrop-blur-sm',
    DISPATCH: 'bg-yellow-100/80 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 backdrop-blur-sm',
    UPDATE: 'bg-purple-100/80 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 backdrop-blur-sm',
    DELETE: 'bg-red-100/80 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 backdrop-blur-sm',
  }
  return badges[type] || 'bg-gray-100/80 dark:bg-gray-700/40 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 backdrop-blur-sm'
}

const getTypeText = (type: string) => {
  const texts: Record<string, string> = {
    ADD: 'Add',
    TRANSFER: 'Transfer',
    DISPATCH: 'Dispatch',
    UPDATE: 'Update',
    DELETE: 'Delete',
  }
  return texts[type] || type
}

onMounted(async () => {
  await inventoryStore.fetchItems()
  await inventoryStore.fetchTransactions()
})
</script>