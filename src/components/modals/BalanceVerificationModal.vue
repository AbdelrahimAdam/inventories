<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="isOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="close">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="sticky top-0 bg-white dark:bg-gray-800 px-5 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl z-10 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-gray-900 dark:text-white">فحص وتصحيح الرصيد</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ props.itemName }}</p>
              </div>
            </div>
            <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex-1 flex flex-col items-center justify-center p-8">
            <div class="animate-spin rounded-full h-14 w-14 border-4 border-amber-500 border-t-transparent mb-4"></div>
            <p class="text-gray-500 dark:text-gray-400 font-medium">جاري فحص الرصيد...</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">قد يستغرق هذا بضع ثوانٍ</p>
          </div>

          <!-- Content -->
          <div v-else-if="result" class="flex-1 overflow-y-auto p-5 space-y-4">
            <!-- Result Badge -->
            <div :class="result.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'" 
                 class="rounded-xl p-4 text-center">
              <div class="flex items-center justify-center gap-3">
                <svg v-if="result.success" class="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="w-8 h-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div class="text-right">
                  <p class="font-bold text-lg" :class="result.success ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'">
                    {{ result.success ? '✅ الرصيد صحيح' : '⚠️ عدم تطابق في الرصيد' }}
                  </p>
                  <p class="text-xs" :class="result.success ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'">
                    {{ result.success ? 'جميع الحركات متطابقة مع الرصيد' : 'يوجد اختلاف بين الرصيد الفعلي والمحسوب' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Balance Summary -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-600">
                <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">الرصيد الحالي</p>
                <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">{{ formatNumber(result.current_balance) }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-600">
                <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">الرصيد المحسوب</p>
                <p class="text-2xl font-black mt-1" :class="result.current_balance !== result.calculated_balance ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
                  {{ formatNumber(result.calculated_balance) }}
                </p>
              </div>
            </div>

            <!-- Movement Stats -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center border border-green-200 dark:border-green-800">
                <div class="flex items-center justify-center gap-1.5">
                  <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span class="text-xs text-gray-500 dark:text-gray-400">إجمالي الوارد</span>
                </div>
                <p class="text-xl font-black text-green-600 dark:text-green-400 mt-1">{{ formatNumber(result.total_in) }}</p>
              </div>
              <div class="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center border border-red-200 dark:border-red-800">
                <div class="flex items-center justify-center gap-1.5">
                  <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span class="text-xs text-gray-500 dark:text-gray-400">إجمالي المنصرف</span>
                </div>
                <p class="text-xl font-black text-red-600 dark:text-red-400 mt-1">{{ formatNumber(result.total_out) }}</p>
              </div>
            </div>

            <!-- Difference Alert -->
            <div v-if="!result.success" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p class="text-sm font-bold text-red-700 dark:text-red-300">
                    الفرق: {{ Math.abs(result.current_balance - result.calculated_balance) }} وحدة
                  </p>
                  <p class="text-xs text-red-600 dark:text-red-400 mt-1">
                    يوصى بمراجعة الحركات للتأكد من صحتها
                  </p>
                </div>
              </div>
            </div>

            <!-- Last Transaction -->
            <div v-if="lastTransaction" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-xs font-bold text-blue-700 dark:text-blue-300">آخر حركة</span>
                <span class="text-xs text-gray-500 dark:text-gray-400 mr-auto">{{ daysSinceLastTransaction }} يوم مضى</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400">التاريخ</p>
                  <p class="font-semibold text-gray-900 dark:text-white text-xs">{{ lastTransaction.date }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400">النوع</p>
                  <p class="font-semibold text-xs" :class="lastTransaction.type === 'IN' ? 'text-green-600' : 'text-red-600'">
                    {{ lastTransaction.typeLabel }}
                  </p>
                </div>
                <div>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400">الكمية</p>
                  <p class="font-semibold text-xs" :class="lastTransaction.quantity > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ lastTransaction.quantity > 0 ? '+' : '' }}{{ lastTransaction.quantity }}
                  </p>
                </div>
                <div>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400">بواسطة</p>
                  <p class="font-semibold text-gray-900 dark:text-white text-xs truncate">{{ lastTransaction.user || '—' }}</p>
                </div>
              </div>
            </div>

            <!-- Activity Indicator -->
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 dark:text-gray-400">نشاط الصنف</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold" :class="movementPercentage >= 30 ? 'text-green-600' : movementPercentage >= 10 ? 'text-yellow-600' : 'text-red-600'">
                    {{ movementPercentage }}%
                  </span>
                  <span class="text-xs font-semibold" :class="movementPercentage >= 30 ? 'text-green-600 dark:text-green-400' : movementPercentage >= 10 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'">
                    {{ movementPercentage >= 30 ? 'نشط' : movementPercentage >= 10 ? 'متوسط' : 'خامل' }}
                  </span>
                </div>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-1.5">
                <div class="h-1.5 rounded-full transition-all duration-500" 
                     :class="movementPercentage >= 30 ? 'bg-green-500' : movementPercentage >= 10 ? 'bg-yellow-500' : 'bg-red-500'"
                     :style="{ width: Math.min(movementPercentage, 100) + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div v-if="result && !loading" class="sticky bottom-0 bg-white dark:bg-gray-800 px-5 py-4 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl flex gap-3">
            <button @click="close" class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[48px] flex items-center justify-center text-sm">
              إغلاق
            </button>
            <button 
              v-if="!result.success"
              @click="requestCorrection"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg min-h-[48px] flex items-center justify-center text-sm"
            >
              طلب تصحيح
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="toastVisible" class="fixed top-4 left-1/2 -translate-x-1/2 z-[10001] w-11/12 max-w-md">
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
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
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
let loadingTimeout: ReturnType<typeof setTimeout> | null = null

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

// ===== OPTIMIZED: Single query to get item ID and last transaction =====
const fetchItemData = async () => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('id, photo_url')
      .eq('code', props.itemCode)
      .eq('warehouse_id', props.warehouseId || '')
      .single()

    if (error) throw error
    if (data) {
      if (data.photo_url) {
        itemPhotoUrl.value = data.photo_url
      }
      
      // Get last transaction in same query using join or separate optimized query
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*, users!transactions_user_id_fkey(name)')
        .eq('item_id', data.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!txError && txData && txData.length > 0) {
        const tx = txData[0]
        const delta = tx.total_delta || 0
        
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
          user: tx.users?.name || tx.created_by || '—',
          notes: tx.notes || ''
        }

        const days = Math.floor((Date.now() - new Date(tx.created_at).getTime()) / (1000 * 60 * 60 * 24))
        daysSinceLastTransaction.value = days
      }
    }
    return data
  } catch (err) {
    console.error('Error fetching item data:', err)
    return null
  }
}

