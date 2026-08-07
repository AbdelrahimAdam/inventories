<template>
  <div :dir="languageStore.isRTL ? 'rtl' : 'ltr'" class="user-management">
    <!-- Access Control -->
    <div v-if="!canManageUsers" class="access-denied">
      <div class="access-denied__header">
        <h1 class="access-denied__title">إدارة المستخدمين</h1>
      </div>
      <div class="access-denied__body">
        <svg class="access-denied__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="access-denied__subtitle">وصول مقيد</h2>
        <p class="access-denied__message">
          فقط المديرين (Company Manager) والمشرفين (Super Admin) يمكنهم إدارة المستخدمين.
        </p>
        <button @click="goBack" class="btn btn--primary btn--md">
          العودة للرئيسية
        </button>
      </div>
    </div>

    <div v-else class="user-management__content">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-header__title">👥 إدارة المستخدمين</h1>
          <p class="page-header__subtitle">إدارة المستخدمين والأدوار والصلاحيات</p>
        </div>
        <div class="page-header__actions">
          <span class="user-count">{{ users.length }} مستخدم</span>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="search-filters">
        <div class="search-filters__row">
          <div class="search-filters__search">
            <svg class="search-filters__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="بحث بالاسم أو البريد الإلكتروني..." 
              class="search-filters__input"
            />
          </div>
          <select v-model="filterRole" class="search-filters__select">
            <option value="">جميع الأدوار</option>
            <option value="superadmin">مشرف عام</option>
            <option value="company_manager">مدير شركة</option>
            <option value="warehouse_manager">مدير مستودع</option>
            <option value="viewer">عرض فقط</option>
          </select>
          <select v-model="filterStatus" class="search-filters__select">
            <option value="">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
          <button @click="refreshUsers" class="btn btn--refresh" :disabled="isLoading">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ isLoading ? 'جاري التحديث...' : 'تحديث' }}
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button 
          @click="activeForm = activeForm === 'manager' ? null : 'manager'"
          class="action-btn action-btn--manager"
          :class="{ 'action-btn--active': activeForm === 'manager' }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>مدير مستودع</span>
          <span class="action-btn__badge">جديد</span>
        </button>
        <button 
          @click="activeForm = activeForm === 'viewer' ? null : 'viewer'"
          class="action-btn action-btn--viewer"
          :class="{ 'action-btn--active': activeForm === 'viewer' }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>مستخدم عرض</span>
          <span class="action-btn__badge">جديد</span>
        </button>
      </div>

      <!-- Add Warehouse Manager Form -->
      <div v-if="activeForm === 'manager'" class="form-section form-section--manager">
        <div class="form-section__header">
          <div class="form-section__icon">🏢</div>
          <div>
            <h3 class="form-section__title">إضافة مدير مستودع</h3>
            <p class="form-section__subtitle">مدير يمكنه إدارة المخزون والصرف</p>
          </div>
          <button @click="activeForm = null" class="form-section__close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="createWarehouseManager" class="form-section__body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">الاسم <span class="text-red-500">*</span></label>
              <input 
                type="text" 
                v-model="warehouseManagerForm.name" 
                required 
                class="form-input" 
                placeholder="أدخل اسم مدير المستودع" 
              />
            </div>
            <div class="form-group">
              <label class="form-label">البريد الإلكتروني <span class="text-red-500">*</span></label>
              <input 
                type="email" 
                v-model="warehouseManagerForm.email" 
                required 
                class="form-input" 
                placeholder="example@company.com" 
              />
            </div>
            <div class="form-group">
              <label class="form-label">كلمة المرور المؤقتة <span class="text-red-500">*</span></label>
              <input 
                type="password" 
                v-model="warehouseManagerForm.password" 
                required 
                class="form-input" 
                placeholder="كلمة مرور مؤقتة" 
              />
              <p class="form-hint">سيتمكن المستخدم من تغيير كلمة المرور بعد تسجيل الدخول</p>
            </div>
            <div class="form-group">
              <label class="form-label">المستودعات الرئيسية <span class="text-red-500">*</span></label>
              <select 
                v-model="warehouseManagerForm.allowedWarehouses" 
                multiple 
                class="form-select" 
                size="3"
              >
                <option v-for="warehouse in primaryWarehouses" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name_ar || warehouse.name }}
                </option>
              </select>
              <p class="form-hint">اختر المستودعات الرئيسية</p>
            </div>
            <div class="form-group">
              <label class="form-label">مواقع الصرف المسموح بها</label>
              <select 
                v-model="warehouseManagerForm.allowedDispatchWarehouses" 
                multiple 
                class="form-select" 
                size="3"
              >
                <option v-for="warehouse in dispatchWarehouses" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name_ar || warehouse.name }}
                </option>
              </select>
              <p class="form-hint">اختر مواقع الصرف</p>
            </div>
          </div>
          <div class="form-actions">
            <button 
              type="submit" 
              :disabled="isCreating" 
              class="btn btn--primary btn--md"
            >
              <span v-if="isCreating" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الحفظ...
              </span>
              <span v-else>حفظ</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Add Viewer Form -->
      <div v-if="activeForm === 'viewer'" class="form-section form-section--viewer">
        <div class="form-section__header">
          <div class="form-section__icon">👁️</div>
          <div>
            <h3 class="form-section__title">إضافة مستخدم عرض فقط</h3>
            <p class="form-section__subtitle">يمكنه الاطلاع على البيانات فقط</p>
          </div>
          <button @click="activeForm = null" class="form-section__close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="createViewer" class="form-section__body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">الاسم <span class="text-red-500">*</span></label>
              <input 
                type="text" 
                v-model="viewerForm.name" 
                required 
                class="form-input" 
                placeholder="أدخل اسم المستخدم" 
              />
            </div>
            <div class="form-group">
              <label class="form-label">البريد الإلكتروني <span class="text-red-500">*</span></label>
              <input 
                type="email" 
                v-model="viewerForm.email" 
                required 
                class="form-input" 
                placeholder="viewer@company.com" 
              />
            </div>
            <div class="form-group">
              <label class="form-label">كلمة المرور المؤقتة <span class="text-red-500">*</span></label>
              <input 
                type="password" 
                v-model="viewerForm.password" 
                required 
                class="form-input" 
                placeholder="كلمة مرور مؤقتة" 
              />
              <p class="form-hint">سيتمكن المستخدم من تغيير كلمة المرور بعد تسجيل الدخول</p>
            </div>
            <div class="form-group">
              <label class="form-label">المستودعات المسموح بها <span class="text-red-500">*</span></label>
              <select 
                v-model="viewerForm.allowedWarehouses" 
                multiple 
                class="form-select" 
                size="3"
              >
                <option v-for="warehouse in primaryWarehouses" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name_ar || warehouse.name }}
                </option>
              </select>
              <p class="form-hint">اختر المستودعات</p>
            </div>
          </div>
          <div class="form-actions">
            <button 
              type="submit" 
              :disabled="isCreatingViewer" 
              class="btn btn--secondary btn--md"
            >
              <span v-if="isCreatingViewer" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الحفظ...
              </span>
              <span v-else>حفظ</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Users List -->
      <div class="users-section">
        <div class="users-section__header">
          <h2 class="users-section__title">📋 قائمة المستخدمين</h2>
          <span class="users-section__badge">{{ filteredUsers.length }} من {{ users.length }}</span>
        </div>

        <!-- Desktop Table -->
        <div class="table-wrapper desktop-table">
          <table class="users-table">
            <thead>
              <tr>
                <th style="width: 25%">المستخدم</th>
                <th style="width: 20%">الدور</th>
                <th style="width: 20%">المستودعات</th>
                <th style="width: 15%">الحالة</th>
                <th style="width: 20%">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id" class="users-table__row">
                <td>
                  <div class="user-info">
                    <div class="user-info__avatar">{{ getUserInitial(user.name) }}</div>
                    <div>
                      <div class="user-info__name">{{ user.name }}</div>
                      <div class="user-info__email">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span :class="['role-badge', getRoleBadgeClass(user.role)]">
                    {{ getRoleName(user.role) }}
                  </span>
                </td>
                <td>
                  <span class="warehouse-count">
                    {{ user.allowed_warehouses?.length || 0 }} مستودع
                  </span>
                </td>
                <td>
                  <button 
                    @click="toggleUserStatus(user)" 
                    :class="['status-toggle', user.is_active ? 'status-toggle--active' : 'status-toggle--inactive']"
                  >
                    {{ user.is_active ? 'نشط' : 'غير نشط' }}
                  </button>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      v-if="user.role === 'warehouse_manager' || user.role === 'viewer'" 
                      @click="editUserWarehouses(user)" 
                      class="action-btn action-btn--edit"
                      title="تعديل الصلاحيات"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span class="action-btn__label">صلاحيات</span>
                    </button>
                    <button 
                      v-if="user.role !== 'superadmin' && user.id !== authStore.user?.id" 
                      @click="deleteUser(user)" 
                      class="action-btn action-btn--delete"
                      title="حذف المستخدم"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span class="action-btn__label">حذف</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="5" class="empty-state">
                  <svg class="empty-state__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p>لا يوجد مستخدمين مطابقين للبحث</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="mobile-cards">
          <div v-for="user in filteredUsers" :key="user.id" class="user-card">
            <div class="user-card__header">
              <div class="user-card__avatar">{{ getUserInitial(user.name) }}</div>
              <div class="user-card__info">
                <div class="user-card__name">{{ user.name }}</div>
                <div class="user-card__email">{{ user.email }}</div>
              </div>
              <span :class="['role-badge', getRoleBadgeClass(user.role)]">
                {{ getRoleName(user.role) }}
              </span>
            </div>
            <div class="user-card__body">
              <div class="user-card__detail">
                <span class="user-card__label">📦 المستودعات</span>
                <span class="user-card__value">{{ user.allowed_warehouses?.length || 0 }} مستودع</span>
              </div>
              <div class="user-card__detail">
                <span class="user-card__label">📊 الحالة</span>
                <button 
                  @click="toggleUserStatus(user)" 
                  :class="['status-toggle', user.is_active ? 'status-toggle--active' : 'status-toggle--inactive']"
                >
                  {{ user.is_active ? 'نشط' : 'غير نشط' }}
                </button>
              </div>
            </div>
            <div class="user-card__actions">
              <button 
                v-if="user.role === 'warehouse_manager' || user.role === 'viewer'" 
                @click="editUserWarehouses(user)" 
                class="btn btn--outline btn--sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                صلاحيات
              </button>
              <button 
                v-if="user.role !== 'superadmin' && user.id !== authStore.user?.id" 
                @click="deleteUser(user)" 
                class="btn btn--danger btn--sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                حذف
              </button>
            </div>
          </div>
          <div v-if="filteredUsers.length === 0" class="empty-state-card">
            <svg class="empty-state__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p>لا يوجد مستخدمين</p>
          </div>
        </div>
      </div>

      <!-- Edit User Warehouses Modal -->
      <div v-if="showEditWarehousesModal" class="modal-overlay" @click.self="showEditWarehousesModal = false">
        <div class="modal">
          <div class="modal__header">
            <h3 class="modal__title">🔑 تعديل الصلاحيات</h3>
            <button @click="showEditWarehousesModal = false" class="modal__close">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="modal__body">
            <p class="modal__subtitle">تعديل صلاحيات المستخدم: <span class="font-bold text-purple-600">{{ editingUser?.name }}</span></p>

            <div class="space-y-4">
              <div class="form-group">
                <label class="form-label">المستودعات المسموح بها</label>
                <select 
                  v-model="editForm.allowedWarehouses" 
                  multiple 
                  class="form-select" 
                  size="4"
                >
                  <option value="" disabled>اختر مستودع</option>
                  <option v-for="warehouse in allPrimaryWarehouses" :key="warehouse.id" :value="warehouse.id">
                    {{ warehouse.name_ar || warehouse.name }}
                  </option>
                </select>
                <p class="form-hint">اختر المستودعات التي يمكن للمستخدم الوصول إليها</p>
              </div>

              <div v-if="editingUser?.role === 'warehouse_manager'" class="form-group">
                <label class="form-label">مواقع الصرف المسموح بها</label>
                <select 
                  v-model="editForm.allowedDispatchWarehouses" 
                  multiple 
                  class="form-select" 
                  size="3"
                >
                  <option value="" disabled>اختر موقع صرف</option>
                  <option v-for="warehouse in allDispatchWarehouses" :key="warehouse.id" :value="warehouse.id">
                    {{ warehouse.name_ar || warehouse.name }}
                  </option>
                </select>
                <p class="form-hint">اختر مواقع الصرف التي يمكن للمستخدم الصرف منها</p>
              </div>
            </div>
          </div>
          <div class="modal__footer">
            <button @click="showEditWarehousesModal = false" class="btn btn--outline btn--md">
              إلغاء
            </button>
            <button @click="updateUserWarehouses" :disabled="isUpdating" class="btn btn--primary btn--md">
              {{ isUpdating ? 'جاري التحديث...' : 'حفظ' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLanguageStore } from '@/stores/language'
import { supabase } from '@/services/supabase'

const router = useRouter()
const authStore = useAuthStore()
const warehouseStore = useWarehouseStore()
const languageStore = useLanguageStore()

const users = ref<any[]>([])
const isLoading = ref(false)
const isCreating = ref(false)
const isCreatingViewer = ref(false)
const isUpdating = ref(false)
const showEditWarehousesModal = ref(false)
const editingUser = ref<any>(null)
const activeForm = ref<'manager' | 'viewer' | null>(null)
const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')

const warehouseManagerForm = ref({
  name: '',
  email: '',
  password: '',
  allowedWarehouses: [] as string[],
  allowedDispatchWarehouses: [] as string[]
})

const viewerForm = ref({
  name: '',
  email: '',
  password: '',
  allowedWarehouses: [] as string[]
})

const editForm = ref({
  allowedWarehouses: [] as string[],
  allowedDispatchWarehouses: [] as string[]
})

const canManageUsers = computed(() => authStore.isSuperAdmin || authStore.isCompanyManager)

const primaryWarehouses = computed(() => warehouseStore.primaryWarehouses || [])
const dispatchWarehouses = computed(() => warehouseStore.dispatchWarehouses || [])
const allPrimaryWarehouses = computed(() => warehouseStore.primaryWarehouses || [])
const allDispatchWarehouses = computed(() => warehouseStore.dispatchWarehouses || [])

const filteredUsers = computed(() => {
  let filtered = [...users.value]
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q)
    )
  }
  
  if (filterRole.value) {
    filtered = filtered.filter(u => u.role === filterRole.value)
  }
  
  if (filterStatus.value === 'active') {
    filtered = filtered.filter(u => u.is_active === true)
  } else if (filterStatus.value === 'inactive') {
    filtered = filtered.filter(u => u.is_active === false)
  }
  
  return filtered
})

