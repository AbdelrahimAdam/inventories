<template>
  <div class="container mx-auto px-4 py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">المخازن</h1>
      <button 
        v-if="canManageWarehouses"
        @click="openAddModal" 
        class="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
      >
        + إضافة مخزن
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
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <h3 class="font-semibold text-lg text-gray-900 dark:text-white">
                {{ warehouse.name_ar || warehouse.name }}
              </h3>

              <span v-if="warehouse.type === 'primary'" class="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">رئيسي</span>
              <span v-else-if="warehouse.type === 'dispatch'" class="px-2 py-1 text-xs rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">صرف</span>
              <span v-if="warehouse.is_main" class="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">⭐ افتراضي</span>
            </div>

            <p class="text-gray-500 dark:text-gray-400 text-sm">
              {{ warehouse.name_en || warehouse.name }}
            </p>

            <!-- Created By -->
            <p class="text-gray-600 dark:text-gray-300 text-sm mt-2">
              <span class="font-medium">تم الإنشاء بواسطة:</span> 
              {{ warehouse.created_by_name || (warehouse as any).created_by?.slice(0, 8) || '—' }}
            </p>

            <!-- Updated By (if exists) -->
            <p v-if="warehouse.updated_by" class="text-gray-600 dark:text-gray-300 text-sm">
              <span class="font-medium">آخر تحديث بواسطة:</span> 
              {{ warehouse.updated_by_name || (warehouse as any).updated_by?.slice(0, 8) || '—' }}
            </p>

            <p class="text-gray-600 dark:text-gray-300 text-sm">
              <span class="font-medium">عدد الأصناف:</span> {{ warehouse.itemCount || 0 }}
            </p>

            <p class="text-gray-600 dark:text-gray-300 text-sm">
              <span class="font-medium">تاريخ الإنشاء:</span> {{ formatDate(warehouse.createdAt) }}
            </p>

            <p v-if="warehouse.location" class="text-gray-500 dark:text-gray-400 text-xs mt-2">
              📍 {{ warehouse.location }}
            </p>

            <p v-if="warehouse.description" class="text-gray-400 dark:text-gray-500 text-xs mt-1">
              {{ warehouse.description }}
            </p>

            <span :class="statusClass(warehouse)">
              {{ warehouse.is_active !== false ? 'نشط' : 'غير نشط' }}
            </span>
          </div>

          <div v-if="canManageWarehouses" class="flex space-x-2 mr-4" :class="languageStore.isRTL ? 'space-x-reverse' : ''">
            <button @click="editWarehouse(warehouse)" class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors" title="تعديل">
              ✏️
            </button>
            <button @click="confirmDelete(warehouse)" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="حذف">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredWarehouses.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
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
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">تأكيد الحذف</h3>

        <p class="mb-6 text-gray-700 dark:text-gray-300">
          هل أنت متأكد من حذف المخزن "{{ warehouseToDelete?.name_ar || warehouseToDelete?.name }}"؟
          سيؤدي ذلك أيضاً إلى حذف جميع الأصناف فيه.
        </p>

        <div class="flex justify-end space-x-3" :class="languageStore.isRTL ? 'space-x-reverse' : ''">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
            إلغاء
          </button>
          <button @click="deleteWarehouse" :disabled="isDeleting" class="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors shadow-md">
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
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import WarehouseModal from '@/components/modals/WarehouseModal.vue'
import type { Warehouse } from '@/types'

/**
 * Extend Warehouse type safely - removed 'type' since it's inherited from Warehouse
 */
interface WarehouseExtended extends Warehouse {
  name_ar?: string
  name_en?: string
  is_main?: boolean
  location?: string
  description?: string
  is_active?: boolean
  created_by?: string
  created_by_name?: string
  updated_by?: string
  updated_by_name?: string
  itemCount?: number
}

const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

const isDeleting = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const selectedWarehouse = ref<WarehouseExtended | null>(null)
const warehouseToDelete = ref<WarehouseExtended | null>(null)
const activeTab = ref<'all' | 'primary' | 'dispatch'>('all')

// Permission check - only superadmin and company manager can manage warehouses
const canManageWarehouses = computed(() => {
  return authStore.isSuperAdmin || authStore.isCompanyManager
})

// Filter warehouses based on user role and tab
const filteredWarehouses = computed<WarehouseExtended[]>(() => {
  let warehouses = [...(warehouseStore.warehouses || [])] as WarehouseExtended[]

  // Filter by tab
  if (activeTab.value === 'primary') {
    warehouses = warehouses.filter(w => w.type === 'primary')
  } else if (activeTab.value === 'dispatch') {
    warehouses = warehouses.filter(w => w.type === 'dispatch')
  }

  // Filter by accessible warehouses for warehouse managers
  if (authStore.isWarehouseManager) {
    // Use the new auth store getters
    const allowedPrimary = authStore.allowedWarehouses
    const allowedDispatch = authStore.allowedDispatchWarehouses
    
    // Combine both arrays
    const allAllowed = [...allowedPrimary, ...allowedDispatch]
    
    if (allAllowed.length > 0 && !allAllowed.includes('all')) {
      warehouses = warehouses.filter(w => allAllowed.includes(w.id))
    }
  }

  return warehouses
})

const formatDate = (date: Date) => {
  return date ? new Date(date).toLocaleDateString('ar-EG') : 'غير متوفر'
}

const tabClass = (tab: string) => [
  'px-4 py-2 text-sm font-medium transition-all duration-200',
  activeTab.value === tab
    ? 'border-b-2 border-green-600 text-green-600 dark:border-green-500 dark:text-green-400'
    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 hover:border-gray-300'
]

const statusClass = (warehouse: WarehouseExtended) => [
  'inline-block mt-2 px-2 py-0.5 text-xs rounded-full',
  warehouse.is_active !== false 
    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
]

const openAddModal = () => {
  if (!canManageWarehouses.value) return
  selectedWarehouse.value = null
  showModal.value = true
}

const editWarehouse = (warehouse: WarehouseExtended) => {
  if (!canManageWarehouses.value) return
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
  if (!canManageWarehouses.value) return
  warehouseToDelete.value = warehouse
  showDeleteModal.value = true
}

const deleteWarehouse = async () => {
  if (!warehouseToDelete.value || !canManageWarehouses.value) return

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

<style scoped>
/* Additional styles for better RTL support */
.space-x-reverse {
  flex-direction: row-reverse;
}
</style>