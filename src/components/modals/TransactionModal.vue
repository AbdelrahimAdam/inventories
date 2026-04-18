<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50" @click.self="close">
      <div class="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md md:max-w-lg transition-all duration-300 transform animate-slide-up" :class="isMobile ? 'max-h-[90vh]' : 'max-h-[85vh]'">

        <!-- Fixed Header -->
        <div class="sticky top-0 bg-white dark:bg-gray-800 px-5 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl z-10">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">إضافة حركة</h2>
            <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="overflow-y-auto p-5" :class="isMobile ? 'max-h-[calc(90vh-120px)]' : 'max-h-[calc(85vh-120px)]'">
          <!-- Item Info Card (balance updates dynamically) -->
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
                  :class="[
                    'px-4 py-3 rounded-xl font-semibold transition-all duration-200',
                    form.type === 'IN' 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  ]"
                >
                  وارد (إضافة)
                </button>
                <button 
                  type="button"
                  @click="setType('OUT')"
                  :class="[
                    'px-4 py-3 rounded-xl font-semibold transition-all duration-200',
                    form.type === 'OUT' 
                      ? 'bg-orange-600 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  ]"
                >
                  منصرف (صرف)
                </button>
              </div>
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
                  :disabled="form.quantity <= 1"
                  class="w-12 h-12 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg class="w-6 h-6 mx-auto text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <input 
                  type="number" 
                  v-model.number="form.quantity" 
                  :max="maxQuantity"
                  min="1"
                  class="flex-1 text-center text-xl font-bold py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required 
                />
                <button 
                  type="button"
                  @click="increaseQuantity"
                  :disabled="form.quantity >= maxQuantity"
                  class="w-12 h-12 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg class="w-6 h-6 mx-auto text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div class="text-center mt-2">
                <button 
                  type="button"
                  @click="setMaxQuantity"
                  class="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  استخدام الكل ({{ maxQuantity }})
                </button>
              </div>
            </div>

            <!-- Party -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                الجهة
              </label>
              <input 
                type="text" 
                v-model="form.party" 
                placeholder="اسم العميل أو الجهة"
                class="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                ملاحظات
              </label>
              <textarea 
                v-model="form.notes" 
                rows="3" 
                placeholder="أي ملاحظات إضافية..."
                class="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              ></textarea>
            </div>

            <!-- Warning for OUT transactions -->
            <div v-if="form.type === 'OUT' && form.quantity > localCurrentBalance" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                الكمية المطلوبة أكبر من الرصيد المتاح!
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
              <button 
                type="button" 
                @click="close" 
                class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
              <button 
                type="submit" 
                :disabled="isSubmitting || (form.type === 'OUT' && form.quantity > localCurrentBalance) || form.quantity < 1"
                class="flex-1 px-4 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحفظ...
                </span>
                <span v-else>تأكيد الحركة</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { useInventoryStore } from '@/stores/inventory'

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
const isMobile = ref(false)

// Local reactive balance (updates after each transaction)
const localCurrentBalance = ref(props.currentBalance)

// Auto-generated values (not shown in UI)
const autoVoucher = ref('')
const autoDate = ref('')

// Form data (only type, quantity, party, notes are user-editable)
const form = ref({
  type: 'IN' as 'IN' | 'OUT',
  quantity: 1,
  party: '',
  notes: ''
})

const maxQuantity = computed(() => {
  if (form.value.type === 'OUT') {
    return localCurrentBalance.value
  }
  return 999999
})

// Helper to generate unique voucher number
const generateVoucherNumber = (): string => {
  const now = new Date()
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') + '-' +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0') +
    Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `TRX-${timestamp}`
}

const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0]
}

// Refresh the displayed balance from the inventory store (after successful transaction)
const refreshBalance = async () => {
  try {
    // Find the item in the local store
    const item = inventoryStore.items.find(i => i.code === props.itemCode && i.warehouseId === props.warehouseId)
    if (item) {
      localCurrentBalance.value = item.remainingQuantity
    } else {
      // Fallback: fetch directly from DB (rare)
      const { data } = await supabase
        .from('items')
        .select('remaining_quantity')
        .eq('code', props.itemCode)
        .eq('warehouse_id', props.warehouseId)
        .single()
      if (data) localCurrentBalance.value = data.remaining_quantity
    }
  } catch (err) {
    console.error('Failed to refresh balance', err)
  }
}

// Reset form to default values (keep modal open)
const resetForm = () => {
  form.value = {
    type: 'IN',
    quantity: 1,
    party: '',
    notes: ''
  }
  autoVoucher.value = generateVoucherNumber()
  autoDate.value = getCurrentDate()
}

const setType = (type: 'IN' | 'OUT') => {
  form.value.type = type
  form.value.quantity = 1 // reset quantity when type changes
}

const decreaseQuantity = () => {
  if (form.value.quantity > 1) {
    form.value.quantity--
  }
}

const increaseQuantity = () => {
  if (form.value.quantity < maxQuantity.value) {
    form.value.quantity++
  }
}

const setMaxQuantity = () => {
  form.value.quantity = maxQuantity.value
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const close = () => {
  if (!isSubmitting.value) {
    emit('close')
  }
}

const submit = async () => {
  if (isSubmitting.value) return
  if (form.value.type === 'OUT' && form.value.quantity > localCurrentBalance.value) {
    alert('الكمية المطلوبة أكبر من الرصيد المتاح')
    return
  }
  if (form.value.quantity < 1) {
    alert('الكمية يجب أن تكون أكبر من صفر')
    return
  }

  isSubmitting.value = true

  try {
    const result = await transactionStore.addTransaction(
      props.itemCode,
      props.itemName,
      props.itemColor,
      autoDate.value,               // auto-generated date
      form.value.type,
      form.value.quantity,
      autoVoucher.value,           // auto-generated voucher
      form.value.party,
      form.value.notes,
      props.itemSize,
      props.warehouseId
    )

    if (result.success) {
      alert('تم إضافة الحركة بنجاح')
      
      // Refresh the balance (optimistic update already changed it in store)
      await refreshBalance()
      
      // Reset the form fields for the next transaction
      resetForm()
      
      // Notify parent that a transaction succeeded (parent may refresh list if needed)
      emit('success')
      // Do NOT close the modal – stay open for next transaction
    } else {
      alert(result.message || 'حدث خطأ أثناء إضافة الحركة')
    }
  } catch (error: any) {
    console.error('Transaction error:', error)
    alert(error.message || 'حدث خطأ غير متوقع')
  } finally {
    isSubmitting.value = false
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    resetForm()
    refreshBalance() // get latest balance when modal opens
  }
})

watch(() => props.currentBalance, (newVal) => {
  localCurrentBalance.value = newVal
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
:global(body.modal-open) {
  overflow: hidden;
}
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 0.5;
}
button {
  min-height: 44px;
  touch-action: manipulation;
}
@media (max-width: 768px) {
  input, select, textarea, button {
    font-size: 16px !important;
  }
}
</style>
