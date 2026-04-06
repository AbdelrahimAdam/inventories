<template>
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Inventory Items</h1>
      <div class="flex gap-2 w-full sm:w-auto">
        <button @click="exportToExcel" class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-6 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-4" />
          </svg>
          Export Excel
        </button>
        <router-link to="/inventory/items/new" class="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </router-link>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            v-model="filters.search"
            placeholder="Search by name, code, or size..."
            class="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <select v-model="filters.warehouseId" class="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">All Warehouses</option>
          <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
            {{ warehouse.name }}
          </option>
        </select>
        <select v-model="filters.status" class="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock (&lt;10)</option>
          <option value="critical_stock">Critical Stock (&lt;500)</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        <button @click="resetFilters" class="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-600 dark:text-gray-400">
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 text-center hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ formatNumber(filteredItems.length) }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Total Items</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 text-center hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ formatNumber(totalStock) }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Total Units</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 text-center hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ formatNumber(lowStockCount) }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Low Stock (&lt;10)</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 text-center hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ formatNumber(criticalStockCount) }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Critical (&lt;500)</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 text-center hover:shadow-md transition-shadow">
        <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ formatNumber(outOfStockCount) }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Out of Stock</div>
      </div>
    </div>

    <!-- Items Table - Desktop View -->
    <div class="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Code</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Color</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Size</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Warehouse</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Stock</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="item in paginatedItems" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-4 py-3">
                <div class="font-semibold text-gray-900 dark:text-white">{{ item.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Supplier: {{ item.supplier || '—' }}</div>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-mono">{{ item.code }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm" :style="{ backgroundColor: item.color }"></span>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.color }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">{{ item.size || '—' }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ getWarehouseName(item.warehouseId) }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex flex-col items-center">
                  <span class="text-lg font-bold" :class="getStockTextClass(item.remainingQuantity)">
                    {{ formatNumber(item.remainingQuantity) }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatNumber(item.cartonsCount) }} cartons × {{ formatNumber(item.perCartonCount) }} + {{ formatNumber(item.singleBottlesCount) }} singles</span>
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="getStatusBadgeClass(item.remainingQuantity)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getStatusText(item.remainingQuantity) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <router-link :to="`/inventory/items/${item.id}`" class="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="View">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </router-link>
                  <router-link :to="`/inventory/items/${item.id}?edit=true`" class="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="Edit">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </router-link>
                  <button @click="openTransferModal(item)" class="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors" title="Transfer">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                  </button>
                  <button @click="openDispatchModal(item)" class="p-1.5 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors" title="Dispatch">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                  </button>
                  <button v-if="authStore.isSuperAdmin" @click="confirmDelete(item)" class="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedItems.length === 0">
              <td colspan="8" class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div v-for="item in paginatedItems" :key="item.id" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ item.name }}</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Code: {{ item.code }}</p>
          </div>
          <span :class="getStatusBadgeClass(item.remainingQuantity)" class="px-2 py-1 text-xs font-medium rounded-full">
            {{ getStatusText(item.remainingQuantity) }}
          </span>
        </div>
        
        <div class="grid grid-cols-2 gap-2 text-sm mb-3">
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" :style="{ backgroundColor: item.color }"></span>
            <span class="text-gray-700 dark:text-gray-300">{{ item.color }}</span>
          </div>
          <div><span class="text-gray-500 dark:text-gray-400">Size:</span> <span class="text-gray-700 dark:text-gray-300">{{ item.size || '—' }}</span></div>
          <div><span class="text-gray-500 dark:text-gray-400">Warehouse:</span> <span class="text-gray-700 dark:text-gray-300">{{ getWarehouseName(item.warehouseId) }}</span></div>
          <div><span class="text-gray-500 dark:text-gray-400">Stock:</span> <span :class="getStockTextClass(item.remainingQuantity)" class="font-bold">{{ formatNumber(item.remainingQuantity) }}</span></div>
        </div>
        
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {{ formatNumber(item.cartonsCount) }} cartons × {{ formatNumber(item.perCartonCount) }} + {{ formatNumber(item.singleBottlesCount) }} singles
        </div>
        
        <div class="flex justify-around pt-3 border-t border-gray-100 dark:border-gray-700">
          <router-link :to="`/inventory/items/${item.id}`" class="flex flex-col items-center text-blue-600 dark:text-blue-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span class="text-xs mt-1">View</span>
          </router-link>
          <router-link :to="`/inventory/items/${item.id}?edit=true`" class="flex flex-col items-center text-green-600 dark:text-green-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span class="text-xs mt-1">Edit</span>
          </router-link>
          <button @click="openTransferModal(item)" class="flex flex-col items-center text-purple-600 dark:text-purple-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
            <span class="text-xs mt-1">Transfer</span>
          </button>
          <button @click="openDispatchModal(item)" class="flex flex-col items-center text-orange-600 dark:text-orange-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            <span class="text-xs mt-1">Dispatch</span>
          </button>
        </div>
      </div>
      
      <div v-if="paginatedItems.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
        </svg>
        <p>No items found</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredItems.length > itemsPerPage" class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
      <div class="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
        Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredItems.length) }} of {{ formatNumber(filteredItems.length) }} items
      </div>
      <div class="flex gap-2 order-1 sm:order-2">
        <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
          Previous
        </button>
        <span class="px-3 py-1 text-gray-700 dark:text-gray-300">Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
          Next
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Confirm Delete</h3>
        <p class="mb-6 text-gray-600 dark:text-gray-400">Are you sure you want to delete item "{{ itemToDelete?.name }}"?</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
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
import * as XLSX from 'xlsx'

