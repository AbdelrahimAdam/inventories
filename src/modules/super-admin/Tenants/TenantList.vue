<template>
  <div class="container mx-auto px-4 py-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">إدارة المستأجرين</h1>
      <button @click="showAddModal = true" class="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors shadow-md">
        + إضافة مستأجر
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
        <p class="text-gray-600 dark:text-gray-400 text-sm">إجمالي المستأجرين</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ tenants.length }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
        <p class="text-gray-600 dark:text-gray-400 text-sm">المستأجرين النشطين</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ activeTenants }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
        <p class="text-gray-600 dark:text-gray-400 text-sm">إجمالي المستخدمين</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalUsers }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
        <p class="text-gray-600 dark:text-gray-400 text-sm">إجمالي الأصناف</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalItems }}</p>
      </div>
    </div>

    <!-- Tenants Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الاسم</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المعرف</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">النطاق</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المستخدمين</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الأصناف</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">تاريخ الإنشاء</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="tenant in tenants" :key="tenant.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{{ tenant.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">{{ tenant.slug }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{{ tenant.domain || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{{ tenant.userCount || 0 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{{ tenant.itemCount || 0 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{{ formatDate(tenant.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-2" :class="languageStore.isRTL ? 'space-x-reverse' : ''">
                  <button @click="editTenant(tenant)" class="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors" title="تعديل">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="confirmDelete(tenant)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors" title="حذف">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="tenants.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                لا توجد مستأجرين
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Tenant Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{{ isEditing ? 'تعديل مستأجر' : 'إضافة مستأجر جديد' }}</h3>
        <form @submit.prevent="saveTenant">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الاسم *</label>
            <input
              type="text"
              v-model="form.name"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المعرف *</label>
            <input
              type="text"
              v-model="form.slug"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              placeholder="example-tenant"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">النطاق</label>
            <input
              type="text"
              v-model="form.domain"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="example.com"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع الرابط</label>
            <select v-model="form.urlType" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="subdomain">نطاق فرعي</option>
              <option value="domain">نطاق مخصص</option>
            </select>
          </div>
          <div class="flex justify-end space-x-3" :class="languageStore.isRTL ? 'space-x-reverse' : ''">
            <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
              إلغاء
            </button>
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
        <p class="mb-6 text-gray-600 dark:text-gray-400">هل أنت متأكد من حذف المستأجر "{{ tenantToDelete?.name }}"؟ سيتم حذف جميع البيانات المرتبطة به.</p>
        <div class="flex justify-end space-x-3" :class="languageStore.isRTL ? 'space-x-reverse' : ''">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
            إلغاء
          </button>
          <button @click="deleteTenant" class="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors shadow-md">
            حذف
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

interface Tenant {
  id: string
  name: string
  slug: string
  domain: string | null
  urlType: string
  createdAt: Date
  userCount?: number
  itemCount?: number
}

const tenants = ref<Tenant[]>([])
const isLoading = ref(false)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const tenantToDelete = ref<Tenant | null>(null)

const form = ref({
  id: '',
  name: '',
  slug: '',
  domain: '',
  urlType: 'subdomain',
})

const activeTenants = computed(() => tenants.value.length)
const totalUsers = computed(() => tenants.value.reduce((sum, t) => sum + (t.userCount || 0), 0))
const totalItems = computed(() => tenants.value.reduce((sum, t) => sum + (t.itemCount || 0), 0))

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ar-EG')
}

const fetchTenants = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Fetch counts for each tenant
    for (const tenant of (data || [])) {
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)

      const { count: itemCount } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)

      tenant.userCount = userCount || 0
      tenant.itemCount = itemCount || 0
      tenant.createdAt = new Date(tenant.created_at)
    }

    tenants.value = data || []
  } catch (error) {
    console.error('Error fetching tenants:', error)
    alert('حدث خطأ أثناء جلب المستأجرين')
  } finally {
    isLoading.value = false
  }
}

const saveTenant = async () => {
  if (!form.value.name || !form.value.slug) {
    alert('الاسم والمعرف مطلوبان')
    return
  }

  isLoading.value = true
  try {
    if (isEditing.value) {
      const { error } = await supabase
        .from('tenants')
        .update({
          name: form.value.name,
          slug: form.value.slug,
          domain: form.value.domain || null,
          url_type: form.value.urlType,
          updated_at: new Date().toISOString(),
        })
        .eq('id', form.value.id)

      if (error) throw error
      alert('تم تحديث المستأجر بنجاح')
    } else {
      const { error } = await supabase
        .from('tenants')
        .insert({
          name: form.value.name,
          slug: form.value.slug,
          domain: form.value.domain || null,
          url_type: form.value.urlType,
        })

      if (error) throw error
      alert('تم إنشاء المستأجر بنجاح')
    }

    closeModal()
    await fetchTenants()
  } catch (error: any) {
    console.error('Error saving tenant:', error)
    alert(error.message || 'حدث خطأ أثناء حفظ المستأجر')
  } finally {
    isLoading.value = false
  }
}

const editTenant = (tenant: Tenant) => {
  isEditing.value = true
  form.value = {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    domain: tenant.domain || '',
    urlType: tenant.urlType,
  }
  showAddModal.value = true
}

const confirmDelete = (tenant: Tenant) => {
  tenantToDelete.value = tenant
  showDeleteModal.value = true
}

const deleteTenant = async () => {
  if (!tenantToDelete.value) return

  isLoading.value = true
  try {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', tenantToDelete.value.id)

    if (error) throw error

    showDeleteModal.value = false
    tenantToDelete.value = null
    alert('تم حذف المستأجر بنجاح')
    await fetchTenants()
  } catch (error: any) {
    console.error('Error deleting tenant:', error)
    alert(error.message || 'حدث خطأ أثناء حذف المستأجر')
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  showAddModal.value = false
  isEditing.value = false
  form.value = {
    id: '',
    name: '',
    slug: '',
    domain: '',
    urlType: 'subdomain',
  }
}

onMounted(() => {
  fetchTenants()
})
</script>