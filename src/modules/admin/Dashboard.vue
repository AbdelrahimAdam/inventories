<template>
  <div class="space-y-6">
    <!-- Trial Banner -->
    <div v-if="authStore.isUserTrialActive" class="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 sm:p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-amber-800 dark:text-amber-300 text-base sm:text-lg">🎉 فترة تجريبية مجانية</h3>
            <p class="text-amber-700 dark:text-amber-400 text-sm">تبقى <span class="font-bold text-amber-900 dark:text-amber-300 text-lg">{{ daysLeft }}</span> يوم</p>
          </div>
        </div>

        <div class="flex flex-col items-end">
          <div class="text-sm text-amber-700 dark:text-amber-400"><span class="font-medium">تاريخ البدء:</span> {{ trialStartDate }}</div>
          <div class="text-sm text-amber-700 dark:text-amber-400"><span class="font-medium">تاريخ الانتهاء:</span> {{ trialEndDate }}</div>

          <div class="flex gap-2 mt-2">
            <button @click="requestUpgrade" :disabled="upgradeRequestSent" class="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg text-sm font-semibold hover:from-amber-700 hover:to-amber-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              {{ upgradeRequestSent ? 'تم إرسال الطلب' : 'طلب ترقية الحساب' }}
            </button>
            <button @click="contactSales" class="px-4 py-1.5 border border-amber-600 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all">
              تواصل مع المبيعات
            </button>
          </div>

          <div v-if="upgradeRequestSent" class="text-xs text-green-600 dark:text-green-400 mt-1">
            ✓ تم إرسال طلب الترقية. سيتم التواصل معك قريباً.
          </div>
        </div>
      </div>

      <div class="mt-3">
        <div class="flex justify-between text-xs text-amber-600 dark:text-amber-400 mb-1">
          <span>بداية التجربة</span>
          <span>نهاية التجربة</span>
        </div>

        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div class="bg-gradient-to-r from-amber-500 to-amber-600 h-2.5 rounded-full transition-all duration-500"
            :style="{ width: `${trialProgressPercentage}%` }"></div>
        </div>

        <p class="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
          اكتمل {{ trialProgressPercentage }}% من الفترة التجريبية
        </p>
      </div>
    </div>

    <!-- Alerts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Alerts Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">التنبيهات الأخيرة</h3>

        <div v-else class="space-y-3 max-h-[500px] overflow-y-auto">

          <!-- OUT OF STOCK -->
          <div v-if="outOfStockItemsList.length > 0" class="p-3 rounded-lg border-r-4 border-red-500 bg-red-50/50 dark:bg-red-900/10">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="text-sm font-bold text-red-800 dark:text-red-300">❌ تنبيه نفاد المخزون</p>
                <p class="text-xs text-red-700 dark:text-red-400 mt-1">{{ outOfStockItemsList.length }} صنف</p>

                <table class="w-full mt-2 text-xs text-red-600 dark:text-red-400">
                  <thead>
                    <tr class="border-b border-red-200 dark:border-red-800">
                      <th class="text-center py-1 px-2">الصنف</th>
                      <th class="text-center py-1 px-2">الكود</th>
                      <th class="text-center py-1 px-2">المخزن</th>
                      <th class="text-center py-1 px-2">اللون</th>
                      <th class="text-center py-1 px-2">الكمية</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="item in displayedOutOfStockItems" :key="item.id">
                      <td class="py-1 text-center px-2">{{ item.name }}</td>
                      <td class="py-1 text-center px-2">{{ item.code }}</td>
                      <td class="py-1 text-center px-2">{{ getWarehouseName(item.warehouseId) }}</td>
                      <td class="py-1 text-center px-2">{{ item.color }}</td>
                      <td class="py-1 text-center px-2 font-bold">{{ formatNumber(item.remainingQuantity) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- CRITICAL -->
          <div v-if="criticalStockItemsList.length > 0" class="p-3 rounded-lg border-r-4 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="text-sm font-bold text-orange-800 dark:text-orange-300">⚠️ المخزون الحرج</p>
                <p class="text-xs text-orange-700 dark:text-orange-400 mt-1">{{ criticalStockItemsList.length }} صنف</p>

                <table class="w-full mt-2 text-xs text-orange-600 dark:text-orange-400">
                  <thead>
                    <tr class="border-b border-orange-200 dark:border-orange-800">
                      <th class="text-center py-1 px-2">الصنف</th>
                      <th class="text-center py-1 px-2">الكود</th>
                      <th class="text-center py-1 px-2">المخزن</th>
                      <th class="text-center py-1 px-2">اللون</th>
                      <th class="text-center py-1 px-2">الكمية</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="item in displayedCriticalStockItems" :key="item.id">
                      <td class="py-1 text-center px-2">{{ item.name }}</td>
                      <td class="py-1 text-center px-2">{{ item.code }}</td>
                      <td class="py-1 text-center px-2">{{ getWarehouseName(item.warehouseId) }}</td>
                      <td class="py-1 text-center px-2">{{ item.color }}</td>
                      <td class="py-1 text-center px-2 font-bold">{{ formatNumber(item.remainingQuantity) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- LOW -->
          <div v-if="lowStockItemsList.length > 0" class="p-3 rounded-lg border-r-4 border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="text-sm font-bold text-yellow-800 dark:text-yellow-300">⚠️ المخزون المنخفض</p>
                <p class="text-xs text-yellow-700 dark:text-yellow-400 mt-1">{{ lowStockItemsList.length }} صنف</p>

                <table class="w-full mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                  <thead>
                    <tr class="border-b border-yellow-200 dark:border-yellow-800">
                      <th class="text-center py-1 px-2">الصنف</th>
                      <th class="text-center py-1 px-2">الكود</th>
                      <th class="text-center py-1 px-2">المخزن</th>
                      <th class="text-center py-1 px-2">اللون</th>
                      <th class="text-center py-1 px-2">الكمية</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="item in displayedLowStockItems" :key="item.id">
                      <td class="py-1 text-center px-2">{{ item.name }}</td>
                      <td class="py-1 text-center px-2">{{ item.code }}</td>
                      <td class="py-1 text-center px-2">{{ getWarehouseName(item.warehouseId) }}</td>
                      <td class="py-1 text-center px-2">{{ item.color }}</td>
                      <td class="py-1 text-center px-2 font-bold">{{ formatNumber(item.remainingQuantity) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div v-if="criticalStockItemsList.length === 0 && lowStockItemsList.length === 0 && outOfStockItemsList.length === 0"
            class="text-center py-8 text-gray-500 dark:text-gray-400">
            ✅ جميع الأصناف بمستوى مخزون جيد
          </div>

        </div>
      </div>
    </div>

    <TransferModal :is-open="showTransferModal" @close="showTransferModal = false" @success="refreshData" />
    <DispatchModal :is-open="showDispatchModal" @close="showDispatchModal = false" @success="refreshData" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useAuthStore } from '@/stores/auth'
import TransferModal from '@/components/modals/TransferModal.vue'
import DispatchModal from '@/components/modals/DispatchModal.vue'
import { supabase } from '@/services/supabase'
import type { InventoryItem } from '@/types'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()

const showTransferModal = ref(false)
const showDispatchModal = ref(false)

const subscriptionMessage = ref('')
const showSubscriptionMessage = ref(false)
const daysLeft = ref(0)
const upgradeRequestSent = ref(false)

const isRefreshing = ref(false)
const isLoadingAlerts = ref(true)
const isLoadingTransactions = ref(true)

const alertItems = ref<InventoryItem[]>([])

const outOfStockLoadMore = ref(5)
const lowStockLoadMore = ref(5)
const criticalStockLoadMore = ref(5)

const formatNumber = (num: number) => num?.toLocaleString() || '0'

const getWarehouseName = (id: string) => {
  const w = warehouseStore.warehouses.find(w => w.id === id)
  return w?.name_ar || w?.name || 'غير معروف'
}

const userName = computed(() =>
  authStore.user?.name || authStore.user?.email?.split('@')[0] || 'المستخدم'
)

const lowStockItemsList = computed(() =>
  alertItems.value.filter(i => i.remainingQuantity > 0 && i.remainingQuantity <= 50)
)

const criticalStockItemsList = computed(() =>
  alertItems.value.filter(i => i.remainingQuantity > 50 && i.remainingQuantity <= 500)
)

const outOfStockItemsList = computed(() =>
  alertItems.value.filter(i => i.remainingQuantity === 0)
)

const displayedOutOfStockItems = computed(() =>
  outOfStockItemsList.value.slice(0, outOfStockLoadMore.value)
)

const displayedLowStockItems = computed(() =>
  lowStockItemsList.value.slice(0, lowStockLoadMore.value)
)

const displayedCriticalStockItems = computed(() =>
  criticalStockItemsList.value.slice(0, criticalStockLoadMore.value)
)

async function loadAlertItems() {
  isLoadingAlerts.value = true
  try {
    const items = await inventoryStore.fetchAlertItems(inventoryStore.currentFilters.warehouseId || null)
    alertItems.value = items
  } finally {
    isLoadingAlerts.value = false
  }
}

async function refreshData() {
  isRefreshing.value = true
  try {
    await Promise.all([
      inventoryStore.fetchSummaryStats(),
      warehouseStore.fetchWarehouses(),
      loadAlertItems(),
    ])
  } finally {
    isRefreshing.value = false
  }
}

onMounted(async () => {
  await refreshData()
})
</script>

<style scoped>
.max-h-\[500px\] {
  max-height: 500px;
}
</style>
