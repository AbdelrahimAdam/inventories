<template>
  <div class="warehouses-page" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">المخازن</h1>
        <p class="page-subtitle">إدارة جميع مواقع التخزين ونقاط الصرف</p>
      </div>
      <button 
        v-if="canManageWarehouses"
        @click="openAddModal" 
        class="btn-primary"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        إضافة مخزن
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="search-section">
      <div class="search-wrapper">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="بحث عن مخزن..." 
          class="search-input"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="tabs-wrapper">
        <button 
          @click="activeTab = 'all'" 
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === 'all' }"
        >
          الكل
          <span class="tab-count">{{ allWarehousesCount }}</span>
        </button>
        <button 
          @click="activeTab = 'primary'" 
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === 'primary' }"
        >
          المخازن الرئيسية
          <span class="tab-count">{{ primaryCount }}</span>
        </button>
        <button 
          @click="activeTab = 'dispatch'" 
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === 'dispatch' }"
        >
          مواقع الصرف
          <span class="tab-count">{{ dispatchCount }}</span>
        </button>
      </div>
    </div>

    <!-- Results count -->
    <div v-if="!isLoading && filteredWarehouses.length > 0" class="results-count">
      <span>{{ filteredWarehouses.length }} {{ filteredWarehouses.length === 1 ? 'مخزن' : 'مخازن' }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card">
        <div class="skeleton-header"></div>
        <div class="skeleton-body">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    </div>

    <!-- Warehouse Grid -->
    <div v-else-if="filteredWarehouses.length > 0" class="warehouse-grid">
      <div
        v-for="warehouse in filteredWarehouses"
        :key="warehouse.id"
        class="warehouse-card"
        :class="cardVariant(warehouse)"
      >
        <div class="card-top-bar" :class="topBarVariant(warehouse)"></div>
        
        <div class="card-content">
          <div class="card-header">
            <div class="card-title-group">
              <h3 class="card-title">{{ warehouse.name_ar || warehouse.name }}</h3>
              <div class="card-badges">
                <span v-if="warehouse.type === 'primary'" class="badge badge--primary">رئيسي</span>
                <span v-else-if="warehouse.type === 'dispatch'" class="badge badge--dispatch">صرف</span>
                <span v-if="warehouse.is_main" class="badge badge--default">⭐ افتراضي</span>
              </div>
            </div>
            <div v-if="canManageWarehouses" class="card-actions">
              <button @click="editWarehouse(warehouse)" class="action-btn action-btn--edit" title="تعديل">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="confirmDelete(warehouse)" class="action-btn action-btn--delete" title="حذف">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <p class="card-subtitle">{{ warehouse.name_en || warehouse.name }}</p>

          <div class="card-meta">
            <div class="meta-item">
              <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{{ formatDate(warehouse.createdAt) }}</span>
            </div>
            <div v-if="warehouse.created_by_name" class="meta-item">
              <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{{ warehouse.created_by_name }}</span>
            </div>
            <div v-if="warehouse.location" class="meta-item">
              <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="truncate">{{ warehouse.location }}</span>
            </div>
          </div>

          <div class="card-footer">
            <span class="status-badge" :class="statusVariant(warehouse)">
              <span class="status-dot" :class="warehouse.is_active !== false ? 'status-dot--active' : 'status-dot--inactive'"></span>
              {{ warehouse.is_active !== false ? 'نشط' : 'غير نشط' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <p class="empty-title">{{ searchQuery ? 'لا توجد نتائج مطابقة' : 'لا توجد مخازن' }}</p>
      <p class="empty-description">
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
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-icon danger">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="modal-title">تأكيد الحذف</h3>
        </div>

        <div class="modal-body">
          <p class="modal-message">
            هل أنت متأكد من حذف المخزن <strong>{{ warehouseToDelete?.name_ar || warehouseToDelete?.name }}</strong>؟
          </p>
          <p class="modal-warning">⚠️ سيؤدي ذلك أيضاً إلى حذف جميع الأصناف المرتبطة به.</p>
        </div>

        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn btn--outline">
            إلغاء
          </button>
          <button @click="deleteWarehouse" :disabled="isDeleting" class="btn btn--danger">
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
const searchQuery = ref('')
let searchDebounce: ReturnType<typeof setTimeout> | null = null

const canManageWarehouses = computed(() => {
  return authStore.isSuperAdmin || authStore.isCompanyManager
})

const allWarehousesCount = computed(() => warehouseStore.warehouses?.length || 0)
const primaryCount = computed(() => warehouseStore.warehouses?.filter(w => w.type === 'primary').length || 0)
const dispatchCount = computed(() => warehouseStore.warehouses?.filter(w => w.type === 'dispatch').length || 0)

const filteredWarehouses = computed<WarehouseExtended[]>(() => {
  let warehouses = [...(warehouseStore.warehouses || [])] as WarehouseExtended[]

  // Filter by type
  if (activeTab.value === 'primary') {
    warehouses = warehouses.filter(w => w.type === 'primary')
  } else if (activeTab.value === 'dispatch') {
    warehouses = warehouses.filter(w => w.type === 'dispatch')
  }

  // Filter by search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    warehouses = warehouses.filter(w => 
      w.name?.toLowerCase().includes(query) ||
      w.name_ar?.toLowerCase().includes(query) ||
      w.name_en?.toLowerCase().includes(query) ||
      w.location?.toLowerCase().includes(query)
    )
  }

  // Filter by warehouse permissions
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

const cardVariant = (warehouse: WarehouseExtended) => {
  if (warehouse.is_active === false) return 'card--inactive'
  if (warehouse.type === 'primary') return 'card--primary'
  if (warehouse.type === 'dispatch') return 'card--dispatch'
  return 'card--default'
}

const topBarVariant = (warehouse: WarehouseExtended) => {
  if (warehouse.is_active === false) return 'top-bar--inactive'
  if (warehouse.type === 'primary') return 'top-bar--primary'
  if (warehouse.type === 'dispatch') return 'top-bar--dispatch'
  return 'top-bar--default'
}

const statusVariant = (warehouse: WarehouseExtended) => {
  return warehouse.is_active !== false ? 'status--active' : 'status--inactive'
}

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

// Debounced search
watch(searchQuery, () => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    // Search is reactive via computed
  }, 300)
})

