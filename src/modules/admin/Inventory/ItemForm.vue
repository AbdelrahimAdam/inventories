<template>
  <div class="max-w-3xl mx-auto" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200">
      <!-- Header -->
      <div class="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 px-4 sm:px-6 py-3 sm:py-4">
        <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-white">
          {{ isEdit ? 'Edit Item' : 'Add New Item' }}
        </h1>
        <p class="text-green-100 text-xs sm:text-sm mt-1">
          {{ isEdit ? 'Update item information' : 'Fill in the details to add a new item' }}
        </p>
      </div>
      
      <!-- Form - No custom scroll, uses parent layout scroll -->
      <form @submit.prevent="handleSubmit" class="p-4 sm:p-6 space-y-4 sm:space-y-5">
        <!-- Name Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
            Name <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            v-model="form.name"
            class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            :class="{ 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20': errors.name }"
            placeholder="Enter item name"
            required
          />
          <p v-if="errors.name" class="text-red-500 text-xs sm:text-sm mt-1">{{ errors.name }}</p>
        </div>
        
        <!-- Code Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
            Code <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            v-model="form.code"
            class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            :class="{ 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20': errors.code }"
            placeholder="Enter unique item code"
            required
          />
          <p v-if="errors.code" class="text-red-500 text-xs sm:text-sm mt-1">{{ errors.code }}</p>
        </div>
        
        <!-- Color Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
            Color <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2 sm:gap-3">
            <input
              type="text"
              v-model="form.color"
              class="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Gold, Silver, Red"
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
            Size
          </label>
          <select
            v-model="form.size"
            class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Size</option>
            <option value="50ml">50ml</option>
            <option value="100ml">100ml</option>
            <option value="200ml">200ml</option>
            <option value="500ml">500ml</option>
            <option value="1L">1 Liter</option>
            <option value="3ml">3ml (Sample)</option>
            <option value="5ml">5ml (Sample)</option>
            <option value="10ml">10ml (Travel)</option>
          </select>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Select the product size/volume</p>
        </div>
        
        <!-- Warehouse Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
            Warehouse <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.warehouseId"
            class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            <option value="">Select Warehouse</option>
            <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name }}
            </option>
          </select>
        </div>
        
        <!-- Quantity Fields Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">Cartons</label>
            <input
              type="number"
              v-model.number="form.cartonsCount"
              class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
              placeholder="0"
              @input="updateTotalQuantity"
            />
          </div>
          
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">Per Carton</label>
            <input
              type="number"
              v-model.number="form.perCartonCount"
              class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="1"
              placeholder="12"
              @input="updateTotalQuantity"
            />
          </div>
          
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 text-sm">Singles</label>
            <input
              type="number"
              v-model.number="form.singleBottlesCount"
              class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
              placeholder="0"
              @input="updateTotalQuantity"
            />
          </div>
        </div>
        
        <!-- Total Quantity Display -->
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-800">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">Total Quantity:</span>
            <span class="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {{ totalQuantity.toLocaleString() }} units
            </span>
          </div>
        </div>
        
        <!-- Supplier Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Supplier</label>
          <input
            type="text"
            v-model="form.supplier"
            class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter supplier name"
          />
        </div>
        
        <!-- Location Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Location</label>
          <input
            type="text"
            v-model="form.location"
            class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Aisle, shelf, bin number"
          />
        </div>
        
        <!-- Notes Field -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Notes</label>
          <textarea
            v-model="form.notes"
            rows="3"
            class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            placeholder="Any additional notes..."
          ></textarea>
        </div>
        
        <!-- Form Actions -->
        <div class="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <router-link 
            to="/inventory/items" 
            class="order-2 sm:order-1 text-center px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all text-sm sm:text-base"
          >
            Cancel
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
              Saving...
            </span>
            <span v-else>{{ isEdit ? 'Update Item' : 'Create Item' }}</span>
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

// Color name to hex mapping
const colorNameToHex: Record<string, string> = {
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

const warehouses = computed(() => warehouseStore.warehouses)

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

const updateTotalQuantity = () => {}

const updateColorFromPicker = (event: Event) => {
  const target = event.target as HTMLInputElement
  form.color = target.value
}

const validateForm = (): boolean => {
  let isValid = true
  
  if (!form.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  } else {
    errors.name = ''
  }
  
  if (!form.code.trim()) {
    errors.code = 'Code is required'
    isValid = false
  } else {
    errors.code = ''
  }
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
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
    alert('Error saving item')
  } finally {
    isLoading.value = false
  }
}

watch(() => form.warehouseId, (newVal) => {
  if (newVal && !warehouses.value.some(w => w.id === newVal)) {
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
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
})
</script>