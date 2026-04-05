<template>
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Inventory Items</h1>
      <router-link to="/inventory/items/new" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 w-full sm:w-auto justify-center">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Item
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            v-model="filters.search"
            placeholder="Search by name, code, or size..."
            class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
        <select v-model="filters.warehouseId" class="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white">
          <option value="">All Warehouses</option>
          <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
            {{ warehouse.name }}
          </option>
        </select>
        <select v-model="filters.status" class="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white">
          <option value="">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        <button @click="resetFilters" class="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600">
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Items Table - Desktop View -->
    <div class="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Color</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Size</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Warehouse</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <div class="font-semibold text-gray-900">{{ item.name }}</div>
                <div class="text-xs text-gray-500 mt-0.5">Supplier: {{ item.supplier || '—' }}</div>
               </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-mono">{{ item.code }}</span>
               </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full border border-gray-300 shadow-sm" :style="{ backgroundColor: item.color }"></span>
                  <span class="text-sm">{{ item.color }}</span>
                </div>
               </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">{{ item.size || '—' }}</span>
               </td>
              <td class="px-4 py-3 text-sm">{{ getWarehouseName(item.warehouseId) }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex flex-col items-center">
                  <span class="text-lg font-bold" :class="getStockTextClass(item.remainingQuantity)">
                    {{ item.remainingQuantity }}
                  </span>
                  <span class="text-xs text-gray-400">{{ item.cartonsCount }} cartons × {{ item.perCartonCount }} + {{ item.singleBottlesCount }} singles</span>
                </div>
               </td>
              <td class="px-4 py-3 text-center">
                <span :class="getStatusBadgeClass(item.remainingQuantity)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getStatusText(item.remainingQuantity) }}
                </span>
               </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <router-link :to="`/inventory/items/${item.id}`" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </router-link>
                  <router-link :to="`/inventory/items/${item.id}?edit=true`" class="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </router-link>
                  <button @click="openTransferModal(item)" class="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Transfer">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                  </button>
                  <button @click="openDispatchModal(item)" class="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Dispatch">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                  </button>
                  <button v-if="authStore.isSuperAdmin" @click="confirmDelete(item)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
               </td>
             </tr>
            <tr v-if="filteredItems.length === 0">
              <td colspan="8" class="px-4 py-12 text-center text-gray-500">
                <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
                </svg>
                <p>No items found</p>
                <p class="text-sm mt-1">Try adjusting your search or filters</p>
               </td>
             </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Card View -->
    <div class="lg:hidden space-y-3">
      <div v-for="item in filteredItems" :key="item.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="font-semibold text-gray-900">{{ item.name }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">Code: {{ item.code }}</p>
          </div>
          <span :class="getStatusBadgeClass(item.remainingQuantity)" class="px-2 py-1 text-xs font-medium rounded-full">
            {{ getStatusText(item.remainingQuantity) }}
          </span>
        </div>
        
        <div class="grid grid-cols-2 gap-2 text-sm mb-3">
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full border" :style="{ backgroundColor: item.color }"></span>
            <span>{{ item.color }}</span>
          </div>
          <div><span class="text-gray-500">Size:</span> {{ item.size || '—' }}</div>
          <div><span class="text-gray-500">Warehouse:</span> {{ getWarehouseName(item.warehouseId) }}</div>
          <div><span class="text-gray-500">Stock:</span> <span :class="getStockTextClass(item.remainingQuantity)" class="font-bold">{{ item.remainingQuantity }}</span></div>
        </div>
        
        <div class="text-xs text-gray-400 mb-3">
          {{ item.cartonsCount }} cartons × {{ item.perCartonCount }} + {{ item.singleBottlesCount }} singles
        </div>
        
        <div class="flex justify-around pt-3 border-t border-gray-100">
          <router-link :to="`/inventory/items/${item.id}`" class="flex flex-col items-center text-blue-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span class="text-xs mt-1">View</span>
          </router-link>
          <router-link :to="`/inventory/items/${item.id}?edit=true`" class="flex flex-col items-center text-green-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span class="text-xs mt-1">Edit</span>
          </router-link>
          <button @click="openTransferModal(item)" class="flex flex-col items-center text-purple-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
            <span class="text-xs mt-1">Transfer</span>
          </button>
          <button @click="openDispatchModal(item)" class="flex flex-col items-center text-orange-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            <span class="text-xs mt-1">Dispatch</span>
          </button>
        </div>
      </div>
      
      <div v-if="filteredItems.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">
        <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
        </svg>
        <p>No items found</p>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Confirm Delete</h3>
        <p class="mb-6 text-gray-600">Are you sure you want to delete item "{{ itemToDelete?.name }}"?</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button @click="deleteItem" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <TransferModal 
      :is-open="showTransferModal" 
      :item="selectedTransferItem"
      @close="closeTransferModal"
      @success="() => onTransferSuccess()"
    />

    <!-- Dispatch Modal -->
    <DispatchModal 
      :is-open="showDispatchModal" 
      @close="closeDispatchModal"
      @success="() => onDispatchSuccess()"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import type { InventoryItem } from '@/types'
import TransferModal from '@/components/modals/TransferModal.vue'
import DispatchModal from '@/components/modals/DispatchModal.vue'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

const filters = ref({
  search: '',
  warehouseId: '',
  status: '',
})

const showDeleteModal = ref(false)
const itemToDelete = ref<InventoryItem | null>(null)

// Transfer and Dispatch modals state
const showTransferModal = ref(false)
const showDispatchModal = ref(false)
const selectedTransferItem = ref<InventoryItem | null>(null)

const warehouses = computed(() => warehouseStore.warehouses)

const filteredItems = computed(() => {
  let items = inventoryStore.items
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    items = items.filter(item => 
      item.name.toLowerCase().includes(search) || 
      item.code.toLowerCase().includes(search) ||
      (item.size && item.size.toLowerCase().includes(search))
    )
  }
  
  if (filters.value.warehouseId) {
    items = items.filter(item => item.warehouseId === filters.value.warehouseId)
  }
  
  if (filters.value.status === 'in_stock') {
    items = items.filter(item => item.remainingQuantity > 10)
  } else if (filters.value.status === 'low_stock') {
    items = items.filter(item => item.remainingQuantity <= 10 && item.remainingQuantity > 0)
  } else if (filters.value.status === 'out_of_stock') {
    items = items.filter(item => item.remainingQuantity === 0)
  }
  
  return items
})

