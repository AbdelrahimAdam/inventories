<template>
  <div class="container mx-auto px-4 py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">إدارة المستخدمين</h1>
      <button @click="openAddModal" class="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors shadow-md">
        + إضافة مستخدم
      </button>
    </div>

    <!-- Pending Upgrade Requests Section -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-gray-800 dark:text-white">📋 طلبات ترقية الحساب</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">الموافقة على طلبات الترقية بعد استلام الدفع</p>
          </div>
          <span class="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
            {{ pendingRequests.length }} طلب
          </span>
        </div>
      </div>

      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <div v-for="request in pendingRequests" :key="request.id" class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ request.user_name }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ request.user_email }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                <div>
                  <span class="text-gray-500 dark:text-gray-400">تاريخ الطلب:</span>
                  <span class="text-gray-700 dark:text-gray-300 mr-2">{{ formatDate(request.requested_at) }}</span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">المستأجر:</span>
                  <span class="text-gray-700 dark:text-gray-300 mr-2">{{ request.tenant_name }}</span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">عدد الأصناف:</span>
                  <span class="text-gray-700 dark:text-gray-300 mr-2">{{ request.item_count || 0 }}</span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">أيام التجربة المتبقية:</span>
                  <span class="text-amber-600 dark:text-amber-400 font-semibold mr-2">{{ request.days_left_in_trial }}</span>
                </div>
              </div>
              <div v-if="request.user_message" class="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  <span class="font-medium">ملاحظات المستخدم:</span> {{ request.user_message }}
                </p>
              </div>
            </div>
            <div class="flex gap-2 w-full lg:w-auto">
              <button 
                @click="approveRequest(request)"
                class="flex-1 lg:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                قبول وترقية
              </button>
              <button 
                @click="rejectRequest(request)"
                class="flex-1 lg:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                رفض
              </button>
            </div>
          </div>
        </div>

        <div v-if="pendingRequests.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
          <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>لا توجد طلبات ترقية معلقة</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 border border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          v-model="filters.search"
          placeholder="بحث بالاسم أو البريد الإلكتروني..."
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <select v-model="filters.role" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">جميع الأدوار</option>
          <option value="superadmin">مشرف عام</option>
          <option value="company_manager">مدير شركة</option>
          <option value="warehouse_manager">مدير مستودع</option>
          <option value="viewer">عرض فقط</option>
        </select>
        <select v-model="filters.tenantId" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">جميع المستأجرين</option>
          <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
            {{ tenant.name }}
          </option>
        </select>
        <select v-model="filters.status" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الاسم</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">البريد الإلكتروني</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الدور</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المستأجر</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المستودعات</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الحالة</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">تاريخ الإنشاء</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{{ user.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getRoleBadge(user.role)" class="px-2 py-1 text-xs rounded-full">
                  {{ formatRole(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{{ getTenantName(user.tenantId) }}</td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span v-if="user.allowedWarehouses?.includes('all')" class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                    جميع المستودعات
                  </span>
                  <span v-else-if="user.allowedWarehouses?.length" class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded-full">
                    {{ user.allowedWarehouses.length }} مستودع
                  </span>
                  <span v-else class="text-gray-400 dark:text-gray-500 text-xs">لا توجد مستودعات</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="user.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'" class="px-2 py-1 text-xs rounded-full">
                  {{ user.isActive ? 'نشط' : 'غير نشط' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{{ formatDate(user.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-2" :class="languageStore.isRTL ? 'space-x-reverse' : ''">
                  <button @click="editUser(user)" class="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors" title="تعديل">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="toggleUserStatus(user)" class="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors" title="تغيير الحالة">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                  <button v-if="user.is_trial === true" @click="upgradeUserFromList(user)" class="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors" title="ترقية الحساب">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </button>
                  <button @click="confirmDelete(user)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors" title="حذف">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="8" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">لا توجد مستخدمين</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{{ isEditing ? 'تعديل مستخدم' : 'إضافة مستخدم جديد' }}</h3>
        <form @submit.prevent="saveUser">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الاسم *</label>
            <input type="text" v-model="form.name" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني *</label>
            <input type="email" v-model="form.email" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كلمة المرور *</label>
            <input type="password" v-model="form.password" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">كلمة مرور مؤقتة - يمكن للمستخدم تغييرها بعد تسجيل الدخول</p>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الدور *</label>
            <select v-model="form.role" @change="onRoleChange" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
              <option value="">اختر الدور</option>
              <option value="superadmin">مشرف عام</option>
              <option value="company_manager">مدير شركة</option>
              <option value="warehouse_manager">مدير مستودع</option>
              <option value="viewer">عرض فقط</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المستأجر *</label>
            <select v-model="form.tenantId" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
              <option value="">اختر المستأجر</option>
              <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">{{ tenant.name }}</option>
            </select>
          </div>

          <!-- Warehouse Assignment (for warehouse_manager role) -->
          <div v-if="form.role === 'warehouse_manager'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الوصول إلى المستودعات *</label>
            <div class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-48 overflow-y-auto bg-white dark:bg-gray-700">
              <label class="flex items-center mb-2">
                <input type="checkbox" v-model="form.allWarehouses" @change="onAllWarehousesChange" class="mr-2">
                <span class="font-medium text-gray-900 dark:text-white">جميع المستودعات</span>
              </label>
              <div class="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                <div v-for="warehouse in tenantWarehouses" :key="warehouse.id" class="flex items-center mb-2">
                  <input 
                    type="checkbox" 
                    v-model="form.selectedWarehouses" 
                    :value="warehouse.id"
                    :disabled="form.allWarehouses"
                    class="mr-2"
                  >
                  <span class="text-gray-700 dark:text-gray-300">{{ warehouse.name }}</span>
                </div>
                <div v-if="tenantWarehouses.length === 0" class="text-gray-500 dark:text-gray-400 text-sm">
                  لا توجد مستودعات لهذا المستأجر. يرجى إنشاء مستودع أولاً.
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">حدد المستودعات التي يمكن لهذا المدير الوصول إليها</p>
          </div>

          <div class="flex justify-end space-x-3" :class="languageStore.isRTL ? 'space-x-reverse' : ''">
            <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">إلغاء</button>
            <button type="submit" :disabled="isLoading" class="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50 shadow-md">
              {{ isLoading ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">تأكيد الحذف</h3>
        <p class="mb-6 text-gray-600 dark:text-gray-400">هل أنت متأكد من حذف المستخدم "{{ userToDelete?.name }}"؟</p>
        <div class="flex justify-end space-x-3" :class="languageStore.isRTL ? 'space-x-reverse' : ''">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">إلغاء</button>
          <button @click="deleteUser" class="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors shadow-md">حذف</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@/services/supabase'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

interface User {
  id: string
  name: string
  email: string
  role: string
  tenantId: string
  isActive: boolean
  createdAt: Date
  allowedWarehouses?: string[]
  is_trial?: boolean
  trial_ends_at?: string
}

interface Tenant {
  id: string
  name: string
}

interface Warehouse {
  id: string
  name: string
  tenant_id: string
}

interface UpgradeRequest {
  id: string
  user_id: string
  user_name: string
  user_email: string
  tenant_id: string
  tenant_name: string
  status: string
  requested_at: string
  user_message: string | null
  item_count: number
  days_left_in_trial: number
}

// Reactive data
const users = ref<User[]>([])
const tenants = ref<Tenant[]>([])
const warehouses = ref<Warehouse[]>([])
const tenantWarehouses = ref<Warehouse[]>([])
const pendingRequests = ref<UpgradeRequest[]>([])
const isLoading = ref(false)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const userToDelete = ref<User | null>(null)

// Filters
const filters = ref({
  search: '',
  role: '',
  tenantId: '',
  status: '',
})

// Form data
const form = ref({
  id: '',
  name: '',
  email: '',
  password: '',
  role: '',
  tenantId: '',
  selectedWarehouses: [] as string[],
  allWarehouses: false,
})

// Computed properties
const filteredUsers = computed((): User[] => {
  let filtered = [...users.value]
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(u => 
      u.name.toLowerCase().includes(search) || 
      u.email.toLowerCase().includes(search)
    )
  }
  
  if (filters.value.role) {
    filtered = filtered.filter(u => u.role === filters.value.role)
  }
  
  if (filters.value.tenantId) {
    filtered = filtered.filter(u => u.tenantId === filters.value.tenantId)
  }
  
  if (filters.value.status === 'active') {
    filtered = filtered.filter(u => u.isActive)
  }
  
  if (filters.value.status === 'inactive') {
    filtered = filtered.filter(u => !u.isActive)
  }
  
  return filtered
})

// Helper functions
const formatRole = (role: string): string => {
  const roles: Record<string, string> = {
    superadmin: 'مشرف عام',
    company_manager: 'مدير شركة',
    warehouse_manager: 'مدير مستودع',
    viewer: 'عرض فقط',
  }
  return roles[role] || role
}

const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('ar-EG')
}

const getRoleBadge = (role: string): string => {
  const badges: Record<string, string> = {
    superadmin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    company_manager: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    warehouse_manager: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    viewer: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
  }
  return badges[role] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
}

const getTenantName = (tenantId: string): string => {
  const tenant = tenants.value.find(t => t.id === tenantId)
  return tenant?.name || 'غير معروف'
}

// Fetch pending upgrade requests
const fetchPendingRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('upgrade_requests')
      .select(`
        id,
        user_id,
        tenant_id,
        status,
        requested_at,
        user_message,
        users:user_id (name, email, is_trial, trial_ends_at),
        tenants:tenant_id (name)
      `)
      .eq('status', 'pending')
      .order('requested_at', { ascending: true })

    if (error) throw error

    pendingRequests.value = (data || []).map((item: any) => {
      let daysLeft = 0
      if (item.users?.trial_ends_at) {
        const endDate = new Date(item.users.trial_ends_at)
        const diff = endDate.getTime() - Date.now()
        daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
      }

      let itemCount = 0

      return {
        id: item.id,
        user_id: item.user_id,
        user_name: item.users?.name || 'غير معروف',
        user_email: item.users?.email || '',
        tenant_id: item.tenant_id,
        tenant_name: item.tenants?.name || 'غير معروف',
        status: item.status,
        requested_at: item.requested_at,
        user_message: item.user_message,
        item_count: itemCount,
        days_left_in_trial: daysLeft
      }
    })
  } catch (error) {
    console.error('Error fetching pending requests:', error)
  }
}

// Approve upgrade request
const approveRequest = async (request: UpgradeRequest) => {
  if (!confirm(`هل أنت متأكد من قبول طلب ترقية المستخدم "${request.user_name}"؟\n\n⚠️ تأكد من استلام الدفع أولاً.`)) return
  
  const adminNotes = prompt('أضف ملاحظات (اختياري):')
  
  const { data, error } = await supabase.rpc('approve_upgrade_request', {
    request_id: request.id,
    admin_notes: adminNotes || null
  })
  
  if (error) {
    console.error('Error approving request:', error)
    alert('حدث خطأ أثناء قبول الطلب')
  } else if (data?.success) {
    alert(`✅ ${data.message}`)
    await fetchPendingRequests()
    await fetchUsers()
  } else {
    alert(data?.message || 'حدث خطأ')
  }
}

// Reject upgrade request
const rejectRequest = async (request: UpgradeRequest) => {
  if (!confirm(`هل أنت متأكد من رفض طلب ترقية المستخدم "${request.user_name}"؟`)) return
  
  const adminNotes = prompt('سبب الرفض (اختياري):')
  
  const { data, error } = await supabase.rpc('reject_upgrade_request', {
    request_id: request.id,
    admin_notes: adminNotes || null
  })
  
  if (error) {
    console.error('Error rejecting request:', error)
    alert('حدث خطأ أثناء رفض الطلب')
  } else if (data?.success) {
    alert(data.message)
    await fetchPendingRequests()
  } else {
    alert(data?.message || 'حدث خطأ')
  }
}

// Upgrade user directly from list
const upgradeUserFromList = async (user: User) => {
  if (!confirm(`هل أنت متأكد من ترقية المستخدم "${user.name}" إلى حساب مدفوع؟ سيتم الاحتفاظ بجميع بياناته.`)) return
  
  isLoading.value = true
  try {
    const { data: existingRequest } = await supabase
      .from('upgrade_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .maybeSingle()
    
    if (existingRequest) {
      const { data, error } = await supabase.rpc('approve_upgrade_request', {
        request_id: existingRequest.id,
        admin_notes: 'تمت الترقية مباشرة من قبل المسؤول'
      })
      
      if (error) throw error
      alert(data?.message || 'تم ترقية المستخدم بنجاح!')
    } else {
      const { data: requestData, error: requestError } = await supabase.rpc('request_upgrade', {
        user_message: 'تمت الترقية مباشرة من قبل المسؤول'
      })
      
      if (requestError) throw requestError
      
      if (requestData?.success && requestData?.request_id) {
        const { data, error } = await supabase.rpc('approve_upgrade_request', {
          request_id: requestData.request_id,
          admin_notes: 'تمت الترقية مباشرة من قبل المسؤول'
        })
        
        if (error) throw error
        alert(data?.message || 'تم ترقية المستخدم بنجاح!')
      }
    }
    
    await fetchUsers()
    await fetchPendingRequests()
  } catch (error: any) {
    console.error('Error upgrading user:', error)
    alert(error.message || 'حدث خطأ أثناء ترقية المستخدم')
  } finally {
    isLoading.value = false
  }
}

const openAddModal = (): void => {
  isEditing.value = false
  form.value = {
    id: '',
    name: '',
    email: '',
    password: '',
    role: '',
    tenantId: '',
    selectedWarehouses: [],
    allWarehouses: false,
  }
  tenantWarehouses.value = []
  showAddModal.value = true
}

const onRoleChange = async (): Promise<void> => {
  if (form.value.tenantId && form.value.role === 'warehouse_manager') {
    await loadTenantWarehouses(form.value.tenantId)
  }
}

const onAllWarehousesChange = (): void => {
  if (form.value.allWarehouses) {
    form.value.selectedWarehouses = []
  }
}

const loadTenantWarehouses = async (tenantId: string): Promise<void> => {
  const { data, error } = await supabase
    .from('warehouses')
    .select('id, name, tenant_id')
    .eq('tenant_id', tenantId)
    .order('name')
  
  if (!error && data) {
    tenantWarehouses.value = data
  } else {
    tenantWarehouses.value = []
  }
}

const fetchUsers = async (): Promise<void> => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    users.value = (data || []).map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      tenantId: u.tenant_id,
      isActive: u.is_active,
      createdAt: new Date(u.created_at),
      allowedWarehouses: u.allowed_warehouses || [],
      is_trial: u.is_trial || false,
      trial_ends_at: u.trial_ends_at,
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    alert('حدث خطأ أثناء جلب المستخدمين')
  } finally {
    isLoading.value = false
  }
}

const fetchTenants = async (): Promise<void> => {
  try {
    const { data, error } = await supabase.from('tenants').select('id, name').order('name')
    if (error) throw error
    tenants.value = data || []
  } catch (error) {
    console.error('Error fetching tenants:', error)
  }
}

const fetchWarehouses = async (): Promise<void> => {
  try {
    const { data, error } = await supabase.from('warehouses').select('id, name, tenant_id').order('name')
    if (error) throw error
    warehouses.value = data || []
  } catch (error) {
    console.error('Error fetching warehouses:', error)
  }
}

const saveUser = async (): Promise<void> => {
  if (!form.value.name || !form.value.email || !form.value.password || !form.value.role || !form.value.tenantId) {
    alert('يرجى ملء جميع الحقول المطلوبة')
    return
  }

  if (form.value.role === 'warehouse_manager' && !form.value.allWarehouses && form.value.selectedWarehouses.length === 0) {
    alert('يرجى تحديد مستودع واحد على الأقل لمدير المستودع')
    return
  }

  isLoading.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('غير مصرح')
    }

    let allowedWarehouses: string[] = []
    if (form.value.role === 'warehouse_manager') {
      if (form.value.allWarehouses) {
        allowedWarehouses = ['all']
      } else {
        allowedWarehouses = form.value.selectedWarehouses
      }
    }

    if (isEditing.value) {
      const { error } = await supabase
        .from('users')
        .update({
          name: form.value.name,
          role: form.value.role,
          tenant_id: form.value.tenantId,
          allowed_warehouses: allowedWarehouses,
          updated_at: new Date().toISOString(),
        })
        .eq('id', form.value.id)

      if (error) throw error
      alert('تم تحديث المستخدم بنجاح!')
    } else {
      const response = await fetch(
        'https://nnbnlhzraequtqlruhbb.supabase.co/functions/v1/create-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            email: form.value.email,
            password: form.value.password,
            name: form.value.name,
            role: form.value.role,
            allowed_warehouses: allowedWarehouses,
            tenant_id: form.value.tenantId
          })
        }
      )
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'فشل إنشاء المستخدم')
      }
      
      alert(result.message || 'تم إنشاء المستخدم بنجاح!')
    }

    closeModal()
    await fetchUsers()
  } catch (error: any) {
    console.error('Error saving user:', error)
    alert(error.message || 'حدث خطأ أثناء حفظ المستخدم')
  } finally {
    isLoading.value = false
  }
}

