<template>
  <div class="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="max-w-3xl mx-auto">
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h1 class="text-xl sm:text-2xl font-bold text-white">
            {{ isEdit ? 'Edit Item' : 'Add New Item' }}
          </h1>
          <p class="text-green-100 text-sm mt-1">
            {{ isEdit ? 'Update item information' : 'Fill in the details to add a new item' }}
          </p>
        </div>
        
        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
          <!-- Name Field -->
          <div>
            <label class="block text-gray-700 font-semibold mb-2">
              Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              v-model="form.name"
              class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              :class="{ 'border-red-500 bg-red-50': errors.name }"
              placeholder="Enter item name"
              required
            />
            <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
          </div>
          
          <!-- Code Field -->
          <div>
            <label class="block text-gray-700 font-semibold mb-2">
              Code <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              v-model="form.code"
              class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              :class="{ 'border-red-500 bg-red-50': errors.code }"
              placeholder="Enter unique item code"
              required
            />
            <p v-if="errors.code" class="text-red-500 text-sm mt-1">{{ errors.code }}</p>
          </div>
          
          <!-- Color Field -->
          <div>
            <label class="block text-gray-700 font-semibold mb-2">
              Color <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-3">
              <input
                type="text"
                v-model="form.color"
                class="flex-1 px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                placeholder="e.g., Gold, Silver, Red"
                required
              />
              <input
                type="color"
                :value="form.color"
                @input="(e) => form.color = (e.target as HTMLInputElement).value"
                class="w-14 h-14 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 transition-all"
              />
            </div>
          </div>
          
          <!-- Size Field (NEW) -->
          <div>
            <label class="block text-gray-700 font-semibold mb-2">
              Size
            </label>
            <select
              v-model="form.size"
              class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white"
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
            <p class="text-xs text-gray-500 mt-1">Select the product size/volume</p>
          </div>
          
          <!-- Warehouse Field -->
          <div>
            <label class="block text-gray-700 font-semibold mb-2">
              Warehouse <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.warehouseId"
              class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white"
              required
            >
              <option value="">Select Warehouse</option>
              <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                {{ warehouse.name }}
              </option>
            </select>
          </div>
          
          <!-- Quantity Fields Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Cartons</label>
              <input
                type="number"
                v-model.number="form.cartonsCount"
                class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                min="0"
                placeholder="0"
              />
            </div>
            
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Per Carton</label>
              <input
                type="number"
                v-model.number="form.perCartonCount"
                class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                min="1"
                placeholder="12"
              />
            </div>
            
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Singles</label>
              <input
                type="number"
                v-model.number="form.singleBottlesCount"
                class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                min="0"
                placeholder="0"
              />
            </div>
          </div>
          
          <!-- Total Quantity Display -->
          <div class="bg-green-50 rounded-lg p-4 border border-green-200">
            <div class="flex justify-between items-center">
              <span class="font-semibold text-gray-700">Total Quantity:</span>
              <span class="text-2xl font-bold text-green-600">
                {{ totalQuantity }} units
              </span>
            </div>
          </div>
          
          <!-- Supplier Field -->
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Supplier</label>
            <input
              type="text"
              v-model="form.supplier"
              class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              placeholder="Enter supplier name"
            />
          </div>
          
          <!-- Location Field -->
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Location</label>
            <input
              type="text"
              v-model="form.location"
              class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              placeholder="Aisle, shelf, bin number"
            />
          </div>
          
          <!-- Notes Field -->
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Notes</label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none"
              placeholder="Any additional notes..."
            ></textarea>
          </div>
          
          <!-- Form Actions -->
          <div class="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200">
            <router-link 
              to="/inventory/items" 
              class="order-2 sm:order-1 text-center px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Cancel
            </router-link>
            <button
              type="submit"
              :disabled="isLoading"
              class="order-1 sm:order-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <span v-if="isLoading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
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

const totalQuantity = computed(() => {
  return (form.cartonsCount * form.perCartonCount) + form.singleBottlesCount
})

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
    
    router.push('/inventory/items')
  } catch (error) {
    console.error('Error saving item:', error)
    alert('Error saving item')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  
  const itemId = route.params.id as string
  if (itemId && route.query.edit) {
    isEdit.value = true
    const item = inventoryStore.items.find(i => i.id === itemId)
    if (item) {
      form.name = item.name
      form.code = item.code
      form.color = item.color
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
})
</script>