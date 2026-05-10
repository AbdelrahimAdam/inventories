<template>
  <div class="w-full px-4 py-6 sm:py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">المخازن</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1 font-medium">إدارة جميع مواقع التخزين ونقاط الصرف</p>
      </div>
      <button 
        v-if="canManageWarehouses"
        @click="openAddModal" 
        class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all flex items-center gap-2 shadow-md font-bold"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        إضافة مخزن
      </button>
    </div>

    <!-- Tabs (Stylish) -->
    <div class="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
      <button 
        @click="activeTab = 'all'" 
        :class="tabClass('all')"
        class="px-6 py-2.5 text-sm font-extrabold uppercase tracking-wide transition-all duration-200"
      >
        الكل
      </button>
      <button 
        @click="activeTab = 'primary'" 
        :class="tabClass('primary')"
        class="px-6 py-2.5 text-sm font-extrabold uppercase tracking-wide transition-all duration-200"
      >
        المخازن الرئيسية
      </button>
      <button 
        @click="activeTab = 'dispatch'" 
        :class="tabClass('dispatch')"
        class="px-6 py-2.5 text-sm font-extrabold uppercase tracking-wide transition-all duration-200"
      >
        مواقع الصرف
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
        <div class="flex items-start justify-between">
          <div class="flex-1 space-y-3">
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
          <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>

    <!-- Warehouse Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="warehouse in filteredWarehouses"
        :key="warehouse.id"
        class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        :class="cardBgClass(warehouse)"
      >
        <!-- Decorative top bar -->
        <div class="absolute top-0 inset-x-0 h-1.5" :class="topBarClass(warehouse)"></div>
        
        <div class="p-5 pt-6">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-2">
                <h3 class="text-xl font-black text-white drop-shadow-sm">
                  {{ warehouse.name_ar || warehouse.name }}
                </h3>
                <span v-if="warehouse.type === 'primary'" class="px-2 py-0.5 text-xs font-bold rounded-full bg-white/20 text-white backdrop-blur-sm">رئيسي</span>
                <span v-else-if="warehouse.type === 'dispatch'" class="px-2 py-0.5 text-xs font-bold rounded-full bg-white/20 text-white backdrop-blur-sm">صرف</span>
                <span v-if="warehouse.is_main" class="px-2 py-0.5 text-xs font-bold rounded-full bg-yellow-400/30 text-yellow-100 backdrop-blur-sm">⭐ افتراضي</span>
              </div>

              <p class="text-white/80 text-sm font-medium truncate">
                {{ warehouse.name_en || warehouse.name }}
              </p>

              <!-- Metadata with icons -->
              <div class="mt-3 space-y-1.5">
                <div class="flex items-center gap-2 text-white/90 text-sm">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="font-medium">{{ formatDate(warehouse.createdAt) }}</span>
                </div>

                <div v-if="warehouse.created_by_name" class="flex items-center gap-2 text-white/80 text-xs">
                  <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>بواسطة: {{ warehouse.created_by_name }}</span>
                </div>

                <div v-if="warehouse.location" class="flex items-start gap-2 text-white/80 text-sm">
                  <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="truncate">{{ warehouse.location }}</span>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="mt-3">
                <span :class="statusClass(warehouse)" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                  <span class="w-1.5 h-1.5 rounded-full" :class="warehouse.is_active !== false ? 'bg-green-400' : 'bg-red-400'"></span>
                  {{ warehouse.is_active !== false ? 'نشط' : 'غير نشط' }}
                </span>
              </div>
            </div>

            <!-- Action Buttons (only for managers) -->
            <div v-if="canManageWarehouses" class="flex flex-col gap-2">
              <button @click="editWarehouse(warehouse)" class="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-white" title="تعديل">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="confirmDelete(warehouse)" class="p-2 bg-white/20 hover:bg-red-500/50 rounded-xl transition-all text-white" title="حذف">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && filteredWarehouses.length === 0" class="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      <svg class="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <p class="text-gray-500 dark:text-gray-400 font-medium text-lg">لا توجد مخازن</p>
      <p v-if="canManageWarehouses" class="text-gray-400 dark:text-gray-500 text-sm mt-1">انقر فوق "إضافة مخزن" لإنشاء أول مخزن</p>
    </div>

    <!-- Warehouse Modal -->
    <WarehouseModal
      :is-open="showModal"
      :warehouse="selectedWarehouse"
      @close="closeModal"
      @save="onWarehouseSaved"
    />

    <!-- Delete Confirmation Modal (Enhanced) -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 transform transition-all">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white">تأكيد الحذف</h3>
        </div>

        <p class="text-gray-700 dark:text-gray-300 mb-6">
          هل أنت متأكد من حذف المخزن <span class="font-bold">{{ warehouseToDelete?.name_ar || warehouseToDelete?.name }}</span>؟
          <br><span class="text-sm text-red-600 dark:text-red-400">⚠️ سيؤدي ذلك أيضاً إلى حذف جميع الأصناف المرتبطة به.</span>
        </p>

        <div class="flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-bold text-gray-700 dark:text-gray-300">
            إلغاء
          </button>
          <button @click="deleteWarehouse" :disabled="isDeleting" class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all shadow-md font-bold disabled:opacity-50 flex items-center gap-2">
            <svg v-if="isDeleting" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
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