onMounted(() => {
  loadWarehouses()
})
</script>

<style scoped>
/* ============================================================
   PAGE LAYOUT
   ============================================================ */
.warehouses-page {
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
  padding: 0.5rem;
}

@media (min-width: 640px) {
  .warehouses-page {
    padding: 0.75rem;
  }
}

@media (min-width: 1024px) {
  .warehouses-page {
    padding: 1rem 1.5rem;
  }
}

/* ============================================================
   HEADER
   ============================================================ */
.page-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .page-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
}

.page-title {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.025em;
  color: #111827;
}

.dark .page-title {
  color: white;
}

@media (min-width: 640px) {
  .page-title {
    font-size: 1.875rem;
  }
}

.page-subtitle {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-top: 0.25rem;
}

.dark .page-subtitle {
  color: #9ca3af;
}

/* ============================================================
   BUTTONS
   ============================================================ */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  transition: all 0.2s;
  cursor: pointer;
  min-height: 44px;
  width: 100%;
}

@media (min-width: 640px) {
  .btn-primary {
    width: auto;
    min-width: 140px;
  }
}

.btn-primary:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
}

.btn-primary:active {
  transform: scale(0.97);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
  border: none;
}

.btn--outline {
  background: transparent;
  color: #1f2937;
  border: 2px solid #e5e7eb;
}

.dark .btn--outline {
  color: white;
  border-color: #4b5563;
}

.btn--outline:hover {
  background: #f9fafb;
}

.dark .btn--outline:hover {
  background: #374151;
}

.btn--danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
}

.btn--danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================================
   SEARCH SECTION
   ============================================================ */