const getUserInitial = (name: string) => {
  return name?.charAt(0)?.toUpperCase() || '?'
}

const getRoleBadgeClass = (role: string) => {
  const badges: Record<string, string> = {
    superadmin: 'role-badge--superadmin',
    company_manager: 'role-badge--manager',
    warehouse_manager: 'role-badge--warehouse',
    viewer: 'role-badge--viewer',
  }
  return badges[role] || 'role-badge--default'
}

const getRoleName = (role: string) => {
  const names: Record<string, string> = {
    superadmin: 'مشرف عام',
    company_manager: 'مدير شركة',
    warehouse_manager: 'مدير مستودع',
    viewer: 'عرض فقط',
  }
  return names[role] || role
}

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('tenant_id', authStore.user?.tenantId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    users.value = data || []
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshUsers = async () => {
  await fetchUsers()
}

const createWarehouseManager = async () => {
  if (!warehouseManagerForm.value.name || !warehouseManagerForm.value.email || !warehouseManagerForm.value.password) {
    alert('يرجى ملء جميع الحقول المطلوبة')
    return
  }
  
  if (warehouseManagerForm.value.allowedWarehouses.length === 0) {
    alert('يرجى تحديد مستودع رئيسي واحد على الأقل')
    return
  }
  
  isCreating.value = true
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/create-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: warehouseManagerForm.value.email,
          password: warehouseManagerForm.value.password,
          name: warehouseManagerForm.value.name,
          role: 'warehouse_manager',
          allowed_warehouses: warehouseManagerForm.value.allowedWarehouses,
          allowed_dispatch_warehouses: warehouseManagerForm.value.allowedDispatchWarehouses
        })
      }
    )
    
    const result = await response.json()
    
    if (result.success) {
      alert(result.message || 'تم إضافة مدير المستودع بنجاح')
      warehouseManagerForm.value = { name: '', email: '', password: '', allowedWarehouses: [], allowedDispatchWarehouses: [] }
      activeForm.value = null
      await fetchUsers()
    } else {
      alert(result.error || 'حدث خطأ أثناء إضافة مدير المستودع')
    }
  } catch (error: any) {
    console.error('Error creating warehouse manager:', error)
    alert(error.message || 'حدث خطأ أثناء إضافة مدير المستودع')
  } finally {
    isCreating.value = false
  }
}