const isLoading = ref(false)
const isDeleting = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const selectedWarehouse = ref<WarehouseExtended | null>(null)
const warehouseToDelete = ref<WarehouseExtended | null>(null)
const activeTab = ref<'all' | 'primary' | 'dispatch'>('all')

const canManageWarehouses = computed(() => {
  return authStore.isSuperAdmin || authStore.isCompanyManager
})

const filteredWarehouses = computed<WarehouseExtended[]>(() => {
  let warehouses = [...(warehouseStore.warehouses || [])] as WarehouseExtended[]

  if (activeTab.value === 'primary') {
    warehouses = warehouses.filter(w => w.type === 'primary')
  } else if (activeTab.value === 'dispatch') {
    warehouses = warehouses.filter(w => w.type === 'dispatch')
  }

  if (authStore.isWarehouseManager) {
    const allowedPrimary = authStore.allowedWarehouses
    const allowedDispatch = authStore.allowedDispatchWarehouses
    const allAllowed = [...allowedPrimary, ...allowedDispatch]
    if (allAllowed.length > 0 && !allAllowed.includes('all')) {
      warehouses = warehouses.filter(w => allAllowed.includes(w.id))
    }
  }

  return warehouses
})

// Dynamic card background gradients
const cardBgClass = (warehouse: WarehouseExtended) => {
  if (warehouse.is_active === false) return 'bg-gradient-to-br from-gray-500 to-gray-700'
  if (warehouse.type === 'primary') return 'bg-gradient-to-br from-blue-600 to-indigo-700'
  if (warehouse.type === 'dispatch') return 'bg-gradient-to-br from-orange-500 to-red-600'
  return 'bg-gradient-to-br from-teal-600 to-cyan-700'
}

const topBarClass = (warehouse: WarehouseExtended) => {
  if (warehouse.is_active === false) return 'bg-gray-400'
  if (warehouse.type === 'primary') return 'bg-blue-400'
  if (warehouse.type === 'dispatch') return 'bg-orange-400'
  return 'bg-teal-400'
}

const tabClass = (tab: string) => [
  activeTab.value === tab
    ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400'
    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
]

const statusClass = (warehouse: WarehouseExtended) => [
  warehouse.is_active !== false 
    ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
    : 'bg-red-500/20 text-red-100 border border-red-400/30'
]

const formatDate = (date: Date | string | undefined) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

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
  await loadWarehouses()
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
      await loadWarehouses()
    }
  } catch (error) {
    console.error('Error deleting warehouse:', error)
    alert('حدث خطأ أثناء حذف المخزن')
  } finally {
    isDeleting.value = false
  }
}

const loadWarehouses = async () => {
  isLoading.value = true
  try {
    await warehouseStore.fetchWarehouses()
  } catch (error) {
    console.error('Failed to load warehouses:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadWarehouses()
})
</script>
