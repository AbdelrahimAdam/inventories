<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" @click.self="closeModal">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <!-- Header - Fixed at top -->
        <div class="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 px-6 py-4 rounded-t-2xl flex-shrink-0">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-white">صرف أصناف للفروع</h2>
            <button @click="closeModal" class="text-white hover:text-gray-200 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="text-green-100 text-sm mt-1">اختر المخزن، الوجهة، الصنف، ثم الكمية</p>
        </div>

        <!-- Permission Denied Message -->
        <div v-if="!canDispatch" class="p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">وصول مقيد</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            ليس لديك صلاحية لصرف الأصناف. يرجى التواصل مع مدير النظام.
          </p>
          <button
            @click="closeModal"
            class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>

        <!-- Main Content -->
        <template v-else>
          <!-- Content - Scrollable middle section -->
          <div class="p-6 space-y-5 overflow-y-auto flex-1">
            <!-- Step 1: Source Warehouse -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span class="inline-block w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-center leading-6 text-sm ml-2">1</span>
                المخزن المصدر
              </label>
              <select
                v-model="sourceWarehouseId"
                @change="onSourceWarehouseChange"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">اختر المخزن المصدر</option>
                <option v-for="w in accessiblePrimaryWarehouses" :key="w.id" :value="w.id">
                  {{ w.name_ar || w.name }}
                </option>
              </select>
            </div>

            <!-- Step 2: Destination -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span class="inline-block w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-center leading-6 text-sm ml-2">2</span>
                الوجهة
              </label>
              <select
                v-model="destinationId"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                :disabled="!sourceWarehouseId"
              >
                <option value="">اختر الوجهة</option>
                <option v-for="w in accessibleDispatchWarehouses" :key="w.id" :value="w.id">
                  {{ w.name_ar || w.name }}
                </option>
              </select>
            </div>

            <!-- Step 3: Item Selection -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span class="inline-block w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-center leading-6 text-sm ml-2">3</span>
                الصنف
              </label>

              <!-- Search Input -->
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ابحث بالاسم أو الكود..."
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                :disabled="!sourceWarehouseId"
              />

              <!-- Items List -->
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                <div
                  v-for="item in filteredItems"
                  :key="item.id"
                  @click="selectItem(item)"
                  :class="[
                    'p-3 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700',
                    selectedItem?.id === item.id
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  ]"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="font-medium text-gray-800 dark:text-white">{{ item.name }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        الكود: {{ item.code }} | اللون: {{ item.color || '—' }}
                      </div>
                      <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {{ item.cartonsCount }} كرتون × {{ item.perCartonCount }} + {{ item.singleBottlesCount }} فردي
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-bold text-green-600 dark:text-green-400">{{ item.remainingQuantity }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">متاح</div>
                    </div>
                  </div>
                </div>
                <div v-if="filteredItems.length === 0 && sourceWarehouseId" class="p-8 text-center text-gray-500 dark:text-gray-400">
                  لا توجد أصناف في هذا المخزن
                </div>
                <div v-if="!sourceWarehouseId" class="p-8 text-center text-gray-500 dark:text-gray-400">
                  يرجى اختيار المخزن أولاً
                </div>
              </div>
            </div>

            <!-- Step 4: Quantity -->
            <div v-if="selectedItem">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span class="inline-block w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-center leading-6 text-sm ml-2">4</span>
                الكمية
              </label>

              <!-- Quantity Controls -->
              <div class="flex items-center gap-3">
                <button
                  @click="decreaseQuantity"
                  :disabled="quantity <= 1"
                  class="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg class="w-5 h-5 mx-auto text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <input
                  v-model.number="quantity"
                  type="number"
                  :max="selectedItem.remainingQuantity"
                  min="1"
                  @input="validateQuantity"
                  class="flex-1 text-center text-xl font-bold py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  @click="increaseQuantity"
                  :disabled="quantity >= selectedItem.remainingQuantity"
                  class="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg class="w-5 h-5 mx-auto text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <!-- Max Quantity Button -->
              <div class="text-center mt-2">
                <button
                  @click="setMaxQuantity"
                  class="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline transition-colors"
                >
                  استخدام الكل ({{ selectedItem.remainingQuantity }})
                </button>
              </div>

              <!-- Quantity Breakdown -->
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
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p class="text-sm text-green-600 dark:text-green-400">{{ successMessage }}</p>
            </div>
          </div>

          <!-- Footer - Fixed at bottom -->
          <div class="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 rounded-b-2xl flex-shrink-0">
            <button
              @click="closeModal"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300"
            >
              إلغاء
            </button>
            <button
              @click="submitDispatch"
              :disabled="!canSubmit || isSubmitting"
              class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
            >
              <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الصرف...
              </span>
              <span v-else>تأكيد الصرف</span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWarehouseStore } from '@/stores/warehouse'
import { useInventoryStore } from '@/stores/inventory'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'success'): void }>()

const warehouseStore = useWarehouseStore()
const inventoryStore = useInventoryStore()
const authStore = useAuthStore()

