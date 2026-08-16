<template>
  <div :dir="languageStore.isRTL ? 'rtl' : 'ltr'" class="w-full px-2 sm:px-4 py-3 sm:py-6 pb-20">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">المخازن</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">إدارة جميع مواقع التخزين ونقاط الصرف</p>
      </div>
      <button 
        v-if="canManageWarehouses"
        @click="openAddModal" 
        class="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all inline-flex items-center justify-center gap-1.5 shadow-md font-bold text-xs sm:text-sm min-h-[44px]"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        إضافة مخزن
      </button>
    </div>

    <!-- Stats Cards - Now showing accessible warehouses only -->
    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2 mb-3">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-1.5 sm:p-2 text-white overflow-hidden">
        <p class="text-[10px] sm:text-xs font-bold text-blue-100 truncate">إجمالي المخازن</p>
        <p class="text-sm sm:text-base lg:text-lg font-black truncate">{{ accessibleWarehousesCount }}</p>
      </div>
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-1.5 sm:p-2 text-white overflow-hidden">
        <p class="text-[10px] sm:text-xs font-bold text-green-100 truncate">مخازن رئيسية</p>
        <p class="text-sm sm:text-base lg:text-lg font-black truncate">{{ accessiblePrimaryCount }}</p>
      </div>
      <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-1.5 sm:p-2 text-white overflow-hidden">
        <p class="text-[10px] sm:text-xs font-bold text-orange-100 truncate">مواقع صرف</p>
        <p class="text-sm sm:text-base lg:text-lg font-black truncate">{{ accessibleDispatchCount }}</p>
      </div>
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-1.5 sm:p-2 text-white overflow-hidden">
        <p class="text-[10px] sm:text-xs font-bold text-purple-100 truncate">نشطة</p>
        <p class="text-sm sm:text-base lg:text-lg font-black truncate">{{ accessibleActiveCount }}</p>
      </div>
      <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-1.5 sm:p-2 text-white overflow-hidden">
        <p class="text-[10px] sm:text-xs font-bold text-red-100 truncate">غير نشطة</p>
        <p class="text-sm sm:text-base lg:text-lg font-black truncate">{{ accessibleInactiveCount }}</p>
      </div>
    </div>

    <!-- Filters - Organized like item list -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4 mb-4">
      <!-- Search Bar -->
      <div class="relative mb-3">
        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="بحث عن مخزن بالاسم أو الموقع..." 
          class="w-full pl-9 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium min-h-[44px]"
          :class="{ 'border-green-500 ring-2 ring-green-500': isSearching }"
        />
        <div v-if="isSearching" class="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
        </div>
        <button v-if="searchQuery && !isSearching" @click="clearSearch" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-h-[44px] px-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Search Results Count -->
      <div v-if="searchQuery" class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
        <span>{{ filteredWarehouses.length }} نتيجة <span v-if="isSearching">(جارٍ البحث...)</span></span>
        <span v-if="filteredWarehouses.length === 0 && searchQuery.length >= 2 && !isSearching" class="text-green-600 dark:text-green-400">لا توجد نتائج مطابقة</span>
      </div>

      <!-- Tabs as Filter -->
      <div class="flex gap-1 sm:gap-2 flex-wrap mb-2">
        <button 
          @click="activeTab = 'all'" 
          class="px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl border transition-all min-h-[40px]"
          :class="activeTab === 'all' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'"
        >
          الكل
          <span class="inline-block mr-1 px-1.5 py-0.5 text-[10px] rounded-full" :class="activeTab === 'all' ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'">
            {{ accessibleWarehousesCount }}
          </span>
        </button>
        <button 
          @click="activeTab = 'primary'" 
          class="px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl border transition-all min-h-[40px]"
          :class="activeTab === 'primary' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'"
        >
          رئيسية
          <span class="inline-block mr-1 px-1.5 py-0.5 text-[10px] rounded-full" :class="activeTab === 'primary' ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'">
            {{ accessiblePrimaryCount }}
          </span>
        </button>
        <button 
          @click="activeTab = 'dispatch'" 
          class="px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl border transition-all min-h-[40px]"
          :class="activeTab === 'dispatch' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'"
        >
          صرف
          <span class="inline-block mr-1 px-1.5 py-0.5 text-[10px] rounded-full" :class="activeTab === 'dispatch' ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'">
            {{ accessibleDispatchCount }}
          </span>
        </button>
      </div>

      <!-- Filter Actions -->
      <div class="flex justify-between items-center mt-2">
        <button @click="resetFilters" class="px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-semibold text-gray-700 dark:text-gray-300 min-h-[40px]">
          إعادة تعيين
        </button>
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
          إجمالي {{ filteredWarehouses.length }} مخزن
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div v-for="i in 6" :key="i" class="animate-pulse">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div class="space-y-2">
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Warehouse Grid -->
    <div v-else-if="filteredWarehouses.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="warehouse in filteredWarehouses"
        :key="warehouse.id"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        <!-- Colored top bar -->
        <div class="h-1 w-full" :class="getTopBarClass(warehouse)"></div>

        <div class="p-3 sm:p-4">
          <!-- Header -->
          <div class="flex justify-between items-start gap-2 mb-2">
            <div class="flex-1 min-w-0">
              <h3 class="text-sm sm:text-base font-black text-gray-900 dark:text-white truncate" :title="warehouse.name_ar || warehouse.name">
                {{ warehouse.name_ar || warehouse.name }}
              </h3>
              <div class="flex flex-wrap gap-1 mt-0.5">
                <span v-if="warehouse.type === 'primary'" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  رئيسي
                </span>
                <span v-else-if="warehouse.type === 'dispatch'" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                  صرف
                </span>
                <span v-if="warehouse.is_main" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                  ⭐ افتراضي
                </span>
              </div>
            </div>
            <div v-if="canManageWarehouses" class="flex gap-0.5 flex-shrink-0">
              <button @click="editWarehouse(warehouse)" class="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center" title="تعديل">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="confirmDelete(warehouse)" class="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center" title="حذف">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- English name -->
          <p v-if="warehouse.name_en" class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ warehouse.name_en }}</p>

          <!-- Meta info -->
          <div class="space-y-1 mb-2">
            <div v-if="warehouse.location" class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="truncate" :title="warehouse.location">{{ warehouse.location }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{{ formatDate(warehouse.createdAt) }}</span>
            </div>
            <div v-if="warehouse.created_by_name" class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{{ warehouse.created_by_name }}</span>
            </div>
            <div v-if="warehouse.itemCount !== undefined" class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
              </svg>
              <span>{{ warehouse.itemCount }} صنف</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
            <span class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full" :class="warehouse.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'">
              <span class="w-1.5 h-1.5 rounded-full" :class="warehouse.is_active ? 'bg-green-500' : 'bg-red-500'"></span>
              {{ warehouse.is_active ? 'نشط' : 'غير نشط' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 sm:p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <p class="text-lg font-bold text-gray-900 dark:text-white">{{ searchQuery ? 'لا توجد نتائج مطابقة' : 'لا توجد مخازن' }}</p>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {{ searchQuery ? 'حاول تعديل كلمات البحث' : (canManageWarehouses ? 'انقر فوق "إضافة مخزن" لإنشاء أول مخزن' : 'ليس لديك صلاحية لإضافة مخازن') }}
      </p>
    </div>

    <!-- Warehouse Modal -->
    <WarehouseModal
      :is-open="showModal"
      :warehouse="selectedWarehouse"
      @close="closeModal"
      @save="onWarehouseSaved"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showDeleteModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">تأكيد الحذف</h3>
        </div>

        <div class="mb-6">
          <p class="text-gray-600 dark:text-gray-400 font-medium">
            هل أنت متأكد من حذف المخزن <strong class="text-gray-900 dark:text-white">{{ warehouseToDelete?.name_ar || warehouseToDelete?.name }}</strong>؟
          </p>
          <p class="text-sm text-red-600 dark:text-red-400 mt-2">⚠️ سيؤدي ذلك أيضاً إلى حذف جميع الأصناف المرتبطة به.</p>
        </div>

        <div class="flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold min-h-[44px] text-gray-700 dark:text-gray-300">
            إلغاء
          </button>
          <button @click="deleteWarehouse" :disabled="isDeleting" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md font-bold transition-all min-h-[44px] disabled:opacity-50 flex items-center gap-2">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useWarehouseStore } from '@/stores/warehouse'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import WarehouseModal from '@/components/modals/WarehouseModal.vue'
import type { Warehouse } from '@/stores/warehouse'

const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

const isLoading = ref(false)
const isDeleting = ref(false)
const isSearching = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const selectedWarehouse = ref<Warehouse | null>(null)
const warehouseToDelete = ref<Warehouse | null>(null)
const activeTab = ref<'all' | 'primary' | 'dispatch'>('all')
const searchQuery = ref('')
let searchDebounce: ReturnType<typeof setTimeout> | null = null

const canManageWarehouses = computed(() => authStore.canManageWarehouses)

// ===== FIX: Get accessible warehouses based on user role =====
const accessibleWarehouses = computed(() => {
  let warehouses = warehouseStore.warehouses || []
  
  // If user is warehouse manager, filter by allowed warehouses
  if (authStore.isWarehouseManager) {
    const allowedPrimary = authStore.user?.allowedWarehouses || []
    const allowedDispatch = authStore.user?.allowedDispatchWarehouses || []
    const allAllowed = [...allowedPrimary, ...allowedDispatch]
    
    // If user has specific warehouse permissions
    if (allAllowed.length > 0 && !allAllowed.includes('all')) {
      warehouses = warehouses.filter(w => allAllowed.includes(w.id))
    } else if (allAllowed.includes('all')) {
      // User has access to all warehouses
      return warehouses
    }
  }
  
  return warehouses
})

// ===== FIX: Stats computed from accessible warehouses only =====
const accessibleWarehousesCount = computed(() => accessibleWarehouses.value.length)
const accessiblePrimaryCount = computed(() => accessibleWarehouses.value.filter(w => w.type === 'primary').length)
const accessibleDispatchCount = computed(() => accessibleWarehouses.value.filter(w => w.type === 'dispatch').length)
const accessibleActiveCount = computed(() => accessibleWarehouses.value.filter(w => w.is_active).length)
const accessibleInactiveCount = computed(() => accessibleWarehouses.value.filter(w => !w.is_active).length)

// ===== FIX: Filtered warehouses based on accessible list =====
const filteredWarehouses = computed(() => {
  // Start with accessible warehouses only
  let warehouses = [...accessibleWarehouses.value]

  if (activeTab.value === 'primary') {
    warehouses = warehouses.filter(w => w.type === 'primary')
  } else if (activeTab.value === 'dispatch') {
    warehouses = warehouses.filter(w => w.type === 'dispatch')
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    warehouses = warehouses.filter(w => 
      w.name?.toLowerCase().includes(query) ||
      w.name_ar?.toLowerCase().includes(query) ||
      w.name_en?.toLowerCase().includes(query) ||
      w.location?.toLowerCase().includes(query)
    )
  }

  return warehouses
})

const getTopBarClass = (warehouse: Warehouse) => {
  if (!warehouse.is_active) return 'bg-gray-400 dark:bg-gray-600'
  if (warehouse.type === 'primary') return 'bg-blue-500'
  if (warehouse.type === 'dispatch') return 'bg-orange-500'
  return 'bg-green-500'
}

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  } catch {
    return '—'
  }
}

const openAddModal = () => {
  if (!canManageWarehouses.value) return
  selectedWarehouse.value = null
  showModal.value = true
}

const editWarehouse = (warehouse: Warehouse) => {
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

const confirmDelete = (warehouse: Warehouse) => {
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

const clearSearch = () => {
  searchQuery.value = ''
  isSearching.value = false
  if (searchDebounce) {
    clearTimeout(searchDebounce)
    searchDebounce = null
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  activeTab.value = 'all'
  isSearching.value = false
  if (searchDebounce) {
    clearTimeout(searchDebounce)
    searchDebounce = null
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

watch(searchQuery, (newVal) => {
  if (searchDebounce) clearTimeout(searchDebounce)
  
  if (newVal.length >= 2) {
    isSearching.value = true
  }
  
  searchDebounce = setTimeout(() => {
    isSearching.value = false
  }, 300)
})

onMounted(() => {
  loadWarehouses()
})
</script>

<style scoped>
@media (min-width: 480px) {
  .xs\:inline { display: inline; }
  .xs\:hidden { display: none; }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  input, select, button {
    font-size: 16px !important;
  }
}
</style>