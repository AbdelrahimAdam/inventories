<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-[10000] overflow-y-auto"
      @click.self="handleClose"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>

      <!-- Modal -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div 
          class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white">تأكيد الحذف</h3>
                  <p class="text-red-100 text-sm">هذا الإجراء لا يمكن التراجع عنه</p>
                </div>
              </div>
              <button 
                @click="handleClose"
                class="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="إغلاق"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <!-- Invoice Summary -->
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400">رقم الفاتورة</p>
                  <p class="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{{ invoice?.invoice_number || '—' }}</p>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400">التاريخ</p>
                  <p class="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{{ formattedDate }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400">العميل</p>
                  <p class="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{{ invoice?.customer?.name || '—' }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ invoice?.customer?.phone || '' }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400">إجمالي الفاتورة</p>
                  <p class="text-sm font-bold text-green-600 dark:text-green-400 mt-0.5">{{ formattedTotal }}</p>
                </div>
              </div>
            </div>

            <!-- Items Summary -->
            <div v-if="invoice?.items && invoice.items.length > 0" class="mb-6">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  الأصناف ({{ invoice.items.length }})
                </p>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  إجمالي الوحدات: {{ totalItemsQuantity }}
                </span>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 max-h-32 overflow-y-auto">
                <div 
                  v-for="item in invoice.items" 
                  :key="item.item_id || item.id"
                  class="flex justify-between items-center py-1.5 border-b border-gray-200 dark:border-gray-600 last:border-0"
                >
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 dark:text-white truncate">{{ item.name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.code }}</p>
                  </div>
                  <div class="text-right flex-shrink-0 mr-3">
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ item.quantity }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">وحدة</p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatCurrency(item.unit_price) }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">سعر</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Warning Message -->
            <div v-if="hasUnknownWarehouse" class="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-xs text-yellow-700 dark:text-yellow-300">
                  ⚠️ بعض الأصناف ليس لها مخزن محدد. سيتم حذفها بدون إرجاع المخزون.
                </p>
              </div>
            </div>

            <!-- Options -->
            <div>
              <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">اختر خيار الحذف</p>
              <div class="space-y-2.5">
                <!-- With Return Option -->
                <label 
                  class="flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
                  :class="[
                    selectedOption === 'with_return' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  ]"
                >
                  <input 
                    type="radio" 
                    name="deleteOption" 
                    value="with_return"
                    v-model="selectedOption"
                    class="mt-1 w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span class="text-sm font-bold text-gray-900 dark:text-white">حذف مع إرجاع الكميات</span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mr-6">
                      سيتم إرجاع جميع الأصناف إلى المخازن
                    </p>
                    <p v-if="selectedOption === 'with_return'" class="text-xs text-green-600 dark:text-green-400 mt-1 mr-6 font-medium">
                      ✓ سيتم إرجاع {{ totalItemsQuantity }} وحدة إلى {{ uniqueWarehousesCount }} مخزن
                    </p>
                  </div>
                </label>

                <!-- Without Return Option -->
                <label 
                  class="flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
                  :class="[
                    selectedOption === 'without_return' 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  ]"
                >
                  <input 
                    type="radio" 
                    name="deleteOption" 
                    value="without_return"
                    v-model="selectedOption"
                    class="mt-1 w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span class="text-sm font-bold text-gray-900 dark:text-white">حذف بدون إرجاع الكميات</span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mr-6">
                      سيتم حذف الفاتورة فقط، تبقى الكميات كما هي
                    </p>
                    <p v-if="selectedOption === 'without_return'" class="text-xs text-red-600 dark:text-red-400 mt-1 mr-6 font-medium">
                      ⚠️ سيتم حذف {{ totalItemsQuantity }} وحدة بدون إرجاع
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 rounded-b-2xl">
            <button
              @click="handleClose"
              :disabled="isProcessing"
              class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 min-h-[48px]"
            >
              إلغاء
            </button>
            <button
              @click="handleDelete"
              :disabled="isProcessing"
              class="flex-1 px-4 py-2.5 rounded-xl transition-all font-bold text-white disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
              :class="[
                selectedOption === 'with_return' 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md shadow-green-600/20' 
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md shadow-red-600/20'
              ]"
            >
              <span v-if="isProcessing" class="flex items-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الحذف...
              </span>
              <span v-else>
                {{ selectedOption === 'with_return' ? 'حذف مع الإرجاع' : 'حذف بدون إرجاع' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface InvoiceItem {
  id?: string
  item_id?: string
  name: string
  code: string
  quantity: number
  unit_price: number
  total: number
  warehouse_id?: string
  size?: string
  color?: string
}

interface Invoice {
  id: string
  invoice_number: string
  customer: {
    name: string
    phone: string
    email?: string
    address?: string
    tax_number?: string
  }
  items: InvoiceItem[]
  total_amount: number
  currency?: string
  invoice_date?: Date | string
}

interface Props {
  isOpen: boolean
  invoice: Invoice | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'delete', data: { invoiceId: string; returnItems: boolean }): void
}>()

const selectedOption = ref<'with_return' | 'without_return'>('with_return')
const isProcessing = ref(false)

// Reset selection when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    selectedOption.value = 'with_return'
    isProcessing.value = false
  }
})

