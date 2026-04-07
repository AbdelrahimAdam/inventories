<template>
  <div class="max-w-3xl mx-auto" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200">
      <!-- Header -->
      <div class="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 px-4 sm:px-6 py-3 sm:py-4">
        <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-white">
          {{ isEdit ? 'تعديل صنف' : 'إضافة صنف جديد' }}
        </h1>
        <p class="text-green-100 text-xs sm:text-sm mt-1">
          {{ isEdit ? 'تحديث معلومات الصنف' : 'املأ التفاصيل لإضافة صنف جديد' }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-4 sm:p-6 space-y-4 sm:space-y-5">
        <!-- Mode Toggle -->
        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">وضع الإدخال:</span>
            <div class="flex gap-2">
              <button
                type="button"
                @click="inputMode = 'detailed'"
                :class="[
                  'px-3 py-1.5 text-sm rounded-lg transition-all duration-200',
                  inputMode === 'detailed' 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                ]"
              >
                تفصيلي (كراتين)
              </button>
              <button
                type="button"
                @click="inputMode = 'simple'"
                :class="[
                  'px-3 py-1.5 text-sm rounded-lg transition-all duration-200',
                  inputMode === 'simple' 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                ]"
              >
                بسيط (كمية إجمالية)
              </button>
            </div>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ inputMode === 'detailed' ? 'أدخل الكمية بالكراتين والقطع الفردية' : 'أدخل الكمية الإجمالية مباشرة' }}
          </div>
        </div>

        <!-- Name Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
            الاسم <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            v-model="form.name"
            class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            :class="{ 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20': errors.name }"
            placeholder="أدخل اسم الصنف"
            required
          />
          <p v-if="errors.name" class="text-red-500 text-xs sm:text-sm mt-1">{{ errors.name }}</p>
        </div>

        <!-- Code Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
            الكود <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            v-model="form.code"
            class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            :class="{ 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20': errors.code }"
            placeholder="أدخل كود فريد للصنف"
            required
          />
          <p v-if="errors.code" class="text-red-500 text-xs sm:text-sm mt-1">{{ errors.code }}</p>
        </div>

        <!-- Color Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
            اللون <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2 sm:gap-3">
            <input
              type="text"
              v-model="form.color"
              class="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="مثال: ذهبي، فضي، أحمر"
              required
            />
            <input
              type="color"
              :value="colorPickerValue"
              @input="(e) => updateColorFromPicker(e)"
              class="w-10 h-10 sm:w-14 sm:h-14 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-500 transition-all"
            />
          </div>
        </div>

        <!-- Size Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
            المقاس
          </label>
          <select
            v-model="form.size"
            class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">اختر المقاس</option>
            <option value="3ml">3ml (عينة)</option>
            <option value="5ml">5ml (عينة)</option>
            <option value="10ml">10ml (سفر)</option>
            <option value="30ml">30ml</option>
            <option value="35ml">35ml</option>
            <option value="40ml">40ml</option>
            <option value="45ml">45ml</option>
            <option value="50ml">50ml</option>
            <option value="75ml">75ml</option>
            <option value="100ml">100ml</option>
            <option value="150ml">150ml</option>
            <option value="200ml">200ml</option>
            <option value="500ml">500ml</option>
            <option value="1L">1 لتر</option>
          </select>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">اختر حجم/سعة المنتج</p>
        </div>

        <!-- Warehouse Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
            المخزن <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.warehouseId"
            class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            <option value="">اختر المخزن</option>
            <option v-for="warehouse in primaryWarehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name_ar || warehouse.name }}
            </option>
          </select>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">المخازن الرئيسية فقط</p>
        </div>

        <!-- Quantity Fields - Dynamic based on mode -->
        <div v-if="inputMode === 'detailed'">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">كراتين</label>
              <input
                type="number"
                v-model.number="form.cartonsCount"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
                placeholder="0"
                @input="updateTotalQuantityFromDetailed"
              />
            </div>

            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">في الكرتونة</label>
              <input
                type="number"
                v-model.number="form.perCartonCount"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="1"
                placeholder="12"
                @input="updateTotalQuantityFromDetailed"
              />
            </div>

            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">قطع فردية</label>
              <input
                type="number"
                v-model.number="form.singleBottlesCount"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
                placeholder="0"
                @input="updateTotalQuantityFromDetailed"
              />
            </div>
          </div>
        </div>

        <div v-else>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
              الكمية الإجمالية <span class="text-red-500">*</span>
            </label>
            <input
              type="number"
              v-model.number="simpleQuantity"
              class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
              placeholder="أدخل الكمية الإجمالية"
              @input="updateDetailedFromSimple"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">أدخل الكمية الإجمالية مباشرة (سيتم تحويلها إلى كراتين تلقائياً)</p>
          </div>
        </div>

        <!-- Total Quantity Display -->
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-800">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">إجمالي الكمية:</span>
            <span class="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {{ totalQuantity.toLocaleString() }} وحدة
            </span>
          </div>
          <div v-if="inputMode === 'simple' && (form.cartonsCount > 0 || form.singleBottlesCount > 0)" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            * سيتم تخزينها كـ {{ form.cartonsCount }} كرتون × {{ form.perCartonCount }} + {{ form.singleBottlesCount }} فردي
          </div>
        </div>

        <!-- Supplier Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">المورد</label>
          <input
            type="text"
            v-model="form.supplier"
            class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="أدخل اسم المورد"
          />
        </div>

        <!-- Location Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">الموقع</label>
          <input
            type="text"
            v-model="form.location"
            class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="الممر، الرف، رقم الحاوية"
          />
        </div>

        <!-- Notes Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">ملاحظات</label>
          <textarea
            v-model="form.notes"
            rows="3"
            class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            placeholder="أي ملاحظات إضافية..."
          ></textarea>
        </div>

        <!-- Form Actions -->
        <div class="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <router-link 
            to="/inventory/items" 
            class="order-2 sm:order-1 text-center px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all text-sm sm:text-base"
          >
            إلغاء
          </router-link>
          <button
            type="submit"
            :disabled="isLoading"
            class="order-1 sm:order-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 dark:hover:from-green-800 dark:hover:to-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md text-sm sm:text-base"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري الحفظ...
            </span>
            <span v-else>{{ isEdit ? 'تحديث الصنف' : 'إضافة صنف' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'

const route = useRoute()
const router = useRouter()
const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()

const isLoading = ref(false)
const isEdit = ref(false)
const inputMode = ref<'detailed' | 'simple'>('detailed')
const simpleQuantity = ref(0)

// Color name to hex mapping
const colorNameToHex: Record<string, string> = {
  'أحمر': '#FF0000',
  'أخضر': '#00FF00',
  'أزرق': '#0000FF',
  'أسود': '#000000',
  'أبيض': '#FFFFFF',
  'أصفر': '#FFFF00',
  'بنفسجي': '#800080',
  'برتقالي': '#FFA500',
  'وردي': '#FFC0CB',
  'بني': '#A52A2A',
  'رمادي': '#808080',
  'ذهبي': '#FFD700',
  'فضي': '#C0C0C0',
  'برونزي': '#CD7F32',
  'red': '#FF0000',
  'green': '#00FF00',
  'blue': '#0000FF',
  'black': '#000000',
  'white': '#FFFFFF',
  'yellow': '#FFFF00',
  'purple': '#800080',
  'orange': '#FFA500',
  'pink': '#FFC0CB',
  'brown': '#A52A2A',
  'gray': '#808080',
  'gold': '#FFD700',
  'silver': '#C0C0C0',
  'bronze': '#CD7F32',
}

const form = reactive({
  name: '',
  code: '',
  color: '',
  size: '',
  warehouseId: '',
  cartonsCount: 0,
  perCartonCount: 12,
  singleBottlesCount: 0,
  supplier: '',
  location: '',
  notes: '',
})

const errors = reactive({
  name: '',
  code: '',
})

// Filter only primary warehouses (exclude dispatch warehouses)
const primaryWarehouses = computed(() => {
  return warehouseStore.warehouses.filter(w => w.type !== 'dispatch')
})

const colorPickerValue = computed(() => {
  const color = form.color.toLowerCase()
  if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
    return color
  }
  if (colorNameToHex[color]) {
    return colorNameToHex[color]
  }
  return '#000000'
})

const totalQuantity = computed(() => {
  return (form.cartonsCount * form.perCartonCount) + form.singleBottlesCount
})

// Update detailed fields from simple quantity
const updateDetailedFromSimple = () => {
  if (inputMode.value === 'simple') {
    const perCarton = form.perCartonCount || 12
    form.cartonsCount = Math.floor(simpleQuantity.value / perCarton)
    form.singleBottlesCount = simpleQuantity.value % perCarton
  }
}

// Update simple quantity from detailed fields
const updateTotalQuantityFromDetailed = () => {
  if (inputMode.value === 'detailed') {
    simpleQuantity.value = totalQuantity.value
  }
}

// Watch for mode changes to sync values
watch(inputMode, (newMode) => {
  if (newMode === 'simple') {
    simpleQuantity.value = totalQuantity.value
  } else {
    updateDetailedFromSimple()
  }
})

// Watch for perCartonCount changes in simple mode
watch(() => form.perCartonCount, () => {
  if (inputMode.value === 'simple') {
    updateDetailedFromSimple()
  }
})

const updateColorFromPicker = (event: Event) => {
  const target = event.target as HTMLInputElement
  form.color = target.value
}

const validateForm = (): boolean => {
  let isValid = true
  
  if (!form.name.trim()) {
    errors.name = 'الاسم مطلوب'
    isValid = false
  } else {
    errors.name = ''
  }
  
  if (!form.code.trim()) {
    errors.code = 'الكود مطلوب'
    isValid = false
  } else {
    errors.code = ''
  }
  
  if (inputMode.value === 'simple' && simpleQuantity.value <= 0) {
    alert('الكمية الإجمالية مطلوبة ويجب أن تكون أكبر من 0')
    isValid = false
  }
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  // Ensure simple mode values are synced before save
  if (inputMode.value === 'simple') {
    updateDetailedFromSimple()
  }
  
  isLoading.value = true
  
  try {
    if (isEdit.value) {
      const itemId = route.params.id as string
      await inventoryStore.updateItem(itemId, {
        name: form.name,
        code: form.code,
        color: form.color,
        size: form.size,
        warehouseId: form.warehouseId,
        cartonsCount: form.cartonsCount,
        perCartonCount: form.perCartonCount,
        singleBottlesCount: form.singleBottlesCount,
        remainingQuantity: totalQuantity.value,
        totalAdded: totalQuantity.value,
        supplier: form.supplier,
        location: form.location,
        notes: form.notes,
      })
    } else {
      await inventoryStore.addItem({
        name: form.name,
        code: form.code,
        color: form.color,
        size: form.size,
        warehouseId: form.warehouseId,
        cartonsCount: form.cartonsCount,
        perCartonCount: form.perCartonCount,
        singleBottlesCount: form.singleBottlesCount,
        remainingQuantity: totalQuantity.value,
        totalAdded: totalQuantity.value,
        supplier: form.supplier,
        location: form.location,
        notes: form.notes,
      })
    }
    
    router.push('/inventory/items')
  } catch (error) {
    console.error('Error saving item:', error)
    alert('حدث خطأ أثناء حفظ الصنف')
  } finally {
    isLoading.value = false
  }
}

watch(() => form.warehouseId, (newVal) => {
  if (newVal && !primaryWarehouses.value.some(w => w.id === newVal)) {
    form.warehouseId = ''
  }
})

onMounted(async () => {
  try {
    await warehouseStore.fetchWarehouses()
    
    const itemId = route.params.id as string
    if (itemId && route.query.edit === 'true') {
      isEdit.value = true
      if (inventoryStore.items.length === 0) {
        await inventoryStore.fetchItems()
      }
      const item = inventoryStore.items.find(i => i.id === itemId)
      if (item) {
        form.name = item.name
        form.code = item.code
        form.color = item.color || ''
        form.size = item.size || ''
        form.warehouseId = item.warehouseId
        form.cartonsCount = item.cartonsCount
        form.perCartonCount = item.perCartonCount
        form.singleBottlesCount = item.singleBottlesCount
        form.supplier = item.supplier || ''
        form.location = item.location || ''
        form.notes = item.notes || ''
        simpleQuantity.value = totalQuantity.value
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
})
</script>