// State
const sourceWarehouseId = ref('')
const destinationId = ref('')
const selectedItem = ref<any>(null)
const searchQuery = ref('')
const quantity = ref(1)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Permission check - only users who can edit can dispatch
const canDispatch = computed(() => {
  return authStore.canEdit
})

// Accessible primary warehouses (for source) - using auth store getter
const accessiblePrimaryWarehouses = computed(() => {
  if (authStore.isSuperAdmin || authStore.isCompanyManager) {
    return warehouseStore.primaryWarehouses || []
  }
  if (authStore.isWarehouseManager) {
    // Use the auth store getter
    const allowedWarehouses = authStore.allowedWarehouses
    if (allowedWarehouses.includes('all')) {
      return warehouseStore.primaryWarehouses || []
    }
    return (warehouseStore.primaryWarehouses || []).filter(w => 
      allowedWarehouses.includes(w.id)
    )
  }
  return []
})

// Accessible dispatch warehouses (for destination) - using auth store getter
const accessibleDispatchWarehouses = computed(() => {
  if (authStore.isSuperAdmin || authStore.isCompanyManager) {
    return warehouseStore.dispatchWarehouses || []
  }
  if (authStore.isWarehouseManager) {
    // Use the auth store getter for dispatch warehouses
    const allowedDispatchWarehouses = authStore.allowedDispatchWarehouses
    if (allowedDispatchWarehouses.includes('all')) {
      return warehouseStore.dispatchWarehouses || []
    }
    return (warehouseStore.dispatchWarehouses || []).filter(w => 
      allowedDispatchWarehouses.includes(w.id)
    )
  }
  return []
})

const sourceItems = computed(() => {
  if (!sourceWarehouseId.value) return []
  return inventoryStore.items.filter(i => 
    i.warehouseId === sourceWarehouseId.value && i.remainingQuantity > 0
  )
})

const filteredItems = computed(() => {
  if (!sourceItems.value.length) return []
  if (!searchQuery.value) return sourceItems.value
  const q = searchQuery.value.toLowerCase()
  return sourceItems.value.filter(i => 
    i.name.toLowerCase().includes(q) || 
    i.code.toLowerCase().includes(q)
  )
})

const canSubmit = computed(() => {
  return sourceWarehouseId.value && 
         destinationId.value && 
         selectedItem.value &&
         quantity.value > 0 && 
         quantity.value <= selectedItem.value.remainingQuantity && 
         !isSubmitting.value &&
         canDispatch.value
})

// Methods
const validateQuantity = () => {
  if (quantity.value > selectedItem.value?.remainingQuantity) {
    quantity.value = selectedItem.value.remainingQuantity
  }
  if (quantity.value < 1) {
    quantity.value = 1
  }
}

const increaseQuantity = () => {
  if (quantity.value < selectedItem.value?.remainingQuantity) {
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
}

const onSourceWarehouseChange = () => {
  selectedItem.value = null
  destinationId.value = ''
  searchQuery.value = ''
  quantity.value = 1
  errorMessage.value = ''
  successMessage.value = ''
}

// Clear success message after a few seconds
const clearSuccessMessage = () => {
  setTimeout(() => {
    if (successMessage.value) {
      successMessage.value = ''
    }
  }, 3000)
}

const submitDispatch = async () => {
  if (!canSubmit.value) return

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const perCarton = selectedItem.value.perCartonCount || 12
    const cartonsToDispatch = Math.floor(quantity.value / perCarton)
    const singlesToDispatch = quantity.value % perCarton

    const result = await inventoryStore.dispatchItem({
      item_id: selectedItem.value.id,
      from_warehouse_id: sourceWarehouseId.value,
      destination: 'branch',
      destination_id: destinationId.value,
      quantity: quantity.value,
      cartons_count: cartonsToDispatch,
      single_bottles_count: singlesToDispatch,
      notes: `صرف ${quantity.value} وحدة إلى ${warehouseStore.getWarehouseName(destinationId.value)}`
    })

    if (result.success) {
      successMessage.value = `✅ تم صرف ${quantity.value} وحدة بنجاح`
      
      await inventoryStore.fetchItems()
      clearSuccessMessage()
      emit('success')
      
      selectedItem.value = null
      quantity.value = 1
      searchQuery.value = ''
      
      await inventoryStore.fetchItems()
      
    } else {
      errorMessage.value = result.message || 'فشل في عملية الصرف'
      setTimeout(() => {
        errorMessage.value = ''
      }, 3000)
    }
  } catch (error: any) {
    console.error('Dispatch error:', error)
    errorMessage.value = error.message || 'حدث خطأ أثناء الصرف'
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  sourceWarehouseId.value = ''
  destinationId.value = ''
  selectedItem.value = null
  searchQuery.value = ''
  quantity.value = 1
  errorMessage.value = ''
  successMessage.value = ''
}

const closeModal = () => {
  if (!isSubmitting.value) {
    resetForm()
    emit('close')
  }
}

// Watch for modal open to load data
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await warehouseStore.fetchWarehouses()
    await inventoryStore.fetchItems()
    resetForm()
  }
})
</script>