.search-section {
  background: white;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.dark .search-section {
  background: #1f2937;
  border-color: #374151;
}

@media (min-width: 640px) {
  .search-section {
    padding: 0.75rem 1.25rem;
    margin-bottom: 1.25rem;
  }
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

[dir="rtl"] .search-icon {
  right: auto;
  left: 0.75rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  color: #1f2937;
  transition: all 0.15s;
  min-height: 40px;
}

.dark .search-input {
  background: #374151;
  border-color: #4b5563;
  color: white;
}

.search-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

[dir="rtl"] .search-input {
  padding-right: 0.75rem;
  padding-left: 2.5rem;
}

.search-clear {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.15s;
  min-height: 28px;
  min-width: 28px;
}

.search-clear:hover {
  color: #6b7280;
  background: #f3f4f6;
}

.dark .search-clear:hover {
  color: #d1d5db;
  background: #4b5563;
}

[dir="rtl"] .search-clear {
  left: auto;
  right: 0.75rem;
}

/* ============================================================
   TABS
   ============================================================ */
.tabs-wrapper {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 40px;
}

.dark .tab-btn {
  color: #9ca3af;
}

.tab-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.dark .tab-btn:hover {
  background: #374151;
  color: #e5e7eb;
}

.tab-btn--active {
  background: #10b981;
  color: white;
}

.tab-btn--active:hover {
  background: #059669;
  color: white;
}

.dark .tab-btn--active {
  background: #10b981;
  color: white;
}

.dark .tab-btn--active:hover {
  background: #059669;
}

.tab-count {
  font-size: 0.65rem;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
}

.tab-btn--active .tab-count {
  background: rgba(255, 255, 255, 0.25);
}

/* ============================================================
   RESULTS COUNT
   ============================================================ */
.results-count {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
  padding: 0 0.25rem;
}

.dark .results-count {
  color: #9ca3af;
}

/* ============================================================
   LOADING SKELETON
   ============================================================ */
.loading-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .loading-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .loading-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.skeleton-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.dark .skeleton-card {
  background: #1f2937;
  border-color: #374151;
}

.skeleton-header {
  height: 1.5rem;
  width: 75%;
  background: #e5e7eb;
  border-radius: 0.25rem;
  margin-bottom: 0.75rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.dark .skeleton-header {
  background: #374151;
}

.skeleton-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-line {
  height: 1rem;
  width: 100%;
  background: #e5e7eb;
  border-radius: 0.25rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line.short {
  width: 60%;
}

.dark .skeleton-line {
  background: #374151;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ============================================================
   WAREHOUSE GRID
   ============================================================ */
.warehouse-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .warehouse-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .warehouse-grid {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1.5rem;
  }
}

/* ============================================================
   WAREHOUSE CARD
   ============================================================ */
.warehouse-card {
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  border: 1px solid #e5e7eb;
}

.dark .warehouse-card {
  background: #1f2937;
  border-color: #374151;
}

.warehouse-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Card Variants */
.card--primary .card-top-bar {
  background: #3b82f6;
}

.dark .card--primary {
  border-color: #3b82f6;
}

.card--dispatch .card-top-bar {
  background: #f97316;
}

.dark .card--dispatch {
  border-color: #f97316;
}

.card--inactive .card-top-bar {
  background: #6b7280;
}

.dark .card--inactive {
  border-color: #6b7280;
}

.card--default .card-top-bar {
  background: #10b981;
}

.dark .card--default {
  border-color: #10b981;
}

/* Card Top Bar */
.card-top-bar {
  height: 0.25rem;
  width: 100%;
}

/* Card Content */
.card-content {
  padding: 1rem 1.25rem 1.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.card-title-group {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 900;
  color: #111827;
  margin-bottom: 0.25rem;
}

.dark .card-title {
  color: white;
}

.card-badges {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.1rem 0.5rem;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 9999px;
}

.badge--primary {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.badge--dispatch {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
}

.badge--default {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.dark .card-subtitle {
  color: #9ca3af;
}

/* Card Meta */
.card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.dark .meta-item {
  color: #9ca3af;
}

.meta-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  color: #9ca3af;
}

/* Card Actions */
.card-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 32px;
  min-width: 32px;
  background: transparent;
}

.action-btn--edit {
  color: #3b82f6;
}

.action-btn--edit:hover {
  background: #eff6ff;
}

.dark .action-btn--edit:hover {
  background: #1e3a5f;
}

.action-btn--delete {
  color: #ef4444;
}

.action-btn--delete:hover {
  background: #fef2f2;
}

.dark .action-btn--delete:hover {
  background: #3f1a1a;
}

/* Card Footer */
.card-footer {
  display: flex;
  justify-content: flex-start;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.dark .card-footer {
  border-color: #374151;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid;
}

.status--active {
  background: rgba(16, 185, 129, 0.1);
  color: #065f46;
  border-color: rgba(16, 185, 129, 0.2);
}

.dark .status--active {
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
  border-color: rgba(16, 185, 129, 0.3);
}

.status--inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #991b1b;
  border-color: rgba(239, 68, 68, 0.2);
}

.dark .status--inactive {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}

.status-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
  flex-shrink: 0;
}

.status-dot--active {
  background: #10b981;
}

.status-dot--inactive {
  background: #ef4444;
}

/* ============================================================
   EMPTY STATE
   ============================================================ */
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.dark .empty-state {
  background: #1f2937;
  border-color: #374151;
}

@media (min-width: 640px) {
  .empty-state {
    padding: 4rem 2rem;
  }
}

.empty-icon {
  width: 5rem;
  height: 5rem;
  margin: 0 auto 0.75rem;
  color: #d1d5db;
}

.dark .empty-icon {
  color: #4b5563;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.dark .empty-title {
  color: white;
}

.empty-description {
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .empty-description {
  color: #9ca3af;
}

/* ============================================================
   MODAL
   ============================================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.dark .modal-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  max-width: 28rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
}

.dark .modal-container {
  background: #1f2937;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.modal-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-icon.danger {
  background: #fef2f2;
  color: #ef4444;
}

.dark .modal-icon.danger {
  background: #3f1a1a;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 900;
  color: #1f2937;
}

.dark .modal-title {
  color: white;
}

.modal-body {
  margin-bottom: 1.5rem;
}

.modal-message {
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.dark .modal-message {
  color: #d1d5db;
}

.modal-warning {
  font-size: 0.875rem;
  color: #ef4444;
}

.dark .modal-warning {
  color: #f87171;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* ============================================================
   UTILITIES
   ============================================================ */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============================================================
   TOUCH IMPROVEMENTS
   ============================================================ */
@media (max-width: 640px) {
  button,
  .btn,
  .action-btn {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
}
</style>