<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" @click.self="closeModal">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 px-6 py-4 rounded-t-2xl flex-shrink-0">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-white">صرف أصناف للفروع</h2>
            <button @click="closeModal" class="text-white hover:text-gray-200 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="text-red-100 text-sm mt-1">اختر المخزن، الوجهة، الصنف، ثم الكمية</p>
        </div>

        <!-- Network Status -->
        <div v-if="networkError" class="bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 px-6 py-2 text-center">
          <p class="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            ⚠️ انقطع الاتصال بالشبكة. جاري إعادة المحاولة...
          </p>
        </div>

        <!-- No Permission -->
        <div v-if="!canDispatch" class="p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">وصول مقيد</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">ليس لديك صلاحية لصرف الأصناف</p>
          <button @click="closeModal" class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">إغلاق</button>
        </div>

        <template v-else>
          <div class="p-6 space-y-5 overflow-y-auto flex-1 relative">
            <!-- Source Warehouse -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span class="inline-block w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-center leading-6 text-sm ml-2">1</span>
                المخزن المصدر
              </label>
              <select
                v-model="sourceWarehouseId"
                @change="onSourceWarehouseChange"
                :disabled="isSubmitting || isReconnecting"
                class="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 min-h-[44px]"
              >
                <option value="">اختر المخزن المصدر</option>
                <option v-for="w in accessiblePrimaryWarehouses" :key="w.id" :value="w.id">
                  {{ w.name_ar || w.name }}
                </option>
              </select>
            </div>

            <!-- Destination Warehouse -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span class="inline-block w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-center leading-6 text-sm ml-2">2</span>
                المخزن الوجهة
              </label>
              <select
                v-model="destinationWarehouseId"
                :disabled="!sourceWarehouseId || isSubmitting || isReconnecting"
                class="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 min-h-[44px]"
              >
                <option value="">اختر المخزن الوجهة</option>
                <option v-for="w in accessibleDispatchWarehouses" :key="w.id" :value="w.id">
                  {{ w.name_ar || w.name }}
                </option>
              </select>
            </div>

            <!-- Item Selection -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span class="inline-block w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-center leading-6 text-sm ml-2">3</span>
                الصنف
              </label>

              <input
                v-model="searchQuery"
                type="text"
                placeholder="ابحث بالاسم أو الكود..."
                :disabled="!sourceWarehouseId || isSubmitting || isReconnecting"
                @input="onSearchInput"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 min-h-[44px]"
              />

              <div v-if="alreadyProcessed" class="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
                <p class="text-sm font-bold text-yellow-700 dark:text-yellow-300">⚠️ تم معالجة هذه العملية مسبقاً</p>
                <p class="text-xs text-yellow-600 dark:text-yellow-400">الكمية تم خصمها بالفعل</p>
              </div>

              <!-- Loading/Reconnecting Overlay -->
              <div v-if="isReconnecting" class="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent mx-auto mb-3"></div>
                <p class="text-sm font-semibold text-gray-600 dark:text-gray-400">جاري إعادة الاتصال...</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">سيتم استعادة اختياراتك تلقائياً</p>
              </div>

              <!-- Item List -->
              <div v-else class="border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                <div
                  v-for="item in displayItems"
                  :key="item.id"
                  @click="selectItem(item)"
                  :class="[
                    'p-3 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-700',
                    selectedItem?.id === item.id
                      ? 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 shadow-inner'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-red-200 dark:hover:border-red-800',
                    isSubmitting ? 'pointer-events-none opacity-50' : ''
                  ]"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="font-medium text-gray-800 dark:text-white" :class="{ 'text-red-700 dark:text-red-400': selectedItem?.id === item.id }">
                        {{ item.name }}
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        الكود: {{ item.code }} | اللون: {{ item.color || '—' }}
                      </div>
                      <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {{ item.cartonsCount }} كرتون × {{ item.perCartonCount }} + {{ item.singleBottlesCount }} فردي
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-bold text-red-600 dark:text-red-400">{{ item.remainingQuantity }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">متاح</div>
                    </div>
                  </div>
                  <!-- ✅ Selection indicator -->
                  <div v-if="selectedItem?.id === item.id" class="mt-1 text-right">
                    <span class="text-xs font-bold text-red-600 dark:text-red-400">✓ تم الاختيار</span>
                  </div>
                </div>
                <div v-if="displayItems.length === 0 && sourceWarehouseId && !isSubmitting && !isSearching" class="p-8 text-center text-gray-500 dark:text-gray-400">
                  <span v-if="searchQuery && searchQuery.length >= 2">لا توجد نتائج مطابقة للبحث</span>
                  <span v-else>لا توجد أصناف في هذا المخزن</span>
                </div>
                <div v-if="isSearching" class="p-8 text-center text-gray-500 dark:text-gray-400">
                  <div class="animate-spin rounded-full h-6 w-6 border-2 border-red-500 border-t-transparent inline-block mx-auto"></div>
                  <span class="mr-2">جاري البحث...</span>
                </div>
                <div v-if="!sourceWarehouseId" class="p-8 text-center text-gray-500 dark:text-gray-400">
                  يرجى اختيار المخزن أولاً
                </div>
              </div>
            </div>

            <!-- ✅ Quantity with Highlight on Focus -->
            <div v-if="selectedItem">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span class="inline-block w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-center leading-6 text-sm ml-2">4</span>
                الكمية
              </label>

              <div class="flex items-center gap-3">
                <button
                  @click="decreaseQuantity"
                  :disabled="quantity <= 1 || isSubmitting || isReconnecting"
                  class="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                
                <!-- ✅ Quantity Input with Highlight on Focus -->
                <input
                  ref="quantityInputRef"
                  v-model.number="quantity"
                  type="number"
                  :max="selectedItem.remainingQuantity"
                  min="1"
                  :disabled="isSubmitting || isReconnecting"
                  @input="validateQuantity"
                  @focus="onQuantityFocus"
                  @blur="onQuantityBlur"
                  class="flex-1 text-center text-xl font-bold py-3 border-2 rounded-lg focus:ring-4 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 min-h-[52px]"
                  :class="{
                    'border-red-500 ring-4 ring-red-500/30 shadow-lg shadow-red-500/20': isQuantityFocused,
                    'border-gray-300 dark:border-gray-600': !isQuantityFocused
                  }"
                />
                
                <button
                  @click="increaseQuantity"
                  :disabled="quantity >= selectedItem.remainingQuantity || isSubmitting || isReconnecting"
                  class="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <div class="flex justify-between items-center mt-2">
                <button
                  @click="setMaxQuantity"
                  :disabled="isSubmitting || isReconnecting"
                  class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline transition-colors disabled:opacity-50"
                >
                  استخدام الكل ({{ selectedItem.remainingQuantity }})
                </button>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  الحد الأقصى: {{ selectedItem.remainingQuantity }}
                </span>
              </div>

              <div v-if="selectedItem.perCartonCount" class="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div class="text-sm text-gray-600 dark:text-gray-400">تفصيل الكمية:</div>
                <div class="text-sm font-medium text-gray-800 dark:text-white">
                  {{ Math.floor(quantity / selectedItem.perCartonCount) }} كرتون × {{ selectedItem.perCartonCount }}
                  + {{ quantity % selectedItem.perCartonCount }} فردي
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  الإجمالي: {{ quantity }} وحدة
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
              <button 
                v-if="networkError" 
                @click="retryDispatch" 
                class="mt-2 text-sm font-bold text-red-600 dark:text-red-400 hover:underline"
              >
                ↻ إعادة المحاولة
              </button>
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="bg-green-50 dark:bg-green-900/30 border border-green-500 dark:border-green-600 rounded-lg p-3">
              <p class="text-sm text-green-700 dark:text-green-400 font-semibold">{{ successMessage }}</p>
            </div>
          </div>

          <!-- Footer - Centered Buttons -->
          <div class="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 rounded-b-2xl flex-shrink-0">
            <button
              @click="closeModal"
              :disabled="isSubmitting || isReconnecting"
              class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 text-center min-h-[48px] flex items-center justify-center"
            >
              إلغاء
            </button>
            <button
              @click="submitDispatch"
              :disabled="!canSubmit || isSubmitting || isReconnecting"
              class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md text-center min-h-[48px] flex items-center justify-center"
            >
              <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الصرف...
              </span>
              <span v-else-if="isReconnecting">جاري إعادة الاتصال...</span>
              <span v-else>تأكيد الصرف</span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useWarehouseStore } from '@/stores/warehouse'
