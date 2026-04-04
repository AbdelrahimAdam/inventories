<template>
  <div class="container mx-auto px-4 py-8" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ $t('inventory.warehouses.title') }}</h1>
      <button @click="showAddModal = true" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
        + {{ $t('inventory.warehouses.addWarehouse') }}
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="warehouse in warehouseStore.warehouses" :key="warehouse.id" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold text-lg mb-2">{{ warehouse.name }}</h3>
            <p class="text-gray-600 text-sm">{{ $t('inventory.warehouses.itemsCount') }}: {{ warehouse.itemCount || 0 }}</p>
            <p class="text-gray-600 text-sm">{{ $t('common.createdAt') }}: {{ formatDate(warehouse.createdAt) }}</p>
          </div>
          <div class="flex space-x-2">
            <button @click="editWarehouse(warehouse)" class="text-green-600 hover:text-green-800">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click="confirmDelete(warehouse)" class="text-red-600 hover:text-red-800">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Warehouse Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">{{ $t('inventory.warehouses.addWarehouse') }}</h3>
        <form @submit.prevent="addWarehouse">
          <input
            type="text"
            v-model="newWarehouseName"
            placeholder="Warehouse Name"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <div class="flex justify-end space-x-3">
            <button type="button" @click="showAddModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
              {{ $t('common.cancel') }}
            </button>
            <button type="submit" :disabled="isLoading" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
              {{ isLoading ? $t('common.loading') : $t('common.add') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">{{ $t('common.confirm') }}</h3>
        <p class="mb-6">{{ $t('messages.confirmDeleteWarehouse') }}</p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
            {{ $t('common.cancel') }}
          </button>
          <button @click="deleteWarehouse" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWarehouseStore } from '@/stores/warehouse'
import type { Warehouse } from '@/types'

const warehouseStore = useWarehouseStore()
const isLoading = ref(false)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const newWarehouseName = ref('')
const warehouseToDelete = ref<Warehouse | null>(null)

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString()
}

const addWarehouse = async () => {
  if (!newWarehouseName.value.trim()) return
  
  isLoading.value = true
  const success = await warehouseStore.addWarehouse(newWarehouseName.value)
  isLoading.value = false
  
  if (success) {
    showAddModal.value = false
    newWarehouseName.value = ''
  }
}

const editWarehouse = (warehouse: Warehouse) => {
  // Implement edit functionality
  console.log('Edit warehouse:', warehouse)
}

const confirmDelete = (warehouse: Warehouse) => {
  warehouseToDelete.value = warehouse
  showDeleteModal.value = true
}

const deleteWarehouse = async () => {
  if (!warehouseToDelete.value) return
  
  // Implement delete functionality
  showDeleteModal.value = false
  warehouseToDelete.value = null
}

onMounted(() => {
  warehouseStore.fetchWarehouses()
})
</script>