const createViewer = async () => {
  if (!viewerForm.value.name || !viewerForm.value.email || !viewerForm.value.password) {
    alert('يرجى ملء جميع الحقول المطلوبة')
    return
  }
  
  if (viewerForm.value.allowedWarehouses.length === 0) {
    alert('يرجى تحديد مستودع واحد على الأقل للمستخدم')
    return
  }
  
  isCreatingViewer.value = true
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/create-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: viewerForm.value.email,
          password: viewerForm.value.password,
          name: viewerForm.value.name,
          role: 'viewer',
          allowed_warehouses: viewerForm.value.allowedWarehouses,
          allowed_dispatch_warehouses: []
        })
      }
    )
    
    const result = await response.json()
    
    if (result.success) {
      alert(result.message || 'تم إضافة مستخدم العرض فقط بنجاح')
      viewerForm.value = { name: '', email: '', password: '', allowedWarehouses: [] }
      activeForm.value = null
      await fetchUsers()
    } else {
      alert(result.error || 'حدث خطأ أثناء إضافة المستخدم')
    }
  } catch (error: any) {
    console.error('Error creating viewer:', error)
    alert(error.message || 'حدث خطأ أثناء إضافة المستخدم')
  } finally {
    isCreatingViewer.value = false
  }
}

const editUserWarehouses = (user: any) => {
  editingUser.value = user
  editForm.value = {
    allowedWarehouses: user.allowed_warehouses || [],
    allowedDispatchWarehouses: user.allowed_dispatch_warehouses || []
  }
  showEditWarehousesModal.value = true
}