const inventoryStore = useInventoryStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(20)

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

// Format numbers (keep English numbers)
const formatNumber = (num: number): string => {
  if (num === undefined || num === null) return '0'
  return num.toLocaleString()
}

// Filtered items
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
  } else if (filters.value.status === 'critical_stock') {
    items = items.filter(item => item.remainingQuantity <= 500 && item.remainingQuantity > 0)
  } else if (filters.value.status === 'out_of_stock') {
    items = items.filter(item => item.remainingQuantity === 0)
  }
  
  return items
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage.value))
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredItems.value.slice(start, end)
})

// Stats
const totalStock = computed(() => filteredItems.value.reduce((sum, item) => sum + item.remainingQuantity, 0))
const lowStockCount = computed(() => filteredItems.value.filter(item => item.remainingQuantity <= 10 && item.remainingQuantity > 0).length)
const criticalStockCount = computed(() => filteredItems.value.filter(item => item.remainingQuantity <= 500 && item.remainingQuantity > 0).length)
const outOfStockCount = computed(() => filteredItems.value.filter(item => item.remainingQuantity === 0).length)

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const getWarehouseName = (warehouseId: string) => {
  const warehouse = warehouses.value.find(w => w.id === warehouseId)
  return warehouse?.name || 'Unknown'
}

const getStockTextClass = (quantity: number) => {
  if (quantity === 0) return 'text-red-600 dark:text-red-400'
  if (quantity <= 10) return 'text-yellow-600 dark:text-yellow-400'
  if (quantity <= 500) return 'text-orange-600 dark:text-orange-400'
  return 'text-green-600 dark:text-green-400'
}

const getStatusBadgeClass = (quantity: number) => {
  if (quantity === 0) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  if (quantity <= 10) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
  if (quantity <= 500) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
  return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
}

const getStatusText = (quantity: number) => {
  if (quantity === 0) return 'Out of Stock'
  if (quantity <= 10) return 'Low Stock'
  if (quantity <= 500) return 'Critical Stock'
  return 'In Stock'
}

const resetFilters = () => {
  filters.value = {
    search: '',
    warehouseId: '',
    status: '',
  }
  currentPage.value = 1
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
    await inventoryStore.fetchItems()
  }
}

// Helper to check if any filters are active
const hasActiveFilters = computed(() => {
  return filters.value.search || filters.value.warehouseId || filters.value.status
})

