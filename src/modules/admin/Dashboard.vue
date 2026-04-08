<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">مرحباً {{ userName }}</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">مرحباً بعودتك! إليك ملخص المخزون اليوم.</p>
        </div>
        <div class="flex gap-2">
          <button @click="refreshData" class="px-4 py-2 bg-green-600/10 hover:bg-green-600/20 text-green-600 dark:text-green-400 rounded-lg transition-all duration-300 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث
          </button>
        </div>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">إجمالي الأصناف</p>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ formatNumber(inventoryStore.totalItems) }}</p>
          </div>
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">إجمالي الوحدات</p>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ formatNumber(inventoryStore.totalQuantity) }}</p>
          </div>
          <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">مخزون منخفض</p>
            <p class="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{{ formatNumber(lowStockCount) }}</p>
          </div>
          <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">نفد المخزون</p>
            <p class="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{{ formatNumber(outOfStockCount) }}</p>
          </div>
          <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Warehouse Inventory Breakdown -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">توزيع المخزون في المخازن</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">توزيع المخزون عبر جميع المخازن</p>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ warehouses.length }} مخزن</span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">المخزن</th>
              <th class="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الأصناف</th>
              <th class="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الوحدات</th>
              <th class="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">مخزون منخفض</th>
              <th class="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الاستخدام</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="warehouse in warehouseStats" :key="warehouse.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-4 sm:px-6 py-4">
                <div class="font-medium text-gray-900 dark:text-white">{{ warehouse.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ warehouse.location || 'لا يوجد موقع' }}</div>
              </td>
              <td class="px-4 sm:px-6 py-4 text-center text-gray-700 dark:text-gray-300">{{ formatNumber(warehouse.itemCount) }}</td>
              <td class="px-4 sm:px-6 py-4 text-center font-semibold text-gray-900 dark:text-white">{{ formatNumber(warehouse.totalUnits) }}</td>
              <td class="px-4 sm:px-6 py-4 text-center">
                <span :class="warehouse.lowStockCount > 0 ? 'text-yellow-600 dark:text-yellow-400 font-semibold' : 'text-gray-500 dark:text-gray-400'">
                  {{ formatNumber(warehouse.lowStockCount) }}
                </span>
               </td>
              <td class="px-4 sm:px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div class="bg-green-600 rounded-full h-2 transition-all duration-500" :style="{ width: warehouse.utilization + '%' }"></div>
                  </div>
                  <span class="text-xs text-gray-600 dark:text-gray-400">{{ warehouse.utilization }}%</span>
                </div>
               </td>
             </tr>
            <tr v-if="warehouseStats.length === 0">
              <td colspan="5" class="px-4 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                لا توجد مخازن
              </td>
             </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Two Column Layout for Charts and Alerts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Stock Distribution Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">توزيع حالة المخزون</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-green-500"></div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">متوفر (&gt;500)</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{ formatNumber(inStockCount) }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ inStockPercentage }}%</span>
            </div>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-orange-500"></div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">مخزون حرج (51-500)</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{ formatNumber(criticalStockCount) }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ criticalStockPercentage }}%</span>
            </div>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">مخزون منخفض (1-50)</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{ formatNumber(lowStockCount) }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ lowStockPercentage }}%</span>
            </div>
          </div>
          <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">نفد المخزون</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{ formatNumber(outOfStockCount) }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ outOfStockPercentage }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Alerts & Notifications -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">التنبيهات الأخيرة</h3>
        <div class="space-y-3">
          <!-- Critical Stock Alert (51-500 units) -->
          <div v-if="criticalStockItems.length > 0" class="p-3 rounded-lg border-r-4 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-medium text-orange-800 dark:text-orange-300">⚠️ تنبيه المخزون الحرج</p>
                <p class="text-xs text-orange-700 dark:text-orange-400 mt-1">
                  {{ criticalStockItems.length }} صنف (أصناف) بمستوى مخزون حرج (51-500 وحدة)
                </p>
                <div class="mt-2 space-y-1">
                  <div v-for="item in criticalStockItems.slice(0, 3)" :key="item.id" class="text-xs text-orange-600 dark:text-orange-400">
                    • {{ item.name }}: {{ item.remainingQuantity.toLocaleString() }} وحدة
                  </div>
                  <div v-if="criticalStockItems.length > 3" class="text-xs text-orange-500">
                    +{{ criticalStockItems.length - 3 }} أصناف أخرى
                  </div>
                </div>
              </div>
              <span class="text-xs text-orange-500">الآن</span>
            </div>
          </div>

          <!-- Low Stock Alert (1-50 units) -->
          <div v-if="lowStockItems.length > 0" class="p-3 rounded-lg border-r-4 border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-medium text-yellow-800 dark:text-yellow-300">⚠️ تنبيه المخزون المنخفض</p>
                <p class="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                  {{ lowStockItems.length }} صنف (أصناف) أصبح مخزونها منخفضاً (1-50 وحدة)
                </p>
                <div class="mt-2 space-y-1">
                  <div v-for="item in lowStockItems.slice(0, 3)" :key="item.id" class="text-xs text-yellow-600 dark:text-yellow-400">
                    • {{ item.name }}: {{ item.remainingQuantity.toLocaleString() }} وحدة
                  </div>
                  <div v-if="lowStockItems.length > 3" class="text-xs text-yellow-500">
                    +{{ lowStockItems.length - 3 }} أصناف أخرى
                  </div>
                </div>
              </div>
              <span class="text-xs text-yellow-500">الآن</span>
            </div>
          </div>

          <!-- Out of Stock Alert -->
          <div v-if="outOfStockItems.length > 0" class="p-3 rounded-lg border-r-4 border-red-500 bg-red-50/50 dark:bg-red-900/10">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-medium text-red-800 dark:text-red-300">❌ تنبيه نفاد المخزون</p>
                <p class="text-xs text-red-700 dark:text-red-400 mt-1">
                  {{ outOfStockItems.length }} صنف (أصناف) قد نفدت بالكامل من المخزون
                </p>
                <div class="mt-2 space-y-1">
                  <div v-for="item in outOfStockItems.slice(0, 3)" :key="item.id" class="text-xs text-red-600 dark:text-red-400">
                    • {{ item.name }} ({{ item.code }})
                  </div>
                  <div v-if="outOfStockItems.length > 3" class="text-xs text-red-500">
                    +{{ outOfStockItems.length - 3 }} أصناف أخرى
                  </div>
                </div>
              </div>
              <span class="text-xs text-red-500">الآن</span>
            </div>
          </div>

          <div v-if="criticalStockItems.length === 0 && lowStockItems.length === 0 && outOfStockItems.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            ✅ جميع الأصناف بمستوى مخزون جيد
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">آخر المعاملات</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">أحدث حركات المخزون</p>
          </div>
          <router-link to="/inventory/transactions" class="text-sm text-green-600 dark:text-green-400 hover:text-green-700 transition-colors">
            عرض الكل ←
          </router-link>
        </div>
      </div>

      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">التاريخ</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">النوع</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الصنف</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الكمية</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="tx in recentTransactions" :key="tx.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-4 sm:px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{{ formatDate(tx.createdAt) }}</td>
              <td class="px-4 sm:px-6 py-3">
                <span :class="getTypeBadge(tx.type)" class="px-2 py-1 text-xs rounded-full font-medium">
                  {{ getTypeText(tx.type) }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{{ tx.itemName }}</td>
              <td class="px-4 sm:px-6 py-3 text-sm font-semibold" :class="getQuantityClass(tx.totalDelta)">
                {{ formatDelta(tx.totalDelta) }}
              </td>
             <tr>
            <tr v-if="recentTransactions.length === 0">
              <td colspan="4" class="px-4 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                لا توجد معاملات
              </td>
             </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Transaction View -->
      <div class="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
        <div v-for="tx in recentTransactions" :key="tx.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <div class="flex justify-between items-start mb-2">
            <span :class="getTypeBadge(tx.type)" class="px-2 py-1 text-xs rounded-full font-medium">
              {{ getTypeText(tx.type) }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(tx.createdAt) }}</span>
          </div>
          <div class="text-sm font-semibold text-gray-900 dark:text-white mb-1">{{ tx.itemName }}</div>
          <div class="text-sm font-semibold" :class="getQuantityClass(tx.totalDelta)">
            {{ formatDelta(tx.totalDelta) }}
          </div>
        </div>
        <div v-if="recentTransactions.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
          لا توجد معاملات
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useAuthStore } from '@/stores/auth'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()

