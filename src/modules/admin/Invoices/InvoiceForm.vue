<template>
  <div class="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 overflow-y-auto" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sticky top-0 bg-gray-50 z-10 py-2">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ isEdit ? 'Edit Invoice' : 'Create New Invoice' }}</h1>
          <p class="text-sm text-gray-600 mt-1">Enter invoice details and select items from warehouse</p>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <router-link to="/invoices" class="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
            Cancel
          </router-link>
          <button 
            @click="saveInvoice" 
            :disabled="isSaving"
            class="flex-1 sm:flex-none px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {{ isSaving ? 'Saving...' : (isEdit ? 'Update' : 'Save') }}
          </button>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Main Form -->
        <div class="flex-1 space-y-6">
          <!-- Customer Information -->
          <div class="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Customer Information</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input type="text" v-model="form.customer.name" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input type="tel" v-model="form.customer.phone" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" v-model="form.customer.email" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tax Number</label>
                <input type="text" v-model="form.customer.tax_number" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea v-model="form.customer.address" rows="2" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base"></textarea>
              </div>
            </div>
          </div>

          <!-- Warehouse & Country Selection -->
          <div class="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Warehouse & Settings</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Select Warehouse *</label>
                <select 
                  v-model="selectedWarehouseId" 
                  @change="onWarehouseChange"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                >
                  <option value="">Select Warehouse</option>
                  <option v-for="w in warehouses" :key="w.id" :value="w.id">
                    {{ w.name_ar || w.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select 
                  v-model="form.country" 
                  @change="onCountryChange"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                >
                  <option v-for="country in COUNTRIES" :key="country" :value="country">{{ country }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select v-model="selectedCurrency" @change="onCurrencyChange" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base">
                  <option value="EGP">EGP - Egyptian Pound</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="SAR">SAR - Saudi Riyal</option>
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="KWD">KWD - Kuwaiti Dinar</option>
                  <option value="QAR">QAR - Qatari Riyal</option>
                  <option value="BHD">BHD - Bahraini Dinar</option>
                  <option value="OMR">OMR - Omani Rial</option>
                  <option value="JOD">JOD - Jordanian Dinar</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Items Section -->
          <div class="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Items</h2>
            
            <!-- Item Search -->
            <div v-if="selectedWarehouseId" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Search Items</label>
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search by name, code, color, size, or supplier..."
                  class="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                />
                <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <!-- Available Items List -->
            <div v-if="selectedWarehouseId && filteredWarehouseItems.length > 0" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Available Items (Click to add)</label>
              <div class="border rounded-lg max-h-48 overflow-y-auto">
                <div
                  v-for="item in filteredWarehouseItems"
                  :key="item.id"
                  @click="addItemToInvoice(item)"
                  class="p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="font-medium text-gray-800 text-sm sm:text-base">{{ item.name }}</div>
                      <div class="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        <span>Code: {{ item.code }}</span>
                        <span>Color: {{ item.color || '—' }}</span>
                        <span>Size: {{ item.size || '—' }}</span>
                        <span>Supplier: {{ item.supplier || '—' }}</span>
                      </div>
                      <div class="text-xs text-gray-400 mt-1">
                        Stock: {{ item.remainingQuantity }} units
                      </div>
                    </div>
                    <button 
                      @click.stop="addItemToInvoice(item)"
                      class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 ml-2"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Items Message -->
            <div v-if="selectedWarehouseId && filteredWarehouseItems.length === 0 && !searchQuery" class="text-center py-8 text-gray-500">
              No items found in this warehouse
            </div>
            <div v-if="selectedWarehouseId && filteredWarehouseItems.length === 0 && searchQuery" class="text-center py-8 text-gray-500">
              No matching items found
            </div>
            <div v-if="!selectedWarehouseId" class="text-center py-8 text-gray-500">
              Please select a warehouse first
            </div>

            <!-- Invoice Items Table -->
            <div v-if="form.items.length > 0" class="mt-6">
              <h3 class="text-md font-semibold text-gray-800 mb-3">Invoice Items</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                      <th class="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500">Size</th>
                      <th class="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                      <th class="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500">Unit Price</th>
                      <th class="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500">Total</th>
                      <th class="px-2 sm:px-4 py-2 text-center text-xs font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in form.items" :key="index" class="border-b">
                      <td class="px-2 sm:px-4 py-2">
                        <div class="font-medium text-sm">{{ item.name }}</div>
                        <div class="text-xs text-gray-500">Code: {{ item.code }}</div>
                      </td>
                      <td class="px-2 sm:px-4 py-2 text-center text-sm">{{ item.size || '—' }}</td>
                      <td class="px-2 sm:px-4 py-2">
                        <input 
                          type="number" 
                          v-model.number="item.quantity" 
                          @change="updateItemTotal(index)"
                          min="1"
                          :max="item.maxQuantity"
                          class="w-16 sm:w-20 px-2 py-1 text-center border rounded text-sm"
                        />
                        <div class="text-xs text-gray-400">Max: {{ item.maxQuantity }}</div>
                      </td>
                      <td class="px-2 sm:px-4 py-2">
                        <input 
                          type="number" 
                          v-model.number="item.unit_price" 
                          @change="updateItemTotal(index)"
                          min="0"
                          step="0.01"
                          class="w-24 sm:w-28 px-2 py-1 text-center border rounded text-sm"
                        />
                      </td>
                      <td class="px-2 sm:px-4 py-2 text-center font-medium text-sm">
                        {{ formatCurrency(item.total) }}
                      </td>
                      <td class="px-2 sm:px-4 py-2 text-center">
                        <button @click="removeItem(index)" class="text-red-500 hover:text-red-700">
                          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Additional Information -->
          <div class="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Additional Information</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea v-model="form.notes" rows="2" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                <textarea v-model="form.terms" rows="2" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm" placeholder="Payment terms, return policy..."></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar - Totals & Details -->
        <div class="w-full lg:w-96 space-y-6">
          <!-- Invoice Details -->
          <div class="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Invoice Details</h2>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Invoice Type</label>
                <select v-model="form.type" class="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="B2B">B2B - Business</option>
                  <option value="B2C">B2C - Individual</option>
                  <option value="simplified">Simplified</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" v-model="form.due_date" class="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <select v-model="form.payment_terms" @change="onPaymentTermsChange" class="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Select Payment Terms</option>
                  <option value="immediate">Immediate</option>
                  <option value="net15">Net 15 Days</option>
                  <option value="net30">Net 30 Days</option>
                  <option value="net45">Net 45 Days</option>
                  <option value="net60">Net 60 Days</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Calculations -->
          <div class="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Calculations</h2>
            
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal:</span>
                <span class="font-medium">{{ formatCurrency(calculations.subtotal) }}</span>
              </div>

              <div>
                <label class="block text-sm text-gray-600 mb-1">Discount</label>
                <div class="flex gap-2">
                  <input type="number" v-model.number="form.discount_value" @change="calculateTotals" min="0" step="0.01" class="flex-1 px-2 py-1 border rounded text-sm" />
                  <select v-model="form.discount_type" @change="calculateTotals" class="w-20 px-2 py-1 border rounded text-sm">
                    <option value="fixed">Fixed</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
                <div class="text-right text-xs text-gray-500 mt-1">
                  Discount: {{ formatCurrency(calculations.discountAmount) }}
                </div>
              </div>

              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">Shipping Cost:</span>
                <input type="number" v-model.number="form.shipping_cost" @change="calculateTotals" min="0" step="0.01" class="w-28 px-2 py-1 text-right border rounded text-sm" />
              </div>

              <!-- VAT Rate with Manual Override -->
              <div>
                <label class="block text-sm text-gray-600 mb-1">
                  VAT Rate (%)
                  <span class="text-xs text-gray-400">(Auto-set from country, can be adjusted)</span>
                </label>
                <div class="flex gap-2">
                  <input type="number" v-model.number="form.vat_rate" @change="calculateTotals" min="0" max="100" step="0.1" class="flex-1 px-2 py-1 border rounded text-sm" />
                  <button 
                    @click="form.vat_rate = VAT_RATES[form.country] || 0" 
                    class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Reset to {{ VAT_RATES[form.country] || 0 }}%
                  </button>
                </div>
                <div class="flex justify-between items-center mt-1">
                  <span class="text-xs text-gray-500">Country rate: {{ VAT_RATES[form.country] || 0 }}%</span>
                  <span class="text-right text-xs text-gray-500 mt-1">
                    VAT Amount: {{ formatCurrency(calculations.vatAmount) }}
                  </span>
                </div>
              </div>

              <div class="border-t pt-3 mt-3">
                <div class="flex justify-between text-base sm:text-lg font-bold">
                  <span>Total Amount:</span>
                  <span class="text-green-600">{{ formatCurrency(calculations.totalAmount) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Invoice Status</h2>
            <div class="flex flex-wrap gap-3">
              <label class="flex items-center gap-2">
                <input type="radio" v-model="form.status" value="draft" />
                <span class="text-sm">Draft</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" v-model="form.status" value="issued" />
                <span class="text-sm">Issued</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" v-model="form.status" value="paid" />
                <span class="text-sm">Paid</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInvoiceStore, COUNTRIES, VAT_RATES } from '@/stores/invoice'
import { useWarehouseStore } from '@/stores/warehouse'
import { useInventoryStore } from '@/stores/inventory'
import { useLanguageStore } from '@/stores/language'

const route = useRoute()
const router = useRouter()
const invoiceStore = useInvoiceStore()
const warehouseStore = useWarehouseStore()
const inventoryStore = useInventoryStore()
const languageStore = useLanguageStore()

const isEdit = ref(false)
const isSaving = ref(false)
const warehouses = ref<any[]>([])
const selectedWarehouseId = ref('')
const searchQuery = ref('')
const warehouseItems = ref<any[]>([])
const selectedCurrency = ref('EGP')

// Currency exchange rates (relative to EGP)
const currencyRates: Record<string, number> = {
  EGP: 1,
  USD: 0.020,
  EUR: 0.018,
  GBP: 0.016,
  SAR: 0.075,
  AED: 0.073,
  KWD: 0.0061,
  QAR: 0.073,
  BHD: 0.0075,
  OMR: 0.0077,
  JOD: 0.014
}

const form = reactive({
  type: 'B2C',
  customer: {
    name: '',
    phone: '',
    email: '',
    address: '',
    tax_number: ''
  },
  items: [] as any[],
  warehouse_id: '',
  country: 'Egypt',
  vat_country: 'Egypt',
  invoice_date: new Date().toISOString().split('T')[0],
  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  vat_rate: 14,
  discount_type: 'fixed' as 'percentage' | 'fixed',
  discount_value: 0,
  shipping_cost: 0,
  status: 'draft' as 'draft' | 'issued' | 'paid' | 'cancelled',
  notes: '',
  terms: '',
  payment_terms: ''
})

const filteredWarehouseItems = computed(() => {
  if (!searchQuery.value) return warehouseItems.value
  const query = searchQuery.value.toLowerCase()
  return warehouseItems.value.filter(item =>
    item.name.toLowerCase().includes(query) ||
    item.code.toLowerCase().includes(query) ||
    (item.color && item.color.toLowerCase().includes(query)) ||
    (item.supplier && item.supplier.toLowerCase().includes(query)) ||
    (item.size && item.size.toLowerCase().includes(query))
  )
})

const calculations = computed(() => {
  return invoiceStore.calculateInvoiceTotals(
    form.items,
    form.vat_rate,
    form.discount_type,
    form.discount_value,
    form.shipping_cost
  )
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: selectedCurrency.value,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value * currencyRates[selectedCurrency.value])
}

const onCountryChange = () => {
  form.vat_rate = VAT_RATES[form.country] || 0
  form.vat_country = form.country
  console.log(`Country changed to: ${form.country}, VAT rate set to: ${form.vat_rate}%`)
}

const onCurrencyChange = () => {
  // Just update the display, calculations remain in EGP
  calculateTotals()
}

const onPaymentTermsChange = () => {
  if (form.payment_terms === 'immediate') {
    form.status = 'paid'
  }
}

const onWarehouseChange = async () => {
  if (selectedWarehouseId.value) {
    const items = await inventoryStore.getItemsByWarehouse(selectedWarehouseId.value)
    warehouseItems.value = items
    form.warehouse_id = selectedWarehouseId.value
  } else {
    warehouseItems.value = []
  }
}

const addItemToInvoice = (item: any) => {
  const existingIndex = form.items.findIndex(i => i.item_id === item.id)
  
  if (existingIndex !== -1) {
    const maxQty = item.remainingQuantity
    if (form.items[existingIndex].quantity < maxQty) {
      form.items[existingIndex].quantity++
      updateItemTotal(existingIndex)
    }
  } else {
    form.items.push({
      item_id: item.id,
      name: item.name,
      code: item.code,
      size: item.size || '',
      quantity: 1,
      unit_price: item.unit_price || item.price || 0,
      total: item.unit_price || item.price || 0,
      maxQuantity: item.remainingQuantity
    })
  }
  calculateTotals()
}

const updateItemTotal = (index: number) => {
  const item = form.items[index]
  item.total = item.quantity * item.unit_price
  calculateTotals()
}

const removeItem = (index: number) => {
  form.items.splice(index, 1)
  calculateTotals()
}

const calculateTotals = () => {
  // Trigger recalculation - computed property will update automatically
  invoiceStore.calculateInvoiceTotals(
    form.items,
    form.vat_rate,
    form.discount_type,
    form.discount_value,
    form.shipping_cost
  )
}

const saveInvoice = async () => {
  if (!form.customer.name || !form.customer.phone || !form.warehouse_id || form.items.length === 0) {
    alert('Please fill all required fields and add at least one item')
    return
  }

  isSaving.value = true
  
  const invoiceData = {
    type: form.type,
    customer: form.customer,
    items: form.items.map(item => ({
      item_id: item.item_id,
      name: item.name,
      code: item.code,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total
    })),
    warehouse_id: form.warehouse_id,
    country: form.country,
    vat_country: form.country,
    invoice_date: form.invoice_date,
    due_date: form.due_date,
    subtotal: calculations.value.subtotal,
    vat_rate: form.vat_rate,
    vat_amount: calculations.value.vatAmount,
    discount_type: form.discount_type,
    discount_value: form.discount_value,
    discount_amount: calculations.value.discountAmount,
    shipping_cost: form.shipping_cost,
    total_amount: calculations.value.totalAmount,
    status: form.status,
    notes: form.notes,
    terms: form.terms,
    payment_terms: form.payment_terms,
    currency: selectedCurrency.value
  }

  const result = await invoiceStore.createInvoice(invoiceData)
  
  if (result.success) {
    router.push('/invoices')
  } else {
    alert(result.message)
  }
  
  isSaving.value = false
}

// Watch for country changes to update VAT rate
watch(() => form.country, (newCountry) => {
  if (newCountry) {
    form.vat_rate = VAT_RATES[newCountry] || 0
  }
}, { immediate: true })

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  warehouses.value = warehouseStore.warehouses
  await inventoryStore.fetchItems()
  
  const id = route.params.id as string
  if (id) {
    isEdit.value = true
    const invoice = await invoiceStore.getInvoiceById(id)
    if (invoice) {
      Object.assign(form, invoice)
      form.invoice_date = new Date(invoice.invoice_date).toISOString().split('T')[0]
      form.due_date = new Date(invoice.due_date).toISOString().split('T')[0]
      selectedWarehouseId.value = invoice.warehouse_id
      form.country = invoice.country || 'Egypt'
      selectedCurrency.value = invoice.currency || 'EGP'
      await onWarehouseChange()
    }
  }
})
</script>