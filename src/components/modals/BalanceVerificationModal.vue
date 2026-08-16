<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4" @click.self="close">
      <div class="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md md:max-w-lg transition-all duration-300 transform animate-slide-up max-h-[90vh] sm:max-h-[85vh]">

        <div class="sticky top-0 bg-white dark:bg-gray-800 px-5 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl z-10">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">فحص وتصحيح الرصيد</h2>
            <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mx-auto"></div>
          <p class="mt-3 text-gray-500 font-semibold">جاري فحص الرصيد...</p>
        </div>

        <div v-else-if="result" class="overflow-y-auto p-5 max-h-[calc(90vh-120px)] sm:max-h-[calc(85vh-120px)]">
          <!-- Result Header -->
          <div :class="result.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'" class="rounded-xl p-4 mb-4">
            <div class="flex items-center gap-3">
              <svg v-if="result.success" class="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else class="w-8 h-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p class="font-bold text-lg" :class="result.success ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'">
                  {{ result.success ? '✅ الرصيد صحيح' : '⚠️ تم اكتشاف عدم تطابق' }}
                </p>
                <p class="text-xs" :class="result.success ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'">
                  {{ result.success ? 'جميع الحركات متطابقة مع الرصيد' : 'يوجد اختلاف بين الرصيد الفعلي والمحسوب' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Item Info -->
          <div class="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4">
            <div class="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-600 rounded-xl overflow-hidden flex items-center justify-center">
              <img v-if="itemPhotoUrl" :src="itemPhotoUrl" class="w-full h-full object-cover" alt="صورة الصنف" loading="lazy" />
              <svg v-else class="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">{{ props.itemName }}</h3>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <span>الكود: <span class="font-mono font-semibold">{{ props.itemCode }}</span></span>
                <span>اللون: <span class="font-semibold">{{ props.itemColor || '—' }}</span></span>
                <span v-if="props.itemSize">المقاس: <span class="font-semibold">{{ props.itemSize }}</span></span>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs text-gray-500">المخزن:</span>
                <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ warehouseName }}</span>
              </div>
            </div>
          </div>

          <!-- Last Transaction -->
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mb-4">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-xs font-bold text-blue-700 dark:text-blue-300">آخر حركة</span>
            </div>
            <div v-if="lastTransaction" class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-xs text-gray-500 dark:text-gray-400">التاريخ</span>
                <p class="font-semibold text-gray-900 dark:text-white">{{ lastTransaction.date }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-500 dark:text-gray-400">النوع</span>
                <p class="font-semibold" :class="lastTransaction.type === 'IN' ? 'text-green-600' : 'text-red-600'">
                  {{ lastTransaction.typeLabel }}
                </p>
              </div>
              <div>
                <span class="text-xs text-gray-500 dark:text-gray-400">الكمية</span>
                <p class="font-semibold" :class="lastTransaction.quantity > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ lastTransaction.quantity > 0 ? '+' : '' }}{{ lastTransaction.quantity }}
                </p>
              </div>
              <div>
                <span class="text-xs text-gray-500 dark:text-gray-400">بواسطة</span>
                <p class="font-semibold text-gray-900 dark:text-white truncate">{{ lastTransaction.user || '—' }}</p>
              </div>
            </div>
            <div v-else class="text-center py-2 text-sm text-gray-500">لا توجد حركات لهذا الصنف</div>
          </div>

          <!-- Activity Stats -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
              <p class="text-xs text-gray-500 dark:text-gray-400">آخر حركة</p>
              <p class="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{{ lastTransaction?.date || '—' }}</p>
              <p class="text-[10px] text-gray-400 mt-0.5">{{ daysSinceLastTransaction }} يوم</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
              <p class="text-xs text-gray-500 dark:text-gray-400">نشاط الصنف</p>
              <div class="flex items-center justify-center gap-2 mt-0.5">
                <span class="text-sm font-bold" :class="movementPercentage >= 30 ? 'text-green-600' : movementPercentage >= 10 ? 'text-yellow-600' : 'text-red-600'">
                  {{ movementPercentage }}%
                </span>
                <span class="text-xs font-semibold" :class="movementPercentage >= 30 ? 'text-green-600 dark:text-green-400' : movementPercentage >= 10 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'">
                  {{ movementPercentage >= 30 ? 'نشط' : movementPercentage >= 10 ? 'متوسط' : 'خامل' }}
                </span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-1">
                <div class="h-1.5 rounded-full transition-all duration-500" 
                     :class="movementPercentage >= 30 ? 'bg-green-500' : movementPercentage >= 10 ? 'bg-yellow-500' : 'bg-red-500'"
                     :style="{ width: Math.min(movementPercentage, 100) + '%' }"></div>
              </div>
              <p class="text-[10px] text-gray-400 mt-0.5">نسبة التحرك</p>
            </div>
          </div>

          <!-- Balance Details -->
          <div class="space-y-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2">تفاصيل الرصيد</h4>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">الرصيد الحالي</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">{{ formatNumber(result.current_balance) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">الرصيد المحسوب</p>
                <p class="text-lg font-bold" :class="result.current_balance !== result.calculated_balance ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
                  {{ formatNumber(result.calculated_balance) }}
                </p>
              </div>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-600 pt-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">إجمالي الوارد</p>
                  <p class="text-base font-bold text-green-600 dark:text-green-400">{{ formatNumber(result.total_in) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">إجمالي المنصرف</p>
                  <p class="text-base font-bold text-red-600 dark:text-red-400">{{ formatNumber(result.total_out) }}</p>
                </div>
              </div>
            </div>

            <div v-if="!result.success" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-2">
              <p class="text-sm font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                الفرق: {{ Math.abs(result.current_balance - result.calculated_balance) }} وحدة
              </p>
              <p class="text-xs text-red-600 dark:text-red-400 mt-1">يوصى بمراجعة الحركات للتأكد من صحتها</p>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button @click="close" class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[48px] flex items-center justify-center">
              إغلاق
            </button>
            <button 
              v-if="!result.success"
              @click="requestCorrection"
              class="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors shadow-md min-h-[48px] flex items-center justify-center"
            >
              طلب تصحيح
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toastVisible" class="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10001] w-11/12 max-w-md animate-slide-down">
      <div class="rounded-xl p-4 shadow-xl border flex items-center gap-3 bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-600">
        <div class="flex-shrink-0">
          <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-green-700 dark:text-green-300">{{ toastMessage }}</p>
        </div>
        <button @click="toastVisible = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { supabase } from '@/services/supabase'

const props = defineProps<{
  isOpen: boolean
  itemCode: string
  itemName: string
  itemColor: string
  itemSize?: string
  warehouseId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const transactionStore = useTransactionStore()
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()

const loading = ref(false)
const result = ref<any>(null)
const itemPhotoUrl = ref<string | null>(null)
const lastTransaction = ref<any>(null)
const daysSinceLastTransaction = ref(0)
const movementPercentage = ref(0)
const toastVisible = ref(false)
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

const warehouseName = computed(() => {
  if (!props.warehouseId) return '—'
  const warehouse = warehouseStore.warehouses.find(w => w.id === props.warehouseId)
  return warehouse?.name_ar || warehouse?.name || '—'
})

const formatNumber = (num: number) => num?.toLocaleString() || '0'

const showToast = (message: string) => {
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
  toastMessage.value = message
  toastVisible.value = true
  toastTimer = setTimeout(() => {
    toastVisible.value = false
    toastTimer = null
  }, 4000)
}

const getLastTransaction = async (itemId: string) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) throw error
    if (data && data.length > 0) {
      const tx = data[0]
      const delta = tx.total_delta || 0
      
      // Get user name
      let userName = tx.created_by || '—'
      if (tx.user_id) {
        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', tx.user_id)
          .single()
        if (userData) userName = userData.name
      }

      lastTransaction.value = {
        date: new Date(tx.created_at).toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        type: delta > 0 ? 'IN' : 'OUT',
        typeLabel: tx.type || (delta > 0 ? 'إضافة' : 'صرف'),
        quantity: delta,
        user: userName,
        notes: tx.notes || ''
      }

      const days = Math.floor((Date.now() - new Date(tx.created_at).getTime()) / (1000 * 60 * 60 * 24))
      daysSinceLastTransaction.value = days
    }
  } catch (err) {
    console.error('Error fetching last transaction:', err)
  }
}

const loadVerification = async () => {
  loading.value = true
  try {
    const item = inventoryStore.items.find(i => 
      i.code === props.itemCode && 
      i.warehouseId === props.warehouseId
    )
    
    if (item?.photoUrl) {
      itemPhotoUrl.value = item.photoUrl
    }

    const resultData = await transactionStore.verifyAndFixBalance(
      props.itemCode,
      props.itemName,
      props.itemColor,
      props.itemSize,
      props.warehouseId
    )

    result.value = resultData

    // Get item ID for fetching last transaction
    const { data: itemData } = await supabase
      .from('items')
      .select('id')
      .eq('code', props.itemCode)
      .eq('warehouse_id', props.warehouseId)
      .single()

    if (itemData) {
      await getLastTransaction(itemData.id)
    }

    // Calculate movement percentage
    if (resultData) {
      const totalMovement = resultData.total_in + resultData.total_out
      const totalAvailable = totalMovement + resultData.current_balance
      movementPercentage.value = totalAvailable > 0 ? Math.round((totalMovement / totalAvailable) * 100) : 0
    }
  } catch (error) {
    console.error('Error verifying balance:', error)
    showToast('حدث خطأ أثناء فحص الرصيد')
  } finally {
    loading.value = false
  }
}

const requestCorrection = () => {
  showToast('تم إرسال طلب التصحيح للمسؤول')
}

const close = () => {
  if (!loading.value) {
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }
    toastVisible.value = false
    emit('close')
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    result.value = null
    lastTransaction.value = null
    loading.value = false
    loadVerification()
  } else {
    toastVisible.value = false
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }
  }
})

onUnmounted(() => {
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
})
</script>

<style scoped>
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes slide-down {
  from { transform: translate(-50%, -100%); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}
.animate-slide-up { animation: slide-up 0.3s ease-out; }
.animate-slide-down { animation: slide-down 0.3s ease-out; }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

input:focus { outline: none; }
button { touch-action: manipulation; }
@media (max-width: 768px) {
  input, select, textarea, button { font-size: 16px !important; }
}
</style>