// Get user name
const userName = computed(() => {
  const name = authStore.user?.name || authStore.user?.email?.split('@')[0] || 'المستخدم'
  return name
})

// Refresh function
const refreshData = async () => {
  await inventoryStore.fetchItems()
  await inventoryStore.fetchTransactions()
  await warehouseStore.fetchWarehouses()
}

// Recent transactions
const recentTransactions = computed(() => inventoryStore.transactions.slice(0, 10))

// Stock counts with CORRECT thresholds
// In Stock: > 500 units
// Critical Stock: 51 - 500 units
// Low Stock: 1 - 50 units
// Out of Stock: 0 units
const lowStockCount = computed(() => inventoryStore.items.filter(item => item.remainingQuantity > 0 && item.remainingQuantity <= 50).length)
const criticalStockCount = computed(() => inventoryStore.items.filter(item => item.remainingQuantity > 50 && item.remainingQuantity <= 500).length)
const inStockCount = computed(() => inventoryStore.items.filter(item => item.remainingQuantity > 500).length)
const outOfStockCount = computed(() => inventoryStore.items.filter(item => item.remainingQuantity === 0).length)
const totalItemsCount = computed(() => inventoryStore.items.length)

// Individual items lists for alerts
const lowStockItems = computed(() => inventoryStore.items.filter(item => item.remainingQuantity > 0 && item.remainingQuantity <= 50))
const criticalStockItems = computed(() => inventoryStore.items.filter(item => item.remainingQuantity > 50 && item.remainingQuantity <= 500))
const outOfStockItems = computed(() => inventoryStore.items.filter(item => item.remainingQuantity === 0))