const updateUserWarehouses = async () => {
  if (!editingUser.value) return
  
  isUpdating.value = true
  
  try {
    const updateData: any = {
      allowed_warehouses: editForm.value.allowedWarehouses,
      updated_at: new Date().toISOString()
    }
    if (editingUser.value.role === 'warehouse_manager') {
      updateData.allowed_dispatch_warehouses = editForm.value.allowedDispatchWarehouses
    }
    
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', editingUser.value.id)
    
    if (error) throw error
    
    alert('تم تحديث صلاحيات المستخدم بنجاح')
    showEditWarehousesModal.value = false
    await fetchUsers()
  } catch (error: any) {
    console.error('Error updating user warehouses:', error)
    alert(error.message || 'حدث خطأ أثناء تحديث الصلاحيات')
  } finally {
    isUpdating.value = false
  }
}

const toggleUserStatus = async (user: any) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: !user.is_active })
      .eq('id', user.id)
    
    if (error) throw error
    
    user.is_active = !user.is_active
  } catch (error) {
    console.error('Error toggling user status:', error)
    alert('حدث خطأ أثناء تغيير حالة المستخدم')
  }
}

const deleteUser = async (user: any) => {
  if (!confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) return
  
  try {
    const { error } = await supabase.from('users').delete().eq('id', user.id)
    if (error) throw error
    
    users.value = users.value.filter(u => u.id !== user.id)
    alert('تم حذف المستخدم بنجاح')
  } catch (error) {
    console.error('Error deleting user:', error)
    alert('حدث خطأ أثناء حذف المستخدم')
  }
}

