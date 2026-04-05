<template>
  <div class="container mx-auto px-4 py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Warehouses</h1>
      <button @click="openAddModal" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
        + Add Warehouse
      </button>
    </div>

    <!-- Warehouse Type Tabs -->
    <div class="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
      <button
        @click="activeTab = 'all'"
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors duration-200',
          activeTab === 'all'
            ? 'border-b-2 border-green-600 text-green-600 dark:text-green-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        ]"
      >
        الكل
      </button>
      <button
        @click="activeTab = 'primary'"
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors duration-200',
          activeTab === 'primary'
            ? 'border-b-2 border-green-600 text-green-600 dark:text-green-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        ]"
      >
        المخازن الرئيسية
      </button>
      <button
        @click="activeTab = 'dispatch'"
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors duration-200',
          activeTab === 'dispatch'
            ? 'border-b-2 border-green-600 text-green-600 dark:text-green-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        ]"
      >
        مواقع الصرف
      </button>
    </div>

    <!-- Warehouses Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="warehouse in filteredWarehouses" :key="warehouse.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-semibold text-lg text-gray-900 dark:text-white">{{ warehouse.name_ar || warehouse.name }}</h3>
              <span 
                v-if="warehouse.type === 'primary'" 
                class="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              >
                رئيسي
              </span>
              <span 
                v-else-if="warehouse.type === 'dispatch'" 
                class="px-2 py-0.5 text-xs rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
              >
                صرف
              </span>
              <span 
                v-if="warehouse.is_main" 
                class="px-2 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
              >
                ⭐ رئيسي
              </span>
            </div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">{{ warehouse.name_en || warehouse.name }}</p>
            <p class="text-gray-600 dark:text-gray-300 text-sm mt-2">المعرف: {{ warehouse.id }}</p>
            <p class="text-gray-600 dark:text-gray-300 text-sm">عدد الأصناف: {{ warehouse.itemCount || 0 }}</p>
            <p class="text-gray-600 dark:text-gray-300 text-sm">تاريخ الإنشاء: {{ formatDate(warehouse.createdAt) }}</p>
            <div v-if="warehouse.location" class="mt-2">
              <p class="text-gray-500 dark:text-gray-400 text-xs">📍 {{ warehouse.location }}</p>
            </div>
            <div v-if="warehouse.description" class="mt-1">
              <p class="text-gray-400 dark:text-gray-500 text-xs">{{ warehouse.description }}</p>
            </div>
            <div class="mt-2">
              <span 
                :class="[
                  'px-2 py-0.5 text-xs rounded-full',
                  warehouse.is_active !== false
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                ]"
              >
                {{ warehouse.is_active !== false ? 'نشط' : 'غير نشط' }}
              </span>
            </div>
          </div>
          <div class="flex space-x-2 mr-4">
            <button @click="editWarehouse(warehouse)" class="text-green-600 hover:text-green-800 transition-colors" title="Edit">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click="confirmDelete(warehouse)" class="text-red-600 hover:text-red-800 transition-colors" title="Delete">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredWarehouses.length === 0" class="text-center py-12 text-gray-500">
      لا توجد مخازن
    </div>

    <!-- Warehouse Modal -->
    <WarehouseModal
      :is-open="showModal"
      :warehouse="selectedWarehouse"
      @close="closeModal"
      @save="onWarehouseSaved"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">تأكيد الحذف</h3>
        <p class="mb-6 text-gray-700 dark:text-gray-300">هل أنت متأكد من حذف المخزن "{{ warehouseToDelete?.name_ar || warehouseToDelete?.name }}"? سيؤدي ذلك أيضاً إلى حذف جميع الأصناف فيه.</p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
            إلغاء
          </button>
          <button @click="deleteWarehouse" :disabled="isDeleting" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
            {{ isDeleting ? 'جاري الحذف...' : 'حذف' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import WarehouseModal from '@/components/modals/WarehouseModal.vue'
import type { Warehouse } from '@/types'

const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()

const isLoading = ref(false)
const isDeleting = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const selectedWarehouse = ref<Warehouse | null>(null)
const warehouseToDelete = ref<Warehouse | null>(null)
const activeTab = ref<'all' | 'primary' | 'dispatch'>('all')

const filteredWarehouses = computed(() => {
  let warehouses = warehouseStore.warehouses || []
  
  if (activeTab.value === 'primary') {
    warehouses = warehouses.filter(w => w.type === 'primary')
  } else if (activeTab.value === 'dispatch') {
    warehouses = warehouses.filter(w => w.type === 'dispatch')
  }
  
  return warehouses
})

const formatDate = (date: Date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('ar-EG')
}

const openAddModal = () => {
  selectedWarehouse.value = null
  showModal.value = true
}

const editWarehouse = (warehouse: Warehouse) => {
  selectedWarehouse.value = warehouse
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedWarehouse.value = null
}

const onWarehouseSaved = async () => {
  await warehouseStore.fetchWarehouses()
  closeModal()
}

const confirmDelete = (warehouse: Warehouse) => {
  warehouseToDelete.value = warehouse
  showDeleteModal.value = true
}

const deleteWarehouse = async () => {
  if (!warehouseToDelete.value) return
  
  isDeleting.value = true
  try {
    const success = await warehouseStore.deleteWarehouse(warehouseToDelete.value.id)
    if (success) {
      showDeleteModal.value = false
      warehouseToDelete.value = null
      await warehouseStore.fetchWarehouses()
    }
  } catch (error) {
    console.error('Error deleting warehouse:', error)
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  warehouseStore.fetchWarehouses()
})
</script>