const getWarehouseName = (warehouseId: string) => {
  const warehouse = warehouses.value.find(w => w.id === warehouseId)
  return warehouse?.name || 'Unknown'
}

const getStockTextClass = (quantity: number) => {
  if (quantity === 0) return 'text-red-600'
  if (quantity < 10) return 'text-yellow-600'
  return 'text-green-600'
}

const getStatusBadgeClass = (quantity: number) => {
  if (quantity === 0) return 'bg-red-100 text-red-700'
  if (quantity < 10) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

const getStatusText = (quantity: number) => {
  if (quantity === 0) return 'Out of Stock'
  if (quantity < 10) return 'Low Stock'
  return 'In Stock'
}

const resetFilters = () => {
  filters.value = {
    search: '',
    warehouseId: '',
    status: '',
  }
}

const confirmDelete = (item: InventoryItem) => {
  itemToDelete.value = item
  showDeleteModal.value = true
}

const deleteItem = async () => {
  if (itemToDelete.value) {
    await inventoryStore.deleteItem(itemToDelete.value.id)
    showDeleteModal.value = false
    itemToDelete.value = null
  }
}

// Transfer and Dispatch methods
const openTransferModal = (item: InventoryItem) => {
  selectedTransferItem.value = item
  showTransferModal.value = true
}

const closeTransferModal = () => {
  showTransferModal.value = false
  selectedTransferItem.value = null
}

const openDispatchModal = (item: InventoryItem) => {
  selectedTransferItem.value = item
  showDispatchModal.value = true
}

const closeDispatchModal = () => {
  showDispatchModal.value = false
  selectedTransferItem.value = null
}

const onTransferSuccess = async () => {
  console.log('Transfer success')
  await inventoryStore.fetchItems()
}

const onDispatchSuccess = async () => {
  console.log('Dispatch success')
  await inventoryStore.fetchItems()
}

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await inventoryStore.fetchItems()
})
</script>