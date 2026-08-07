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
          <h1 class="page-header__title">إدارة المستخدمين</h1>
          <p class="page-header__subtitle">قم بإدارة المستخدمين في نظامك</p>
        </div>
        <div class="page-header__actions">
          <span class="user-count">{{ users.length }} مستخدم</span>
          <button @click="refreshUsers" class="btn btn--outline btn--sm" :disabled="isLoading">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button 
          @click="activeForm = 'manager'"
          class="action-btn action-btn--manager"
          :class="{ 'action-btn--active': activeForm === 'manager' }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>إضافة مدير مستودع</span>
        </button>
        <button 
          @click="activeForm = 'viewer'"
          class="action-btn action-btn--viewer"
          :class="{ 'action-btn--active': activeForm === 'viewer' }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>إضافة مستخدم عرض فقط</span>
        </button>
        <button 
          v-if="activeForm"
          @click="activeForm = null"
          class="action-btn action-btn--cancel"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>إلغاء</span>
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
              <p class="form-hint">اضغط Ctrl (أو Cmd) لتحديد عدة مستودعات</p>
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
                جاري الإضافة...
              </span>
              <span v-else>إضافة مدير مستودع</span>
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
              <p class="form-hint">اضغط Ctrl (أو Cmd) لتحديد عدة مستودعات</p>
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
                جاري الإضافة...
              </span>
              <span v-else>إضافة مستخدم عرض فقط</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Users List -->
      <div class="users-section">
        <div class="users-section__header">
          <h2 class="users-section__title">قائمة المستخدمين</h2>
          <span class="users-section__badge">{{ users.length }} مستخدم</span>
        </div>

        <!-- Desktop Table -->
        <div class="table-wrapper desktop-table">
          <table class="users-table">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th class="hide-mobile">البريد الإلكتروني</th>
                <th>الدور</th>
                <th class="hide-tablet">المستودعات</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="users-table__row">
                <td>
                  <div class="user-info">
                    <div class="user-info__avatar">{{ getUserInitial(user.name) }}</div>
                    <div>
                      <div class="user-info__name">{{ user.name }}</div>
                      <div class="user-info__email-mobile">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="hide-mobile">{{ user.email }}</td>
                <td>
                  <span :class="['role-badge', getRoleBadgeClass(user.role)]">
                    {{ getRoleName(user.role) }}
                  </span>
                </td>
                <td class="hide-tablet">
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
                      title="تعديل المستودعات"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
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
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="6" class="empty-state">
                  <svg class="empty-state__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p>لا يوجد مستخدمين. قم بإضافة مستخدمين جدد.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="mobile-cards">
          <div v-for="user in users" :key="user.id" class="user-card">
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
                <span class="user-card__label">المستودعات</span>
                <span class="user-card__value">{{ user.allowed_warehouses?.length || 0 }} مستودع</span>
              </div>
              <div class="user-card__detail">
                <span class="user-card__label">الحالة</span>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
          <div v-if="users.length === 0" class="empty-state-card">
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
            <h3 class="modal__title">تعديل صلاحيات المستخدم</h3>
            <button @click="showEditWarehousesModal = false" class="modal__close">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="modal__body">
            <p class="modal__subtitle">تعديل المستودعات المسموحة للمستخدم: <span class="font-bold">{{ editingUser?.name }}</span></p>

            <div class="space-y-4">
              <div class="form-group">
                <label class="form-label">المستودعات الرئيسية المسموح بها</label>
                <select 
                  v-model="editForm.allowedWarehouses" 
                  multiple 
                  class="form-select" 
                  size="4"
                >
                  <option v-for="warehouse in allPrimaryWarehouses" :key="warehouse.id" :value="warehouse.id">
                    {{ warehouse.name_ar || warehouse.name }}
                  </option>
                </select>
              </div>

              <div v-if="editingUser?.role === 'warehouse_manager'" class="form-group">
                <label class="form-label">مواقع الصرف المسموح بها</label>
                <select 
                  v-model="editForm.allowedDispatchWarehouses" 
                  multiple 
                  class="form-select" 
                  size="3"
                >
                  <option v-for="warehouse in allDispatchWarehouses" :key="warehouse.id" :value="warehouse.id">
                    {{ warehouse.name_ar || warehouse.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal__footer">
            <button @click="showEditWarehousesModal = false" class="btn btn--outline btn--md">
              إلغاء
            </button>
            <button @click="updateUserWarehouses" :disabled="isUpdating" class="btn btn--primary btn--md">
              {{ isUpdating ? 'جاري التحديث...' : 'تحديث الصلاحيات' }}
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
  background: linear-gradient(to right, #dc2626, #b91c1c);
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
  background: linear-gradient(to right, #16a34a, #15803d);
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
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
  color: #d1fae5;
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
   ACTION BUTTONS
   ============================================================ */

.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  border: 2px solid transparent;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}

.action-btn--manager {
  background: #f3e8ff;
  color: #6b21a5;
  border-color: #d8b4fe;
}

.dark .action-btn--manager {
  background: rgba(139, 92, 246, 0.15);
  color: #d8b4fe;
  border-color: rgba(139, 92, 246, 0.3);
}

.action-btn--manager:hover {
  background: #e9d5ff;
  transform: translateY(-1px);
}

.action-btn--manager.action-btn--active {
  background: #7c3aed;
  color: white;
  border-color: #6d28d9;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.dark .action-btn--manager.action-btn--active {
  background: #7c3aed;
  color: white;
  border-color: #6d28d9;
}

.action-btn--viewer {
  background: #eff6ff;
  color: #1e40af;
  border-color: #bfdbfe;
}

.dark .action-btn--viewer {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  border-color: rgba(59, 130, 246, 0.3);
}

.action-btn--viewer:hover {
  background: #dbeafe;
  transform: translateY(-1px);
}

.action-btn--viewer.action-btn--active {
  background: #2563eb;
  color: white;
  border-color: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.dark .action-btn--viewer.action-btn--active {
  background: #2563eb;
  color: white;
  border-color: #1d4ed8;
}

.action-btn--cancel {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #e5e7eb;
}

.dark .action-btn--cancel {
  background: #374151;
  color: #9ca3af;
  border-color: #4b5563;
}

.action-btn--cancel:hover {
  background: #e5e7eb;
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
  margin-bottom: 1.5rem;
  animation: slideDown 0.3s ease-out;
}

.dark .form-section {
  background: #1f2937;
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
  background: linear-gradient(to right, #7c3aed, #6d28d9);
}

.form-section--viewer .form-section__header {
  background: linear-gradient(to right, #2563eb, #1d4ed8);
}

.form-section__header {
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.form-section__body {
  padding: 1.5rem;
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

.form-group:last-child {
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
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.form-section--viewer .form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
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
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
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
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* ============================================================
   USERS SECTION
   ============================================================ */

.users-section {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.dark .users-section {
  background: #1f2937;
}

.users-section__header {
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.dark .users-section__header {
  border-color: #374151;
}

.users-section__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
}

.dark .users-section__title {
  color: white;
}

.users-section__badge {
  font-size: 0.75rem;
  font-weight: 700;
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.dark .users-section__badge {
  background: #374151;
  color: #9ca3af;
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
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dark .users-table th {
  color: #9ca3af;
}

.users-table__row {
  border-bottom: 1px solid #e5e7eb;
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
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #d97706, #16a34a);
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

.user-info__email-mobile {
  display: none;
  font-size: 0.75rem;
  color: #6b7280;
}

.dark .user-info__email-mobile {
  color: #9ca3af;
}

/* ============================================================
   ROLE BADGES
   ============================================================ */

.role-badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
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
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 60px;
  min-height: 32px;
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
   ACTION BUTTONS
   ============================================================ */

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.action-btn {
  padding: 0.375rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.action-btn--edit {
  color: #2563eb;
}

.action-btn--edit:hover {
  background: #eff6ff;
}

.dark .action-btn--edit:hover {
  background: #1e3a5f;
}

.action-btn--delete {
  color: #dc2626;
}

.action-btn--delete:hover {
  background: #fef2f2;
}

.dark .action-btn--delete:hover {
  background: #3f1a1a;
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
}

.btn--md {
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
}

.btn--full {
  width: 100%;
}

.btn--primary {
  background: linear-gradient(to right, #8b5cf6, #7c3aed);
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background: linear-gradient(to right, #7c3aed, #6d28d9);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--secondary {
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
}

.btn--secondary:hover:not(:disabled) {
  background: linear-gradient(to right, #2563eb, #1d4ed8);
}

.btn--secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--danger {
  background: #ef4444;
  color: white;
}

.btn--danger:hover:not(:disabled) {
  background: #dc2626;
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
   MODAL
   ============================================================ */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
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
}

.dark .modal__header {
  border-color: #374151;
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
  background: #f3f4f6;
}

.dark .modal__close {
  color: #9ca3af;
}

.dark .modal__close:hover {
  background: #374151;
}

.modal__body {
  padding: 1.5rem;
}

.modal__subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
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
}

.dark .modal__footer {
  border-color: #374151;
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
  width: 4rem;
  height: 4rem;
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
  background: linear-gradient(135deg, #d97706, #16a34a);
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
  font-size: 0.75rem;
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

/* ============================================================
   RESPONSIVE BREAKPOINTS
   ============================================================ */

@media (max-width: 1024px) {
  .hide-tablet {
    display: none;
  }
}

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

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .hide-mobile {
    display: none;
  }

  .user-info__email-mobile {
    display: block;
  }

  .desktop-table {
    display: none;
  }

  .mobile-cards {
    display: block;
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
}

/* ============================================================
   DARK MODE OVERRIDES
   ============================================================ */

.dark .text-red-500 {
  color: #ef4444;
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

  .btn--sm {
    min-height: 40px;
  }

  .btn--md {
    min-height: 44px;
  }

  .status-toggle {
    min-height: 36px;
  }

  .action-btn {
    min-height: 48px;
  }
}
</style>