import { useInventoryStore } from '@/stores/inventory'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ isOpen: boolean }>()

const emit = defineEmits<{ 
  (e: 'close'): void
  (e: 'success'): void 
}>()

const warehouseStore = useWarehouseStore()
const inventoryStore = useInventoryStore()
const authStore = useAuthStore()

// Form State
const sourceWarehouseId = ref('')
const destinationWarehouseId = ref('')
const selectedItem = ref<any>(null)
const searchQuery = ref('')
const quantity = ref(1)

// UI State
const isSubmitting = ref(false)
const isReconnecting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isSearching = ref(false)
const alreadyProcessed = ref(false)
const networkError = ref(false)
const displayItems = ref<any[]>([])
const isQuantityFocused = ref(false)
const quantityInputRef = ref<HTMLInputElement | null>(null)

// Internal flags
let submitLocked = false
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
let retryCount = 0
const MAX_RETRIES = 3

// Computed
const canDispatch = computed(() => authStore.canEdit)

const generateVoucherNumber = (): string => {
  const now = new Date()
  return `DSP-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
}

const generateTransactionId = (): string => {
  return `dsp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const getDestinationWarehouseName = (): string => {
  const warehouse = warehouseStore.warehouses.find(w => w.id === destinationWarehouseId.value)
  return warehouse?.name_ar || warehouse?.name || 'غير معروف'
}

// ✅ Quantity focus handlers
const onQuantityFocus = () => {
  isQuantityFocused.value = true
}

const onQuantityBlur = () => {
  isQuantityFocused.value = false
}

// Focus quantity input when item is selected
watch(selectedItem, (newItem) => {
  if (newItem) {
    nextTick(() => {
      quantityInputRef.value?.focus()
      quantityInputRef.value?.select()
    })
  }
})

const accessiblePrimaryWarehouses = computed(() => {
  if (authStore.isSuperAdmin || authStore.isCompanyManager) {
    return warehouseStore.primaryWarehouses || []
  }
  if (authStore.isWarehouseManager) {
    const allowed = authStore.allowedWarehouses
    if (allowed.includes('all')) return warehouseStore.primaryWarehouses || []
    return (warehouseStore.primaryWarehouses || []).filter(w => allowed.includes(w.id))
  }
  return []
})

const accessibleDispatchWarehouses = computed(() => {
  if (authStore.isSuperAdmin || authStore.isCompanyManager) {
    return warehouseStore.dispatchWarehouses || []
  }
  if (authStore.isWarehouseManager) {
    const allowed = authStore.allowedDispatchWarehouses
    if (allowed.includes('all')) return warehouseStore.dispatchWarehouses || []
    return (warehouseStore.dispatchWarehouses || []).filter(w => allowed.includes(w.id))
  }
  return []
})

const canSubmit = computed(() => {
  return sourceWarehouseId.value && 
         destinationWarehouseId.value && 
         selectedItem.value &&
         quantity.value > 0 && 
         quantity.value <= selectedItem.value.remainingQuantity && 
         !isSubmitting.value &&
         !isReconnecting.value &&
         canDispatch.value &&
         !alreadyProcessed.value
})

// Data Loading
const loadInitialItems = () => {
  if (!sourceWarehouseId.value) {
    displayItems.value = []
    return
  }
  const allItems = Array.from(inventoryStore.itemsMap.values())
  const warehouseItems = allItems.filter(item => 
    item.warehouseId === sourceWarehouseId.value && 
    item.remainingQuantity > 0
  )
  displayItems.value = warehouseItems.slice(0, 50)
}

const performSearch = async () => {
  if (!sourceWarehouseId.value) {
    displayItems.value = []
    return
  }

  const query = searchQuery.value.trim()
  
  if (!query || query.length < 2) {
    loadInitialItems()
    return
  }

  isSearching.value = true
  try {
    const results = await inventoryStore.searchInventorySpark({
      searchQuery: query,
      warehouseId: sourceWarehouseId.value,
      limit: 50
    })
    displayItems.value = results || []
  } catch (err) {
    console.error('Search error:', err)
    displayItems.value = []
  } finally {
    isSearching.value = false
  }
}

// Event Handlers
const onSearchInput = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  searchDebounceTimer = setTimeout(() => {
    performSearch()
  }, 400)
}

