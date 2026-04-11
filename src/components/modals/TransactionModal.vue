<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50" @click.self="close">
      <!-- Modal Container - Full width on mobile, centered on desktop -->
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
          <!-- Item Info Card -->
          <div class="mb-5 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-500 dark:text-gray-400">الرصيد الحالي:</span>
                <span class="font-bold text-green-600 dark:text-green-400 block text-lg">{{ props.currentBalance }} وحدة</span>
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
                  @click="form.type = 'IN'"
                  :class="[
                    'px-4 py-3 rounded-xl font-semibold transition-all duration-200',
                    form.type === 'IN' 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  ]"
                >
                  <svg class="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  وارد (إضافة)
                </button>
                <button 
                  type="button"
                  @click="form.type = 'OUT'"
                  :class="[
                    'px-4 py-3 rounded-xl font-semibold transition-all duration-200',
                    form.type === 'OUT' 
                      ? 'bg-orange-600 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  ]"
                >
                  <svg class="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  منصرف (صرف)
                </button>
              </div>
            </div>

            <!-- Date -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                التاريخ <span class="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                v-model="form.date" 
                class="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required 
              />
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

            <!-- Voucher Number -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                رقم الإذن
              </label>
              <input 
                type="text" 
                v-model="form.voucher" 
                placeholder="مثال: INV-001"
                class="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
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
            <div v-if="form.type === 'OUT' && form.quantity > props.currentBalance" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
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
                :disabled="isSubmitting || (form.type === 'OUT' && form.quantity > props.currentBalance)"
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
  (e: 'success', data: any): void
}>()

const isSubmitting = ref(false)
const isMobile = ref(false)

const form = ref({
  type: 'IN' as 'IN' | 'OUT',
  date: new Date().toISOString().split('T')[0],
  quantity: 1,
  voucher: '',
  party: '',
  notes: ''
})

const maxQuantity = computed(() => {
  if (form.value.type === 'OUT') {
    return props.currentBalance
  }
  return 999999
})

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

// Check if device is mobile
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
  if (form.value.type === 'OUT' && form.value.quantity > props.currentBalance) {
    alert('الكمية المطلوبة أكبر من الرصيد المتاح')
    return
  }

  isSubmitting.value = true
  try {
    emit('success', {
      type: form.value.type,
      date: form.value.date,
      quantity: form.value.quantity,
      voucher: form.value.voucher,
      party: form.value.party,
      notes: form.value.notes
    })
    close()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    isSubmitting.value = false
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    form.value = {
      type: 'IN',
      date: new Date().toISOString().split('T')[0],
      quantity: 1,
      voucher: '',
      party: '',
      notes: ''
    }
  }
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

/* Prevent body scroll when modal is open */
:global(body.modal-open) {
  overflow: hidden;
}

/* Custom number input styling */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 0.5;
}

/* Touch-friendly button sizes */
button {
  min-height: 44px;
  touch-action: manipulation;
}

/* Better touch targets on mobile */
@media (max-width: 768px) {
  input, select, textarea, button {
    font-size: 16px !important;
  }
}
</style>