// Professional Excel Export with Arabic headers and English numbers
const exportToExcel = () => {
  // Prepare data with Arabic column headers
  const exportData = filteredItems.value.map(item => ({
    'الاسم': item.name,
    'الكود': item.code,
    'اللون': item.color,
    'المقاس': item.size || '—',
    'المخزن': getWarehouseName(item.warehouseId),
    'الكراتين': formatNumber(item.cartonsCount),
    'القطع لكل كرتون': formatNumber(item.perCartonCount),
    'القطع الفردية': formatNumber(item.singleBottlesCount),
    'إجمالي الكمية': formatNumber(item.remainingQuantity),
    'المورد': item.supplier || '—',
    'الحالة': getStatusText(item.remainingQuantity)
  }))

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData)

  // Set column widths for better readability
  ws['!cols'] = [
    { wch: 25 }, // الاسم
    { wch: 15 }, // الكود
    { wch: 12 }, // اللون
    { wch: 10 }, // المقاس
    { wch: 20 }, // المخزن
    { wch: 10 }, // الكراتين
    { wch: 15 }, // القطع لكل كرتون
    { wch: 12 }, // القطع الفردية
    { wch: 15 }, // إجمالي الكمية
    { wch: 20 }, // المورد
    { wch: 15 }  // الحالة
  ]

  // Style the header row
  const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1:K1')
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C })
    if (!ws[cellAddress]) continue
    ws[cellAddress].s = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "2E7D32" } },
      alignment: { horizontal: "center", vertical: "center" }
    }
  }

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير المخزون')

  // Add summary sheet
  const summaryData = [
    { 'التقرير': 'تقرير المخزون', 'القيمة': '' },
    { 'التقرير': 'تاريخ التصدير', 'القيمة': new Date().toLocaleDateString('ar-EG') },
    { 'التقرير': 'وقت التصدير', 'القيمة': new Date().toLocaleTimeString('ar-EG') },
    { 'التقرير': '', 'القيمة': '' },
    { 'التقرير': 'إجمالي الأصناف', 'القيمة': formatNumber(filteredItems.value.length) },
    { 'التقرير': 'إجمالي الوحدات', 'القيمة': formatNumber(totalStock.value) },
    { 'التقرير': 'الأصناف قليلة المخزون', 'القيمة': formatNumber(lowStockCount.value) },
    { 'التقرير': 'الأصناف الحرجة', 'القيمة': formatNumber(criticalStockCount.value) },
    { 'التقرير': 'الأصناف المنتهية', 'القيمة': formatNumber(outOfStockCount.value) }
  ]

  const wsSummary = XLSX.utils.json_to_sheet(summaryData)
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }]
  
  // Style summary header
  const summaryHeaderRange = XLSX.utils.decode_range(wsSummary['!ref'] || 'A1:B9')
  for (let C = summaryHeaderRange.s.c; C <= summaryHeaderRange.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C })
    if (wsSummary[cellAddress]) {
      wsSummary[cellAddress].s = {
        font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1565C0" } }
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, wsSummary, 'ملخص')

  // Add filter info sheet if filters are active
  if (hasActiveFilters.value) {
    const filterData = []
    if (filters.value.search) filterData.push({ 'الفلتر': 'البحث', 'القيمة': filters.value.search })
    if (filters.value.warehouseId) filterData.push({ 'الفلتر': 'المخزن', 'القيمة': getWarehouseName(filters.value.warehouseId) })
    if (filters.value.status) {
      const statusMap: Record<string, string> = {
        in_stock: 'متوفر',
        low_stock: 'مخزون منخفض',
        critical_stock: 'مخزون حرج',
        out_of_stock: 'نفد المخزون'
      }
      filterData.push({ 'الفلتر': 'الحالة', 'القيمة': statusMap[filters.value.status] || filters.value.status })
    }
    
    if (filterData.length > 0) {
      const wsFilters = XLSX.utils.json_to_sheet(filterData)
      wsFilters['!cols'] = [{ wch: 20 }, { wch: 30 }]
      XLSX.utils.book_append_sheet(wb, wsFilters, 'الفلاتر المستخدمة')
    }
  }

  // Generate filename with Arabic date
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const warehouseName = filters.value.warehouseId 
    ? getWarehouseName(filters.value.warehouseId).replace(/\s/g, '_')
    : 'جميع_المخازن'
  
  const fileName = `تقرير_المخزون_${warehouseName}_${year}-${month}-${day}.xlsx`
  
  // Save file
  XLSX.writeFile(wb, fileName)
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