// Percentages for chart
const inStockPercentage = computed(() => totalItemsCount.value ? ((inStockCount.value / totalItemsCount.value) * 100).toFixed(1) : 0)
const criticalStockPercentage = computed(() => totalItemsCount.value ? ((criticalStockCount.value / totalItemsCount.value) * 100).toFixed(1) : 0)
const lowStockPercentage = computed(() => totalItemsCount.value ? ((lowStockCount.value / totalItemsCount.value) * 100).toFixed(1) : 0)
const outOfStockPercentage = computed(() => totalItemsCount.value ? ((outOfStockCount.value / totalItemsCount.value) * 100).toFixed(1) : 0)

// Warehouse statistics
const warehouses = computed(() => warehouseStore.warehouses)
const warehouseStats = computed(() => {
  return warehouses.value.map(warehouse => {
    const items = inventoryStore.items.filter(item => item.warehouseId === warehouse.id)
    const totalUnits = items.reduce((sum, item) => sum + item.remainingQuantity, 0)
    // Low stock items in this warehouse (1-50 units)
    const lowStockItems = items.filter(item => item.remainingQuantity > 0 && item.remainingQuantity <= 50).length
    const maxCapacity = 10000
    const utilization = Math.min(Math.round((totalUnits / maxCapacity) * 100), 100)
    
    return {
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.location,
      itemCount: items.length,
      totalUnits,
      lowStockCount: lowStockItems,
      utilization
    }
  })
})

// Helper functions
const formatNumber = (num: number) => num?.toLocaleString() || '0'
const formatDate = (date: Date | string) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}
const formatDelta = (delta: number) => delta > 0 ? `+${delta.toLocaleString()}` : `${delta.toLocaleString()}`
const getQuantityClass = (delta: number) => {
  if (delta > 0) return 'text-green-600 dark:text-green-400'
  if (delta < 0) return 'text-red-600 dark:text-red-400'
  return 'text-gray-600 dark:text-gray-400'
}
const getTypeBadge = (type: string) => {
  const badges: Record<string, string> = {
    ADD: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    TRANSFER: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    DISPATCH: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    UPDATE: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    DELETE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  }
  return badges[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}
const getTypeText = (type: string) => {
  const texts: Record<string, string> = { 
    ADD: 'إضافة', 
    TRANSFER: 'نقل', 
    DISPATCH: 'صرف', 
    UPDATE: 'تحديث', 
    DELETE: 'حذف' 
  }
  return texts[type] || type
}

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await inventoryStore.fetchItems()
  await inventoryStore.fetchTransactions()
})
</script>