<template>
  <div class="max-w-4xl mx-auto px-4 py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- Access Control -->
    <div v-if="!canManageUsers" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div class="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 px-6 py-4">
        <h1 class="text-xl font-bold text-white">إدارة المستخدمين</h1>
      </div>
      <div class="p-8 text-center">
        <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-2">وصول مقيد</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          فقط المديرين (Company Manager) والمشرفين (Super Admin) يمكنهم إدارة المستخدمين.
        </p>
        <button @click="goBack" class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
          العودة للرئيسية
        </button>
      </div>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 rounded-xl p-6 mb-6">
        <h1 class="text-2xl font-bold text-white mb-2">إدارة المستخدمين</h1>
        <p class="text-green-100">
          قم بإدارة المستخدمين في نظامك. يمكنك إضافة مدراء مستودعات ومستخدمين للعرض فقط.
        </p>
      </div>

      <!-- Users List Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-bold text-gray-800 dark:text-white">قائمة المستخدمين</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">جميع المستخدمين في نظامك</p>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الاسم</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">البريد الإلكتروني</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الدور</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المستودعات الرئيسية</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">مواقع الصرف</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الحالة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getRoleBadgeClass(user.role)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ getRoleName(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    <span v-if="user.role === 'warehouse_manager' && user.allowed_warehouses?.length">
                      {{ user.allowed_warehouses.filter(w => !isDispatchWarehouse(w)).length }} مستودع
                    </span>
                    <span v-else>-</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    <span v-if="user.role === 'warehouse_manager' && user.allowed_dispatch_warehouses?.length">
                      {{ user.allowed_dispatch_warehouses.length }} موقع صرف
                    </span>
                    <span v-else>-</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button @click="toggleUserStatus(user)" :class="user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'" class="px-2 py-1 text-xs font-medium rounded-full transition-colors">
                    {{ user.is_active ? 'نشط' : 'غير نشط' }}
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button @click="editUserWarehouses(user)" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors mr-2" title="تعديل المستودعات">
                    <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </button>
                  <button v-if="user.role !== 'superadmin' && user.id !== authStore.user?.id" @click="deleteUser(user)" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="حذف المستخدم">
                    <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                 </tr>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="7" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  لا يوجد مستخدمين. قم بإضافة مستخدمين جدد.
                 </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Warehouse Manager Form -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <h2 class="text-xl font-bold text-gray-800 dark:text-white">إضافة مدير مستودع</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">قم بإضافة مدير مستودع جديد وتعيين المستودعات المسموح بها</p>
        </div>
        
        <form @submit.prevent="createWarehouseManager" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">
                الاسم <span class="text-red-500">*</span>
              </label>
              <input type="text" v-model="warehouseManagerForm.name" required class="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="أدخل اسم مدير المستودع" />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">
                البريد الإلكتروني <span class="text-red-500">*</span>
              </label>
              <input type="email" v-model="warehouseManagerForm.email" required class="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="example@company.com" />
            </div>
          </div>
          
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">
              كلمة المرور المؤقتة <span class="text-red-500">*</span>
            </label>
            <input type="password" v-model="warehouseManagerForm.password" required class="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="كلمة مرور مؤقتة للمستخدم" />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">سيتمكن المستخدم من تغيير كلمة المرور بعد تسجيل الدخول</p>
          </div>
          
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">
              المستودعات الرئيسية المسموح بها <span class="text-red-500">*</span>
            </label>
            <select v-model="warehouseManagerForm.allowedWarehouses" multiple class="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white" size="4">
              <option v-for="warehouse in primaryWarehouses" :key="warehouse.id" :value="warehouse.id">
                {{ warehouse.name_ar || warehouse.name }}
              </option>
            </select>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">اضغط مع الاستمرار على Ctrl (أو Cmd) لتحديد عدة مستودعات</p>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">
              مواقع الصرف المسموح بها
            </label>
            <select v-model="warehouseManagerForm.allowedDispatchWarehouses" multiple class="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white" size="4">
              <option v-for="warehouse in dispatchWarehouses" :key="warehouse.id" :value="warehouse.id">
                {{ warehouse.name_ar || warehouse.name }}
              </option>
            </select>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">اختر مواقع الصرف التي يمكن لمدير المستودع الصرف منها</p>
          </div>
          
          <div class="flex justify-end">
            <button type="submit" :disabled="isCreating" class="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold transition-all shadow-md disabled:opacity-50">
              <span v-if="isCreating" class="flex items-center gap-2">
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

      <!-- Edit User Warehouses Modal -->
      <div v-if="showEditWarehousesModal" class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">تعديل صلاحيات المستخدم</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">تعديل المستودعات المسموحة للمستخدم: <span class="font-bold">{{ editingUser?.name }}</span></p>
          
          <div class="space-y-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">
                المستودعات الرئيسية المسموح بها
              </label>
              <select v-model="editForm.allowedWarehouses" multiple class="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white" size="6">
                <option v-for="warehouse in allPrimaryWarehouses" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name_ar || warehouse.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">
                مواقع الصرف المسموح بها
              </label>
              <select v-model="editForm.allowedDispatchWarehouses" multiple class="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white" size="4">
                <option v-for="warehouse in allDispatchWarehouses" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name_ar || warehouse.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-6">
            <button @click="showEditWarehousesModal = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
              إلغاء
            </button>
            <button @click="updateUserWarehouses" :disabled="isUpdating" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md">
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
const isCreating = ref(false)
const isUpdating = ref(false)
const showEditWarehousesModal = ref(false)
const editingUser = ref<any>(null)

const warehouseManagerForm = ref({
  name: '',
  email: '',
  password: '',
  allowedWarehouses: [] as string[],
  allowedDispatchWarehouses: [] as string[]
})

const editForm = ref({
  allowedWarehouses: [] as string[],
  allowedDispatchWarehouses: [] as string[]
})

const canManageUsers = computed(() => authStore.isSuperAdmin || authStore.isCompanyManager)

const primaryWarehouses = computed(() => warehouseStore.warehouses.filter(w => w.type !== 'dispatch'))
const dispatchWarehouses = computed(() => warehouseStore.warehouses.filter(w => w.type === 'dispatch'))
const allPrimaryWarehouses = computed(() => warehouseStore.warehouses.filter(w => w.type !== 'dispatch'))
const allDispatchWarehouses = computed(() => warehouseStore.warehouses.filter(w => w.type === 'dispatch'))

const isDispatchWarehouse = (warehouseId: string) => {
  const warehouse = warehouseStore.warehouses.find(w => w.id === warehouseId)
  return warehouse?.type === 'dispatch'
}

const getRoleBadgeClass = (role: string) => {
  const badges: Record<string, string> = {
    superadmin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    company_manager: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    warehouse_manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }
  return badges[role] || 'bg-gray-100 text-gray-800'
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
  }
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
      'https://nnbnlhzraequtqlruhbb.supabase.co/functions/v1/create-user',
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
    const { error } = await supabase
      .from('users')
      .update({
        allowed_warehouses: editForm.value.allowedWarehouses,
        allowed_dispatch_warehouses: editForm.value.allowedDispatchWarehouses,
        updated_at: new Date().toISOString()
      })
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
    alert(`تم ${user.is_active ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`)
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