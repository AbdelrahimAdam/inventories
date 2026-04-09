<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" @click.self="closeModal">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <!-- Header - Fixed at top -->
        <div class="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl flex-shrink-0">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
            {{ warehouse ? 'تعديل المخزن' : 'إضافة مخزن جديد' }}
          </h2>
          <button 
            @click="closeModal"
            class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
          >
            <svg class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Content - Scrollable middle section -->
        <div class="overflow-y-auto flex-1 p-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Warehouse Name (Arabic) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                اسم المخزن (عربي) <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                v-model="formData.name_ar"
                class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                placeholder="المخزن الرئيسي"
              />
            </div>

            <!-- Warehouse Name (English) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                اسم المخزن (إنجليزي) <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                v-model="formData.name_en"
                class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Main Warehouse"
              />
            </div>

            <!-- Warehouse Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                نوع المخزن <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label 
                  v-for="type in warehouseTypes" 
                  :key="type.value"
                  class="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors duration-200"
                  :class="{
                    'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20': formData.type === type.value,
                    'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700': formData.type !== type.value
                  }"
                >
                  <input
                    type="radio"
                    :value="type.value"
                    v-model="formData.type"
                    class="sr-only"
                  />
                  <div class="flex w-full items-center justify-between">
                    <div class="flex items-center">
                      <div class="text-sm">
                        <div class="font-medium text-gray-900 dark:text-white">{{ type.name }}</div>
                        <div class="text-gray-500 dark:text-gray-400 text-xs mt-1">{{ type.description }}</div>
                      </div>
                    </div>
                    <svg v-if="formData.type === type.value" class="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </label>
              </div>
            </div>

            <!-- Location -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الموقع
              </label>
              <input
                type="text"
                v-model="formData.location"
                class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="المنوفية، مصر"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                وصف المخزن
              </label>
              <textarea
                v-model="formData.description"
                rows="3"
                class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="وصف إضافي للمخزن..."
              ></textarea>
            </div>

            <!-- Capacity -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                السعة التخزينية
              </label>
              <input
                type="number"
                v-model.number="formData.capacity"
                min="0"
                step="1"
                class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="1000"
              />
            </div>

            <!-- Main Warehouse Flag (only for primary warehouses) -->
            <div v-if="formData.type === 'primary'">
              <div class="flex items-center">
                <input
                  type="checkbox"
                  v-model="formData.is_main"
                  id="is_main"
                  class="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <label for="is_main" class="mr-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  تعيين كمخزن رئيسي
                </label>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                المخزن الرئيسي هو المخزن الافتراضي في النظام
              </p>
            </div>

            <!-- Permission Warning -->
            <div v-if="!canManageWarehouses" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <p class="text-sm text-yellow-800 dark:text-yellow-300">
                  ليس لديك صلاحية لإدارة المخازن. يرجى التواصل مع مدير النظام.
                </p>
              </div>
            </div>

            <!-- Validation Errors -->
            <div v-if="validationErrors.length > 0" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 class="text-sm font-medium text-red-800 dark:text-red-300 mb-2">خطأ في التحقق:</h4>
              <ul class="text-sm text-red-700 dark:text-red-300 list-disc pr-5 space-y-1">
                <li v-for="error in validationErrors" :key="error">{{ error }}</li>
              </ul>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-sm text-red-700 dark:text-red-300">{{ errorMessage }}</p>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer - Fixed at bottom -->
        <div class="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 rounded-b-2xl flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="closeModal"
            class="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
          >
            إلغاء
          </button>
          <button
            type="submit"
            @click="handleSubmit"
            :disabled="loading || !canManageWarehouses"
            class="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {{ loading ? 'جاري الحفظ...' : (warehouse ? 'تحديث' : 'إضافة') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWarehouseStore } from '@/stores/warehouse'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  isOpen: boolean
  warehouse?: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: any): void
}>()

const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()

const loading = ref(false)
const errorMessage = ref('')
const validationErrors = ref<string[]>([])

// Check if user has permission to manage warehouses
const canManageWarehouses = computed(() => {
  return authStore.isSuperAdmin || authStore.isCompanyManager
})

const formData = ref({
  name_ar: '',
  name_en: '',
  type: 'primary' as 'primary' | 'dispatch',
  location: '',
  description: '',
  capacity: 0,
  is_main: false
})

const warehouseTypes = [
  {
    value: 'primary',
    name: 'مخزن رئيسي',
    description: 'مخزن للتخزين الداخلي'
  },
  {
    value: 'dispatch',
    name: 'موقع صرف',
    description: 'موقع لصرف الأصناف للخارج (فروع، عملاء)'
  }
]

const isFormValid = computed(() => {
  validationErrors.value = []

  if (!formData.value.name_ar.trim()) {
    validationErrors.value.push('اسم المخزن بالعربي مطلوب')
  }

  if (!formData.value.name_en.trim()) {
    validationErrors.value.push('اسم المخزن بالإنجليزي مطلوب')
  }

  if (!formData.value.type) {
    validationErrors.value.push('نوع المخزن مطلوب')
  }

  if (formData.value.capacity < 0) {
    validationErrors.value.push('السعة التخزينية لا يمكن أن تكون سالبة')
  }

  return validationErrors.value.length === 0
})

const resetForm = () => {
  formData.value = {
    name_ar: '',
    name_en: '',
    type: 'primary',
    location: '',
    description: '',
    capacity: 0,
    is_main: false
  }
  errorMessage.value = ''
  validationErrors.value = []
}

const closeModal = () => {
  if (!loading.value) {
    resetForm()
    emit('close')
  }
}

const handleSubmit = async () => {
  // Check permission first
  if (!canManageWarehouses.value) {
    errorMessage.value = 'ليس لديك صلاحية لإدارة المخازن'
    return
  }

  if (!isFormValid.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    let result
    if (props.warehouse) {
      result = await warehouseStore.updateWarehouse(props.warehouse.id, {
        name_ar: formData.value.name_ar.trim(),
        name_en: formData.value.name_en.trim(),
        type: formData.value.type,
        location: formData.value.location.trim(),
        description: formData.value.description.trim(),
        capacity: formData.value.capacity,
        is_main: formData.value.is_main
      })
    } else {
      result = await warehouseStore.addWarehouse({
        name: formData.value.name_en.trim(),
        name_ar: formData.value.name_ar.trim(),
        name_en: formData.value.name_en.trim(),
        type: formData.value.type,
        location: formData.value.location.trim(),
        description: formData.value.description.trim(),
        capacity: formData.value.capacity,
        is_main: formData.value.is_main
      })
    }

    if (result) {
      emit('save', { ...formData.value })
      closeModal()
    } else {
      errorMessage.value = warehouseStore.error || 'حدث خطأ أثناء حفظ المخزن'
    }
  } catch (error: any) {
    console.error('Error saving warehouse:', error)
    errorMessage.value = error.message || 'حدث خطأ أثناء حفظ المخزن'
  } finally {
    loading.value = false
  }
}

// Reset is_main when type changes to dispatch
watch(() => formData.value.type, (newType) => {
  if (newType === 'dispatch') {
    formData.value.is_main = false
  }
})

// Populate form when editing
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.warehouse) {
    formData.value = {
      name_ar: props.warehouse.name_ar || props.warehouse.name,
      name_en: props.warehouse.name_en || props.warehouse.name,
      type: props.warehouse.type || 'primary',
      location: props.warehouse.location || '',
      description: props.warehouse.description || '',
      capacity: props.warehouse.capacity || 0,
      is_main: props.warehouse.is_main || false
    }
  } else if (newVal) {
    resetForm()
  }
})
</script>