// ===== OPTIMIZED: Load verification with timeout protection =====
const loadVerification = async () => {
  // Prevent multiple simultaneous loads
  if (loading.value) return
  
  loading.value = true
  result.value = null
  
  // Set a timeout to prevent infinite loading
  loadingTimeout = setTimeout(() => {
    if (loading.value) {
      loading.value = false
      showToast('استغرق الفحص وقتاً طويلاً، يرجى المحاولة مرة أخرى')
    }
  }, 15000) // 15 second timeout

  try {
    // Run verification and fetch item data in parallel
    const [verificationResult, itemData] = await Promise.all([
      transactionStore.verifyAndFixBalance(
        props.itemCode,
        props.itemName,
        props.itemColor,
        props.itemSize,
        props.warehouseId
      ),
      fetchItemData()
    ])

    result.value = verificationResult

    if (verificationResult) {
      const totalMovement = verificationResult.total_in + verificationResult.total_out
      const totalAvailable = totalMovement + verificationResult.current_balance
      movementPercentage.value = totalAvailable > 0 ? Math.round((totalMovement / totalAvailable) * 100) : 0
    }
  } catch (error) {
    console.error('Error verifying balance:', error)
    showToast('حدث خطأ أثناء فحص الرصيد')
  } finally {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
      loadingTimeout = null
    }
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
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
      loadingTimeout = null
    }
    toastVisible.value = false
    emit('close')
  }
}

// Reset state when modal opens
watch(() => props.isOpen, (open) => {
  if (open) {
    result.value = null
    lastTransaction.value = null
    loading.value = false
    // Small delay to allow modal to render before loading
    nextTick(() => {
      loadVerification()
    })
  } else {
    toastVisible.value = false
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
      loadingTimeout = null
    }
  }
}, { immediate: true })

onUnmounted(() => {
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
  if (loadingTimeout) {
    clearTimeout(loadingTimeout)
    loadingTimeout = null
  }
})
</script>

<style scoped>
/* Smooth animations */
.transition-300 { transition: all 0.3s ease; }
.transition-200 { transition: all 0.2s ease; }

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
}
.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* Touch improvements */
button {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

@media (max-width: 640px) {
  input, select, textarea, button {
    font-size: 16px !important;
  }
}
</style>