const onSourceWarehouseChange = () => {
  selectedItem.value = null
  destinationWarehouseId.value = ''
  searchQuery.value = ''
  quantity.value = 1
  errorMessage.value = ''
  successMessage.value = ''
  alreadyProcessed.value = false
  networkError.value = false
  retryCount = 0
  loadInitialItems()
}

const validateQuantity = () => {
  if (!selectedItem.value) return
  if (quantity.value > selectedItem.value.remainingQuantity) {
    quantity.value = selectedItem.value.remainingQuantity
  }
  if (quantity.value < 1) {
    quantity.value = 1
  }
}

const increaseQuantity = () => {
  if (selectedItem.value && quantity.value < selectedItem.value.remainingQuantity) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const setMaxQuantity = () => {
  quantity.value = selectedItem.value?.remainingQuantity || 1
}

const selectItem = (item: any) => {
  selectedItem.value = item
  quantity.value = 1
  errorMessage.value = ''
  successMessage.value = ''
  alreadyProcessed.value = false
}

const clearSuccessMessage = () => {
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const retryDispatch = async () => {
  networkError.value = false
  errorMessage.value = ''
  retryCount = 0
  await submitDispatch()
}

const submitDispatch = async () => {
  if (submitLocked || !canSubmit.value) return
  
  const transactionId = generateTransactionId()
  
  submitLocked = true
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  alreadyProcessed.value = false
  networkError.value = false

  try {
    const perCarton = selectedItem.value.perCartonCount || 12
    const cartonsToDispatch = Math.floor(quantity.value / perCarton)
    const singlesToDispatch = quantity.value % perCarton
    const destinationName = getDestinationWarehouseName()
    const voucherNumber = generateVoucherNumber()

    const result = await inventoryStore.dispatchItem({
      item_id: selectedItem.value.id,
      from_warehouse_id: sourceWarehouseId.value,
      destination: destinationName,
      destination_id: voucherNumber,
      quantity: quantity.value,
      cartons_count: cartonsToDispatch,
      single_bottles_count: singlesToDispatch,
      notes: `صرف ${quantity.value} وحدة إلى ${destinationName} - الإذن: ${voucherNumber}`,
      transaction_id: transactionId
    })

    if (result.alreadyProcessed) {
      alreadyProcessed.value = true
      successMessage.value = `⚠️ تم معالجة هذه العملية مسبقاً (تم خصم ${quantity.value} وحدة بالفعل)`
      clearSuccessMessage()
      isSubmitting.value = false
      submitLocked = false
      emit('success')
      return
    }

    if (result.success) {
      successMessage.value = `✅ تم صرف ${quantity.value} وحدة بنجاح (الإذن: ${voucherNumber})`
      clearSuccessMessage()
      isSubmitting.value = false
      submitLocked = false
      selectedItem.value = null
      quantity.value = 1
      searchQuery.value = ''
      retryCount = 0
      nextTick(() => loadInitialItems())
      emit('success')
    } else {
      errorMessage.value = result.message || 'فشل في عملية الصرف'
      isSubmitting.value = false
      submitLocked = false
      setTimeout(() => { errorMessage.value = '' }, 5000)
    }
  } catch (error: any) {
    console.error('Dispatch error:', error)
    
    if (error.message?.includes('network') || error.message?.includes('timeout') || error.message?.includes('Failed to fetch')) {
      networkError.value = true
      retryCount++
      
      if (retryCount < MAX_RETRIES) {
        isReconnecting.value = true
        errorMessage.value = `⚠️ انقطع الاتصال بالشبكة. جاري إعادة المحاولة (${retryCount}/${MAX_RETRIES})...`
        
        await new Promise(resolve => setTimeout(resolve, 2000))
        isReconnecting.value = false
        
        await submitDispatch()
        return
      } else {
        errorMessage.value = '❌ فشلت محاولات الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.'
        isReconnecting.value = false
      }
    } else {
      errorMessage.value = error.message || 'حدث خطأ أثناء الصرف'
    }
    
    isSubmitting.value = false
    submitLocked = false
    setTimeout(() => { 
      if (!networkError.value) {
        errorMessage.value = '' 
      }
    }, 5000)
  }
}

const resetForm = () => {
  sourceWarehouseId.value = ''
  destinationWarehouseId.value = ''
  selectedItem.value = null
  searchQuery.value = ''
  quantity.value = 1
  errorMessage.value = ''
  successMessage.value = ''
  alreadyProcessed.value = false
  networkError.value = false
  isReconnecting.value = false
  displayItems.value = []
  submitLocked = false
  isSubmitting.value = false
  retryCount = 0
  isQuantityFocused.value = false
}

const closeModal = () => {
  if (!isSubmitting.value && !isReconnecting.value) {
    resetForm()
    emit('close')
  }
}

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    retryCount = 0
    networkError.value = false
    isReconnecting.value = false
    await warehouseStore.fetchWarehouses()
    resetForm()
    sourceWarehouseId.value = ''
    displayItems.value = []
  }
})

watch(sourceWarehouseId, () => {
  loadInitialItems()
})
</script>

<style scoped>
select {
  width: auto !important;
  min-width: 200px;
  max-width: 100%;
}

.bg-gray-50 {
  position: relative;
  z-index: 10;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ✅ Remove number input arrows */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* ✅ Focus highlight animation */
input:focus {
  outline: none;
}
</style>