const editUser = (user: User): void => {
  isEditing.value = true
  const allowedWarehouses = user.allowedWarehouses || []
  const allWarehouses = allowedWarehouses.includes('all')
  const selectedWarehouses = allWarehouses ? [] : allowedWarehouses.filter(w => w !== 'all')
  
  form.value = {
    id: user.id,
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    tenantId: user.tenantId,
    selectedWarehouses,
    allWarehouses,
  }
  
  if (user.role === 'warehouse_manager' && user.tenantId) {
    loadTenantWarehouses(user.tenantId)
  }
  
  showAddModal.value = true
}

const toggleUserStatus = async (user: User): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: !user.isActive, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) throw error
    alert(`تم ${!user.isActive ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح!`)
    await fetchUsers()
  } catch (error) {
    console.error('Error toggling user status:', error)
    alert('حدث خطأ أثناء تغيير حالة المستخدم')
  }
}

const confirmDelete = (user: User): void => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const deleteUser = async (): Promise<void> => {
  if (!userToDelete.value) return

  isLoading.value = true
  try {
    const { error } = await supabase.from('users').delete().eq('id', userToDelete.value.id)
    if (error) throw error

    showDeleteModal.value = false
    userToDelete.value = null
    alert('تم حذف المستخدم بنجاح!')
    await fetchUsers()
  } catch (error: any) {
    console.error('Error deleting user:', error)
    alert(error.message || 'حدث خطأ أثناء حذف المستخدم')
  } finally {
    isLoading.value = false
  }
}

const closeModal = (): void => {
  showAddModal.value = false
  isEditing.value = false
  form.value = {
    id: '',
    name: '',
    email: '',
    password: '',
    role: '',
    tenantId: '',
    selectedWarehouses: [],
    allWarehouses: false,
  }
  tenantWarehouses.value = []
}

// Watchers
watch(() => form.value.tenantId, async (newTenantId) => {
  if (newTenantId && form.value.role === 'warehouse_manager') {
    await loadTenantWarehouses(newTenantId)
  } else {
    tenantWarehouses.value = []
  }
})

// Lifecycle
onMounted(() => {
  fetchTenants()
  fetchWarehouses()
  fetchUsers()
  fetchPendingRequests()
})
</script>