const goBack = () => {
  router.push('/')
}

onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await fetchUsers()
})
</script>

<style scoped>
/* ============================================================
   BASE
   ============================================================ */

.user-management {
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* ============================================================
   ACCESS DENIED
   ============================================================ */

.access-denied {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.dark .access-denied {
  background: #1f2937;
}

.access-denied__header {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  padding: 0.75rem 1.5rem;
}

.access-denied__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
}

.access-denied__body {
  padding: 2rem 1.5rem;
  text-align: center;
}

.access-denied__icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 0.75rem;
  color: #ef4444;
}

.access-denied__subtitle {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.dark .access-denied__subtitle {
  color: white;
}

.access-denied__message {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.dark .access-denied__message {
  color: #9ca3af;
}

/* ============================================================
   PAGE HEADER
   ============================================================ */

.page-header {
  background: linear-gradient(135deg, #059669, #047857);
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.page-header__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.page-header__subtitle {
  font-size: 0.875rem;
  color: #a7f3d0;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-count {
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

/* ============================================================
   SEARCH & FILTERS
   ============================================================ */

.search-filters {
  background: white;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1.25rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.dark .search-filters {
  background: #1f2937;
  border-color: #374151;
}

.search-filters__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search-filters__search {
  flex: 1;
  min-width: 200px;
  position: relative;
}

.search-filters__icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.search-filters__input {
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

.dark .search-filters__input {
  background: #374151;
  border-color: #4b5563;
  color: white;
}

.search-filters__input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.dark .search-filters__input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.search-filters__select {
  padding: 0.5rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  color: #1f2937;
  min-height: 40px;
  min-width: 140px;
  cursor: pointer;
  transition: all 0.15s;
}

.dark .search-filters__select {
  background: #374151;
  border-color: #4b5563;
  color: white;
}

.search-filters__select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

/* ============================================================
   REFRESH BUTTON
   ============================================================ */

.btn--refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s;
  background: #f3f4f6;
  color: #1f2937;
  min-height: 40px;
}

.dark .btn--refresh {
  background: #374151;
  color: white;
}

.btn--refresh:hover:not(:disabled) {
  background: #e5e7eb;
}

.dark .btn--refresh:hover:not(:disabled) {
  background: #4b5563;
}

.btn--refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================================
   ACTION BUTTONS
   ============================================================ */

.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
  position: relative;
}

.action-btn__badge {
  font-size: 0.6rem;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.3);
  color: inherit;
}

.action-btn--manager {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.action-btn--manager:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
}

.action-btn--manager.action-btn--active {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  box-shadow: 0 2px 12px rgba(124, 58, 237, 0.5);
  transform: translateY(-2px);
}

.action-btn--viewer {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.action-btn--viewer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
}

.action-btn--viewer.action-btn--active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 2px 12px rgba(37, 99, 235, 0.5);
  transform: translateY(-2px);
}

.action-btn svg {
  flex-shrink: 0;
}

/* ============================================================
   FORM SECTION
   ============================================================ */

.form-section {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 1.25rem;
  animation: slideDown 0.3s ease-out;
  border: 1px solid #e5e7eb;
}

.dark .form-section {
  background: #1f2937;
  border-color: #374151;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-section--manager .form-section__header {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.form-section--viewer .form-section__header {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.form-section__header {
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.form-section__icon {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.form-section__title {
  font-size: 1rem;
  font-weight: 700;
  color: white;
}

.form-section__subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.form-section__close {
  position: absolute;
  left: 0.75rem;
  top: 0.75rem;
  padding: 0.25rem;
  border-radius: 9999px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-section__close:hover {
  background: rgba(255, 255, 255, 0.25);
}

[dir="rtl"] .form-section__close {
  left: auto;
  right: 0.75rem;
}

.form-section__body {
  padding: 1.25rem;
}

/* ============================================================
   FORM GRID
   ============================================================ */

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* ============================================================
   FORM ELEMENTS
   ============================================================ */

.form-group {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.dark .form-label {
  color: #e5e7eb;
}

.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  color: #1f2937;
  transition: all 0.15s;
}

.dark .form-input {
  background: #374151;
  border-color: #4b5563;
  color: white;
}

.form-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-section--viewer .form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  color: #1f2937;
  min-height: 80px;
}

.dark .form-select {
  background: #374151;
  border-color: #4b5563;
  color: white;
}

.form-select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-select option:disabled {
  color: #9ca3af;
  font-weight: 500;
}

.form-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.dark .form-hint {
  color: #9ca3af;
}

.form-actions {
  margin-top: 1.25rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* ============================================================
   BUTTONS (GLOBAL)
   ============================================================ */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  text-decoration: none;
}

.btn--sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  min-height: 36px;
}

.btn--md {
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  min-height: 40px;
}

.btn--full {
  width: 100%;
}

.btn--primary {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn--secondary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn--secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn--secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn--danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
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

.btn--outline:hover:not(:disabled) {
  background: #f9fafb;
}

.dark .btn--outline:hover:not(:disabled) {
  background: #374151;
}

/* ============================================================
   USERS SECTION
   ============================================================ */

.users-section {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.dark .users-section {
  background: #1f2937;
  border-color: #374151;
}

.users-section__header {
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  background: #f9fafb;
}

.dark .users-section__header {
  border-color: #374151;
  background: #374151;
}

.users-section__title {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.dark .users-section__title {
  color: white;
}

.users-section__badge {
  font-size: 0.75rem;
  font-weight: 600;
  background: #e5e7eb;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.dark .users-section__badge {
  background: #4b5563;
  color: #e5e7eb;
}

/* ============================================================
   TABLE
   ============================================================ */

.table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  min-width: 700px;
}

.users-table thead {
  background: #f9fafb;
}

.dark .users-table thead {
  background: #374151;
}

.users-table th {
  padding: 0.625rem 1rem;
  text-align: right;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dark .users-table th {
  color: #9ca3af;
}

.users-table__row {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.15s;
}

.dark .users-table__row {
  border-color: #374151;
}

.users-table__row:hover {
  background: #f9fafb;
}

.dark .users-table__row:hover {
  background: #374151;
}

.users-table td {
  padding: 0.625rem 1rem;
  vertical-align: middle;
}

/* ============================================================
   USER INFO
   ============================================================ */

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info__avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.user-info__name {
  font-weight: 500;
  color: #1f2937;
}

.dark .user-info__name {
  color: white;
}

.user-info__email {
  font-size: 0.75rem;
  color: #6b7280;
}

.dark .user-info__email {
  color: #9ca3af;
}

/* ============================================================
   ROLE BADGES
   ============================================================ */

.role-badge {
  padding: 0.25rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 9999px;
  display: inline-block;
}

.role-badge--superadmin {
  background: #fecaca;
  color: #991b1b;
}

.dark .role-badge--superadmin {
  background: rgba(254, 202, 202, 0.2);
  color: #fca5a5;
}

.role-badge--manager {
  background: #e9d5ff;
  color: #6b21a5;
}

.dark .role-badge--manager {
  background: rgba(233, 213, 255, 0.2);
  color: #d8b4fe;
}

.role-badge--warehouse {
  background: #bfdbfe;
  color: #1e40af;
}

.dark .role-badge--warehouse {
  background: rgba(191, 219, 254, 0.2);
  color: #93c5fd;
}

.role-badge--viewer {
  background: #e5e7eb;
  color: #374151;
}

.dark .role-badge--viewer {
  background: #4b5563;
  color: #9ca3af;
}

.role-badge--default {
  background: #e5e7eb;
  color: #374151;
}

/* ============================================================
   STATUS TOGGLE
   ============================================================ */

.status-toggle {
  padding: 0.25rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 60px;
  min-height: 30px;
}

.status-toggle--active {
  background: #d1fae5;
  color: #065f46;
}

.dark .status-toggle--active {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.status-toggle--inactive {
  background: #fecaca;
  color: #991b1b;
}

.dark .status-toggle--inactive {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.warehouse-count {
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .warehouse-count {
  color: #9ca3af;
}

/* ============================================================
   ACTION BUTTONS (Table)
   ============================================================ */

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 0.75rem;
  font-weight: 500;
  background: transparent;
}

.action-btn__label {
  display: inline;
}

.action-btn--edit {
  color: #2563eb;
  background: #eff6ff;
}

.action-btn--edit:hover {
  background: #dbeafe;
  transform: translateY(-1px);
}

.dark .action-btn--edit {
  background: rgba(37, 99, 235, 0.15);
  color: #60a5fa;
}

.dark .action-btn--edit:hover {
  background: rgba(37, 99, 235, 0.25);
}

.action-btn--delete {
  color: #dc2626;
  background: #fef2f2;
}

.action-btn--delete:hover {
  background: #fecaca;
  transform: translateY(-1px);
}

.dark .action-btn--delete {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.dark .action-btn--delete:hover {
  background: rgba(239, 68, 68, 0.25);
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

.modal {
  background: white;
  border-radius: 0.75rem;
  max-width: 42rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.dark .modal {
  background: #1f2937;
}

.modal__header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
}

.dark .modal__header {
  border-color: #374151;
  background: #374151;
}

.modal__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
}

.dark .modal__title {
  color: white;
}

.modal__close {
  padding: 0.25rem;
  border-radius: 9999px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.modal__close:hover {
  background: #e5e7eb;
}

.dark .modal__close {
  color: #9ca3af;
}

.dark .modal__close:hover {
  background: #4b5563;
}

.modal__body {
  padding: 1.5rem;
}

.modal__subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.25rem;
}

.dark .modal__subtitle {
  color: #9ca3af;
}

.modal__footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background: #f9fafb;
}

.dark .modal__footer {
  border-color: #374151;
  background: #374151;
}

/* ============================================================
   EMPTY STATE
   ============================================================ */

.empty-state {
  padding: 2rem 1.5rem;
  text-align: center;
  color: #6b7280;
}

.dark .empty-state {
  color: #9ca3af;
}

.empty-state__icon {
  width: 3.5rem;
  height: 3.5rem;
  margin: 0 auto 0.5rem;
  color: #d1d5db;
}

/* ============================================================
   MOBILE CARDS
   ============================================================ */

.mobile-cards {
  display: none;
  padding: 1rem;
}

.user-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
}

.dark .user-card {
  background: #1f2937;
  border-color: #374151;
}

.user-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.user-card__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.user-card__info {
  flex: 1;
  min-width: 0;
}

.user-card__name {
  font-weight: 600;
  color: #1f2937;
}

.dark .user-card__name {
  color: white;
}

.user-card__email {
  font-size: 0.75rem;
  color: #6b7280;
}

.dark .user-card__email {
  color: #9ca3af;
}

.user-card__body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.user-card__detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-card__label {
  font-size: 0.7rem;
  color: #6b7280;
}

.dark .user-card__label {
  color: #9ca3af;
}

.user-card__value {
  font-weight: 500;
  color: #1f2937;
}

.dark .user-card__value {
  color: white;
}

.user-card__actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.dark .user-card__actions {
  border-color: #374151;
}

.user-card__actions .btn {
  flex: 1;
}

.empty-state-card {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.dark .empty-state-card {
  color: #9ca3af;
}

.empty-state-card .empty-state__icon {
  margin: 0 auto 0.5rem;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */

@media (max-width: 768px) {
  .user-management {
    padding: 0.5rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header__actions {
    width: 100%;
  }

  .search-filters__row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-filters__search {
    min-width: 100%;
  }

  .search-filters__select {
    width: 100%;
  }

  .btn--refresh {
    width: 100%;
    justify-content: center;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .form-section__body {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }

  .desktop-table {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .modal {
    margin: 0.5rem;
    max-height: 95vh;
  }

  .modal__body {
    padding: 1rem;
  }

  .modal__footer {
    flex-direction: column;
  }

  .modal__footer .btn {
    width: 100%;
  }

  .action-btn__label {
    display: inline;
  }

  .users-table th,
  .users-table td {
    padding: 0.5rem;
  }

  .btn--sm {
    min-height: 40px;
  }

  .btn--md {
    min-height: 44px;
  }

  .action-btn {
    min-height: 48px;
  }

  .status-toggle {
    min-height: 36px;
  }

  .form-section__close {
    top: 0.5rem;
    right: 0.5rem;
  }

  [dir="rtl"] .form-section__close {
    right: auto;
    left: 0.5rem;
  }
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

.space-y-4 > * + * {
  margin-top: 1rem;
}

.text-red-500 {
  color: #ef4444;
}

.text-purple-600 {
  color: #7c3aed;
}

.font-bold {
  font-weight: 700;
}

/* ============================================================
   DARK MODE OVERRIDES
   ============================================================ */

.dark .text-red-500 {
  color: #ef4444;
}

.dark .text-purple-600 {
  color: #8b5cf6;
}

/* ============================================================
   TOUCH OPTIMIZATIONS
   ============================================================ */

@media (max-width: 768px) {
  button,
  .btn,
  .action-btn,
  .status-toggle {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
}
</style>