<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4" @click.self="close">
      <div class="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md md:max-w-lg transition-all duration-300 transform animate-slide-up max-h-[90vh] sm:max-h-[85vh]">

        <div class="sticky top-0 bg-white dark:bg-gray-800 px-5 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl z-10">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">إضافة حركة</h2>
            <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="networkError" class="bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 px-4 py-2 text-center">
          <p class="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            ⚠️ انقطع الاتصال بالشبكة. جاري إعادة المحاولة...
          </p>
        </div>

        <div class="overflow-y-auto p-5 max-h-[calc(90vh-120px)] sm:max-h-[calc(85vh-120px)]">
          <!-- Item Info -->
          <div class="mb-5 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-500 dark:text-gray-400">الرصيد الحالي:</span>
                <span class="font-bold text-green-600 dark:text-green-400 block text-lg">{{ localCurrentBalance }} وحدة</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400">الصنف:</span>
                <span class="font-semibold block">{{ props.itemName }}</span>
                <span class="text-xs text-gray-500">{{ props.itemCode }}</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400">اللون:</span>
                <span class="font-semibold block">{{ props.itemColor || '—' }}</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400">المقاس:</span>
                <span class="font-semibold block">{{ props.itemSize || '—' }}</span>
              </div>
            </div>
          </div>

          <div v-if="isReconnecting" class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center mb-4">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent mx-auto mb-3"></div>
            <p class="text-sm font-semibold text-gray-600 dark:text-gray-400">جاري إعادة الاتصال...</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">سيتم استعادة اختياراتك تلقائياً</p>
          </div>

          <form @submit.prevent="submit" class="space-y-4">
            <!-- Transaction Type -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                نوع الحركة <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  @click="setType('IN')"
                  :disabled="isSubmitting || isReconnecting"
                  :class="[
                    'px-4 py-3 rounded-xl font-semibold transition-all duration-200 min-h-[48px] flex items-center justify-center',
                    form.type === 'IN' 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                  ]"
                >
                  وارد (إضافة)
                </button>
                <button 
                  type="button"
                  @click="setType('OUT')"
                  :disabled="isSubmitting || isReconnecting"
                  :class="[
                    'px-4 py-3 rounded-xl font-semibold transition-all duration-200 min-h-[48px] flex items-center justify-center',
                    form.type === 'OUT' 
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                  ]"
                >
                  منصرف (صرف)
                </button>
              </div>
            </div>

            <!-- Voucher -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">رقم الإذن</label>
              <div class="flex items-center gap-3">
                <input 
                  type="text" 
                  :value="autoVoucher" 
                  readonly
                  class="flex-1 px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-mono"
                />
                <button 
                  type="button"
                  @click="regenerateVoucher"
                  :disabled="isSubmitting || isReconnecting"
                  class="px-4 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-xl transition-colors font-semibold text-sm min-h-[48px] flex items-center justify-center"
                  title="توليد رقم إذن جديد"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">رقم الإذن يتم إنشاؤه تلقائياً</p>
            </div>

            <!-- Quantity -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                الكمية <span class="text-red-500">*</span>
              </label>
              <div class="flex items-center gap-3">
                <button 
                  type="button"
                  @click="decreaseQuantity"
                  :disabled="form.quantity <= 1 || isSubmitting || isReconnecting"
                  class="w-12 h-12 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <svg class="w-6 h-6 mx-auto text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <input 
                  ref="quantityInputRef"
                  type="number" 
                  v-model.number="form.quantity" 
                  :max="maxQuantity"
                  min="1"
                  :disabled="isSubmitting || isReconnecting"
                  @focus="isQuantityFocused = true"
                  @blur="isQuantityFocused = false"
                  class="flex-1 text-center text-xl font-bold py-3 border-2 rounded-lg focus:ring-4 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 min-h-[52px]"
                  :class="{
                    'border-amber-500 ring-4 ring-amber-500/30 shadow-lg shadow-amber-500/20': isQuantityFocused,
                    'border-gray-300 dark:border-gray-600': !isQuantityFocused
                  }"
                  required 
                />
                <button 
                  type="button"
                  @click="increaseQuantity"
                  :disabled="form.quantity >= maxQuantity || isSubmitting || isReconnecting"
                  class="w-12 h-12 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <svg class="w-6 h-6 mx-auto text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div class="flex justify-between items-center mt-2">
                <button 
                  type="button"
                  @click="setMaxQuantity"
                  :disabled="isSubmitting || isReconnecting"
                  class="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
                >
                  استخدام الكل
                </button>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ form.type === 'OUT' ? 'الحد الأقصى: ' + maxQuantity : 'الحد الأقصى: غير محدود' }}
                </span>
              </div>
            </div>

            <!-- Party -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">الجهة</label>
              <input 
                type="text" 
                v-model="form.party" 
                placeholder="اسم العميل أو الجهة"
                :disabled="isSubmitting || isReconnecting"
                class="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 min-h-[48px]"
              />
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ملاحظات</label>
              <textarea 
                v-model="form.notes" 
                rows="3" 
                placeholder="أي ملاحظات إضافية..."
                :disabled="isSubmitting || isReconnecting"
                class="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none disabled:opacity-50"
              ></textarea>
            </div>

            <div v-if="form.type === 'OUT' && form.quantity > localCurrentBalance" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                الكمية المطلوبة أكبر من الرصيد المتاح!
              </p>
            </div>

            <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
              <button 
                v-if="networkError" 
                @click="retrySubmit" 
                class="mt-2 text-sm font-bold text-red-600 dark:text-red-400 hover:underline"
              >
                ↻ إعادة المحاولة
              </button>
            </div>

            <div class="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
              <button 
                type="button" 
                @click="close" 
                :disabled="isSubmitting || isReconnecting"
                class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[48px] flex items-center justify-center disabled:opacity-50"
              >
                إلغاء
              </button>
              <button 
                type="submit" 
                :disabled="!canSubmit"
                class="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md min-h-[48px] flex items-center justify-center"
                :class="form.type === 'IN' ? 'bg-green-700 hover:bg-green-800' : 'bg-red-700 hover:bg-red-800'"
              >
                <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحفظ...
                </span>
                <span v-else-if="isReconnecting">جاري إعادة الاتصال...</span>
                <span v-else>{{ form.type === 'IN' ? 'تأكيد الإضافة' : 'تأكيد الصرف' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toastVisible" class="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10001] w-11/12 max-w-md animate-slide-down">
      <div 
        class="rounded-xl p-4 shadow-xl border flex items-center gap-3"
        :class="toastType === 'success' ? 'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-600' : 'bg-red-50 dark:bg-red-900/30 border-red-500 dark:border-red-600'"
      >
        <div class="flex-shrink-0">
          <svg v-if="toastType === 'success'" class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold" :class="toastType === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'">
            {{ toastMessage }}
          </p>
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { useInventoryStore } from '@/stores/inventory'
import { supabase } from '@/services/supabase'

const props = defineProps<{
  isOpen: boolean
  itemCode: string
  itemName: string
  itemColor: string
  itemSize?: string
  warehouseId?: string
  currentBalance: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const transactionStore = useTransactionStore()
const inventoryStore = useInventoryStore()

const isSubmitting = ref(false)
const isReconnecting = ref(false)
const isMobile = ref(false)
const isQuantityFocused = ref(false)
const quantityInputRef = ref<HTMLInputElement | null>(null)
const networkError = ref(false)
const errorMessage = ref('')
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
let toastTimer: ReturnType<typeof setTimeout> | null = null

const localCurrentBalance = ref(props.currentBalance)
const autoVoucher = ref('')
const autoDate = ref('')

const form = ref({
  type: 'IN' as 'IN' | 'OUT',
  quantity: 1,
  party: '',
  notes: ''
})

let submitLocked = false
let retryCount = 0
const MAX_RETRIES = 3

const maxQuantity = computed(() => {
  if (form.value.type === 'OUT') {
    return localCurrentBalance.value
  }
  return 999999
})

const canSubmit = computed(() => {
  return form.value.quantity > 0 &&
         form.value.quantity <= maxQuantity.value &&
         !isSubmitting.value &&
         !isReconnecting.value &&
         (form.value.type !== 'OUT' || form.value.quantity <= localCurrentBalance.value)
})

const showToast = (message: string, type: 'success' | 'error') => {
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
  toastTimer = setTimeout(() => {
    toastVisible.value = false
    toastTimer = null
  }, 4000)
}

const hideToast = () => {
  toastVisible.value = false
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
}

const generateVoucherNumber = (): string => {
  const now = new Date()
  return `TRX-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
}

const regenerateVoucher = () => {
  autoVoucher.value = generateVoucherNumber()
}

const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0]
}

const refreshBalance = async () => {
  try {
    const item = inventoryStore.items.find(i => i.code === props.itemCode && i.warehouseId === props.warehouseId)
    if (item) {
      localCurrentBalance.value = item.remainingQuantity
    } else {
      const { data } = await supabase
        .from('items')
        .select('remaining_quantity')
        .eq('code', props.itemCode)
        .eq('warehouse_id', props.warehouseId)
        .single()
      if (data) localCurrentBalance.value = data.remaining_quantity
    }
  } catch {
    // Silent fail - keep current balance
  }
}

const resetForm = () => {
  form.value = { type: 'IN', quantity: 1, party: '', notes: '' }
  autoVoucher.value = generateVoucherNumber()
  autoDate.value = getCurrentDate()
  networkError.value = false
  retryCount = 0
  errorMessage.value = ''
  hideToast()
}

watch(() => props.isOpen, (open) => {
  if (open) {
    resetForm()
    refreshBalance()
    nextTick(() => {
      quantityInputRef.value?.focus()
      quantityInputRef.value?.select()
    })
  } else {
    hideToast()
  }
})

watch(() => props.currentBalance, (newVal) => {
  localCurrentBalance.value = newVal
})

const setType = (type: 'IN' | 'OUT') => {
  form.value.type = type
  form.value.quantity = 1
}

const decreaseQuantity = () => {
  if (form.value.quantity > 1) form.value.quantity--
}

const increaseQuantity = () => {
  if (form.value.quantity < maxQuantity.value) form.value.quantity++
}

const setMaxQuantity = () => {
  form.value.quantity = maxQuantity.value
}

const retrySubmit = async () => {
  networkError.value = false
  errorMessage.value = ''
  retryCount = 0
  await submit()
}

const submit = async () => {
  if (submitLocked || !canSubmit.value) return

  submitLocked = true
  isSubmitting.value = true
  networkError.value = false
  errorMessage.value = ''
  hideToast()

  try {
    const quantity = Number(form.value.quantity)

    const result = await transactionStore.addTransaction(
      props.itemCode,
      props.itemName,
      props.itemColor,
      autoDate.value,
      form.value.type,
      quantity,
      autoVoucher.value,
      form.value.party,
      form.value.notes,
      props.itemSize,
      props.warehouseId
    )

    if (result.success) {
      showToast(`✅ تم ${form.value.type === 'IN' ? 'إضافة' : 'صرف'} ${quantity} وحدة بنجاح (الإذن: ${autoVoucher.value})`, 'success')
      await refreshBalance()
      resetForm()
      isSubmitting.value = false
      submitLocked = false
      emit('success')
    } else {
      showToast(result.message || 'حدث خطأ أثناء إضافة الحركة', 'error')
      isSubmitting.value = false
      submitLocked = false
    }
  } catch (error: any) {
    if (error.message?.includes('network') || error.message?.includes('timeout') || error.message?.includes('Failed to fetch')) {
      networkError.value = true
      retryCount++

      if (retryCount < MAX_RETRIES) {
        isReconnecting.value = true
        errorMessage.value = `⚠️ انقطع الاتصال بالشبكة. جاري إعادة المحاولة (${retryCount}/${MAX_RETRIES})...`
        await new Promise(resolve => setTimeout(resolve, 2000))
        isReconnecting.value = false
        await submit()
        return
      } else {
        showToast('❌ فشلت محاولات الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.', 'error')
        isReconnecting.value = false
      }
    } else {
      showToast(error.message || 'حدث خطأ غير متوقع', 'error')
    }

    isSubmitting.value = false
    submitLocked = false
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const close = () => {
  if (!isSubmitting.value && !isReconnecting.value) {
    hideToast()
    emit('close')
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
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

:global(body.modal-open) { overflow: hidden; }
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type="number"] { -moz-appearance: textfield; appearance: textfield; }
input:focus { outline: none; }
button { touch-action: manipulation; }
@media (max-width: 768px) {
  input, select, textarea, button { font-size: 16px !important; }
}
</style>