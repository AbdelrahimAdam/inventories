<template>
  <div class="container mx-auto px-4 py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Warehouses</h1>
      <button @click="openAddModal" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
        + Add Warehouse
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
      <button @click="activeTab = 'all'" :class="tabClass('all')">الكل</button>
      <button @click="activeTab = 'primary'" :class="tabClass('primary')">المخازن الرئيسية</button>
      <button @click="activeTab = 'dispatch'" :class="tabClass('dispatch')">مواقع الصرف</button>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="warehouse in filteredWarehouses"
        :key="warehouse.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-semibold text-lg text-gray-900 dark:text-white">
                {{ warehouse.name_ar || warehouse.name }}
              </h3>

              <span v-if="warehouse.type === 'primary'" class="badge-blue">رئيسي</span>
              <span v-else-if="warehouse.type === 'dispatch'" class="badge-orange">صرف</span>
              <span v-if="warehouse.is_main" class="badge-yellow">⭐ رئيسي</span>
            </div>

            <p class="text-gray-500 dark:text-gray-400 text-sm">
              {{ warehouse.name_en || warehouse.name }}
            </p>

            <p class="text-gray-600 dark:text-gray-300 text-sm mt-2">
              المعرف: {{ warehouse.id }}
            </p>

            <p class="text-gray-600 dark:text-gray-300 text-sm">
              عدد الأصناف: {{ warehouse.itemCount || 0 }}
            </p>

            <p class="text-gray-600 dark:text-gray-300 text-sm">
              تاريخ الإنشاء: {{ formatDate(warehouse.createdAt) }}
            </p>

            <p v-if="warehouse.location" class="text-gray-500 text-xs mt-2">
              📍 {{ warehouse.location }}
            </p>

            <p v-if="warehouse.description" class="text-gray-400 text-xs mt-1">
              {{ warehouse.description }}
            </p>

            <span :class="statusClass(warehouse)">
              {{ warehouse.is_active !== false ? 'نشط' : 'غير نشط' }}
            </span>
          </div>

          <div class="flex space-x-2 mr-4">
            <button @click="editWarehouse(warehouse)" class="text-green-600 hover:text-green-800">
              ✏️
            </button>
            <button @click="confirmDelete(warehouse)" class="text-red-600 hover:text-red-800">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredWarehouses.length === 0" class="text-center py-12 text-gray-500">
      لا توجد مخازن
    </div>

    <!-- Modal -->
    <WarehouseModal
      :is-open="showModal"
      :warehouse="selectedWarehouse"
      @close="closeModal"
      @save="onWarehouseSaved"
    />

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">تأكيد الحذف</h3>

        <p class="mb-6 text-gray-700 dark:text-gray-300">
          هل أنت متأكد من حذف المخزن "{{ warehouseToDelete?.name_ar || warehouseToDelete?.name }}"؟
          سيؤدي ذلك أيضاً إلى حذف جميع الأصناف فيه.
        </p>

        <div class="flex justify-end space-x-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg">
            إلغاء
          </button>
          <button @click="deleteWarehouse" :disabled="isDeleting" class="px-4 py-2 bg-red-600 text-white rounded-lg">
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

/**
 * ✅ FIX: Extend Warehouse type safely
 */
type WarehouseExtended = Warehouse & {
  name_ar?: string
  name_en?: string
  type?: 'primary' | 'dispatch'
  is_main?: boolean
  location?: string
  description?: string
  is_active?: boolean
}

const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()

const isDeleting = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const selectedWarehouse = ref<WarehouseExtended | null>(null)
const warehouseToDelete = ref<WarehouseExtended | null>(null)
const activeTab = ref<'all' | 'primary' | 'dispatch'>('all')

const filteredWarehouses = computed<WarehouseExtended[]>(() => {
  let warehouses = (warehouseStore.warehouses || []) as WarehouseExtended[]

  if (activeTab.value === 'primary') {
    warehouses = warehouses.filter(w => w.type === 'primary')
  } else if (activeTab.value === 'dispatch') {
    warehouses = warehouses.filter(w => w.type === 'dispatch')
  }

  return warehouses
})

const formatDate = (date: Date) => {
  return date ? new Date(date).toLocaleDateString('ar-EG') : 'N/A'
}

const tabClass = (tab: string) => [
  'px-4 py-2 text-sm font-medium transition',
  activeTab.value === tab
    ? 'border-b-2 border-green-600 text-green-600'
    : 'text-gray-500 hover:text-gray-700'
]

const statusClass = (warehouse: WarehouseExtended) => [
  'inline-block mt-2 px-2 py-0.5 text-xs rounded-full',
  warehouse.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
]

const openAddModal = () => {
  selectedWarehouse.value = null
  showModal.value = true
}

const editWarehouse = (warehouse: WarehouseExtended) => {
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

const confirmDelete = (warehouse: WarehouseExtended) => {
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
    console.error(error)
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  warehouseStore.fetchWarehouses()
})
</script>