const formattedDate = computed(() => {
  if (!props.invoice?.invoice_date) return '—'
  const date = new Date(props.invoice.invoice_date)
  return date.toLocaleDateString('ar-EG', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
})

const formattedTotal = computed(() => {
  if (!props.invoice) return '—'
  const currency = props.invoice.currency || 'EGP'
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(props.invoice.total_amount || 0)
})

const totalItemsQuantity = computed(() => {
  if (!props.invoice?.items) return 0
  return props.invoice.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
})

const uniqueWarehousesCount = computed(() => {
  if (!props.invoice?.items) return 0
  const warehouses = new Set<string>()
  props.invoice.items.forEach(item => {
    if (item.warehouse_id) {
      warehouses.add(item.warehouse_id)
    }
  })
  return warehouses.size
})

const hasUnknownWarehouse = computed(() => {
  if (!props.invoice?.items) return false
  return props.invoice.items.some(item => !item.warehouse_id)
})

const formatCurrency = (value: number): string => {
  if (!value) return '0.00'
  const currency = props.invoice?.currency || 'EGP'
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const handleClose = (): void => {
  if (!isProcessing.value) {
    emit('close')
  }
}

const handleDelete = async (): Promise<void> => {
  if (isProcessing.value || !props.invoice) return
  
  isProcessing.value = true
  
  try {
    emit('delete', {
      invoiceId: props.invoice.id,
      returnItems: selectedOption.value === 'with_return'
    })
  } catch (error) {
    console.error('Delete error:', error)
    isProcessing.value = false
  }
}
</script>

<style scoped>
/* Ensure smooth animations */
.fixed.inset-0 {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Custom scrollbar for items list */
.max-h-32::-webkit-scrollbar {
  width: 4px;
}

.max-h-32::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-32::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.dark .max-h-32::-webkit-scrollbar-thumb {
  background: #475569;
}

/* Radio button styling */
input[type="radio"] {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

input[type="radio"]:checked {
  border-color: transparent;
}

input[type="radio"][value="with_return"]:checked {
  background-color: #22c55e;
  border-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

input[type="radio"][value="without_return"]:checked {
  background-color: #ef4444;
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

input[type="radio"]:checked::after {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  margin: 4px auto;
}

.dark input[type="radio"] {
  border-color: #4b5563;
}

.dark input[type="radio"][value="with_return"]:checked {
  background-color: #22c55e;
  border-color: #22c55e;
}

.dark input[type="radio"][value="without_return"]:checked {
  background-color: #ef4444;
  border-color: #ef4444;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .max-w-md {
    margin: 1rem;
  }
  
  .grid-cols-2 {
    gap: 0.75rem;
  }
}
</style>