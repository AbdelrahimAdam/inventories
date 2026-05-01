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
          <thead class="bg-gradient-to-r from-amber-700 to-amber-800 sticky top-0 z-10">
            <tr>
              <th class="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">الاسم</th>
              <th class="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">المعرف</th>
              <th class="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">النطاق</th>
              <th class="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">المستخدمين</th>
              <th class="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">الأصناف</th>
              <th class="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">حالة الاشتراك</th>
              <th class="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">ينتهي في</th>
              <th class="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">تاريخ الإنشاء</th>
              <th class="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider w-24">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="tenant in tenants" :key="tenant.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-center font-medium text-gray-900 dark:text-white">{{ tenant.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">{{ tenant.slug }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-400">{{ tenant.domain || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-400">{{ tenant.userCount || 0 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-400">{{ tenant.itemCount || 0 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span :class="getSubscriptionBadge(tenant.subscription_status)" class="px-2 py-1 text-xs rounded-full">
                  {{ formatSubscriptionStatus(tenant.subscription_status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-400">{{ tenant.paid_until ? formatDate(tenant.paid_until) : '—' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-400">{{ formatDate(tenant.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="action-menu-container relative inline-block">
                  <button 
                    @click.stop="toggleActionMenu(tenant.id, $event)"
                    class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-xs font-medium inline-flex items-center justify-center gap-1 shadow-sm whitespace-nowrap"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    <span>إجراءات</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              </td>
             </tr>
            <tr v-if="tenants.length === 0">
              <td colspan="9" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                لا توجد مستأجرين
              </td>
             </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Teleported Dropdown Menu -->
    <Teleport to="body">
      <div 
        v-if="activeActionMenu" 
        class="fixed z-[9999] w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        :style="dropdownStyle"
        @click.stop
      >
        <div class="max-h-80 overflow-y-auto py-1">
          <!-- Edit button -->
          <button @click="editTenant(getActiveTenant()); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 flex items-center gap-3" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            <span>تعديل</span>
          </button>

          <!-- Extend subscription button -->
          <button @click="showExtendModal(getActiveTenant()); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 flex items-center gap-3" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>تمديد الاشتراك</span>
          </button>

          <!-- Activate subscription button (for expired tenants) -->
          <button v-if="getActiveTenant()?.subscription_status !== 'active'" @click="activateSubscription(getActiveTenant()); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 flex items-center gap-3" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            <span>تفعيل الاشتراك</span>
          </button>

          <!-- Toggle trial button -->
          <button @click="toggleTrial(getActiveTenant()); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 flex items-center gap-3" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{{ getActiveTenant()?.is_trial ? 'إيقاف الفترة التجريبية' : 'تفعيل الفترة التجريبية' }}</span>
          </button>

          <div class="border-t my-1"></div>

          <!-- Delete button -->
          <button @click="confirmDelete(getActiveTenant()); closeActionMenu()" class="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center gap-3" :class="languageStore.isRTL ? 'justify-end' : 'justify-start'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            <span>حذف</span>
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Add/Edit Tenant Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{{ isEditing ? 'تعديل مستأجر' : 'إضافة مستأجر جديد' }}</h3>
        <form @submit.prevent="saveTenant">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الاسم *</label>
            <input type="text" v-model="form.name" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المعرف *</label>
            <input type="text" v-model="form.slug" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required placeholder="example-tenant" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">النطاق</label>
            <input type="text" v-model="form.domain" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="example.com" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع الرابط</label>
            <select v-model="form.urlType" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="subdomain">نطاق فرعي</option>
              <option value="domain">نطاق مخصص</option>
            </select>
          </div>
          <div class="flex justify-end gap-3" :class="languageStore.isRTL ? 'space-x-reverse' : ''">
            <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">إلغاء</button>
            <button type="submit" :disabled="isLoading" class="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50 shadow-md">{{ isLoading ? 'جاري الحفظ...' : 'حفظ' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Extend Subscription Modal -->
    <div v-if="showExtendModalVisible" class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">تمديد الاشتراك</h3>
        <p class="mb-4 text-gray-600 dark:text-gray-400">تمديد اشتراك المستأجر "{{ selectedTenant?.name }}" لمدة:</p>
        <div class="space-y-2 mb-6">
          <button @click="extendSubscription(1)" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">شهر واحد</button>
          <button @click="extendSubscription(3)" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">3 أشهر</button>
          <button @click="extendSubscription(6)" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">6 أشهر</button>
          <button @click="extendSubscription(12)" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">12 شهراً</button>
        </div>
        <div class="flex justify-end gap-3">
          <button @click="showExtendModalVisible = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">إلغاء</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">تأكيد الحذف</h3>
        <p class="mb-6 text-gray-600 dark:text-gray-400">هل أنت متأكد من حذف المستأجر "{{ tenantToDelete?.name }}"؟ سيتم حذف جميع البيانات المرتبطة به.</p>
        <div class="flex justify-end gap-3" :class="languageStore.isRTL ? 'space-x-reverse' : ''">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">إلغاء</button>
          <button @click="deleteTenant" class="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors shadow-md">حذف</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
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
  subscription_status?: string
  paid_until?: string
  is_trial?: boolean
  trial_ends_at?: string
}

const tenants = ref<Tenant[]>([])
const isLoading = ref(false)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const showExtendModalVisible = ref(false)
const isEditing = ref(false)
const tenantToDelete = ref<Tenant | null>(null)
const selectedTenant = ref<Tenant | null>(null)

// Dropdown menu state
const activeActionMenu = ref<string | null>(null)
const dropdownStyle = ref({ top: '0px', left: '0px' })
let activeButtonElement: HTMLElement | null = null

const form = ref({
  id: '',
  name: '',
  slug: '',
  domain: '',
  urlType: 'subdomain',
})

const activeTenants = computed(() => tenants.value.filter(t => t.subscription_status === 'active').length)
const totalUsers = computed(() => tenants.value.reduce((sum, t) => sum + (t.userCount || 0), 0))
const totalItems = computed(() => tenants.value.reduce((sum, t) => sum + (t.itemCount || 0), 0))

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('ar-EG')
}

const getSubscriptionBadge = (status?: string): string => {
  if (status === 'active') return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
  if (status === 'expired') return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  if (status === 'cancelled') return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
}

const formatSubscriptionStatus = (status?: string): string => {
  if (status === 'active') return 'نشط'
  if (status === 'expired') return 'منتهي'
  if (status === 'cancelled') return 'ملغي'
  return 'غير محدد'
}

const getActiveTenant = (): Tenant | undefined => {
  if (!activeActionMenu.value) return undefined
  return tenants.value.find(t => t.id === activeActionMenu.value)
}

const updateDropdownPosition = () => {
  if (!activeButtonElement) return
  const rect = activeButtonElement.getBoundingClientRect()
  const dropdownWidth = 224
  const windowWidth = window.innerWidth

  let left: number
  if (languageStore.isRTL) {
    let rightPos = windowWidth - rect.right
    if (rightPos + dropdownWidth > windowWidth) rightPos = windowWidth - dropdownWidth
    if (rightPos < 0) rightPos = 0
    left = rightPos
  } else {
    let leftPos = rect.left
    if (leftPos + dropdownWidth > windowWidth) leftPos = windowWidth - dropdownWidth
    if (leftPos < 0) leftPos = 0
    left = leftPos
  }

  dropdownStyle.value = {
    top: `${rect.bottom + window.scrollY + 4}px`,
    left: `${left}px`
  }
}

const toggleActionMenu = (tenantId: string, event: MouseEvent) => {
  const button = event.currentTarget as HTMLElement
  if (activeActionMenu.value === tenantId) {
    closeActionMenu()
    return
  }
  activeButtonElement = button
  activeActionMenu.value = tenantId
  nextTick(() => {
    updateDropdownPosition()
    window.addEventListener('scroll', updateDropdownPosition, true)
    window.addEventListener('resize', updateDropdownPosition)
  })
}

const closeActionMenu = () => {
  activeActionMenu.value = null
  activeButtonElement = null
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
}

const handleGlobalClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!activeActionMenu.value) return
  if (target.closest('.action-menu-container') || target.closest('.fixed.z-[9999]')) return
  closeActionMenu()
}

const fetchTenants = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

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

const showExtendModal = (tenant: Tenant) => {
  selectedTenant.value = tenant
  showExtendModalVisible.value = true
}

const extendSubscription = async (months: number) => {
  if (!selectedTenant.value) return

  isLoading.value = true
  try {
    const currentPaidUntil = selectedTenant.value.paid_until ? new Date(selectedTenant.value.paid_until) : new Date()
    const newPaidUntil = new Date(currentPaidUntil)
    newPaidUntil.setMonth(newPaidUntil.getMonth() + months)

    const { error } = await supabase
      .from('tenants')
      .update({
        paid_until: newPaidUntil.toISOString(),
        subscription_status: 'active'
      })
      .eq('id', selectedTenant.value.id)

    if (error) throw error

    showExtendModalVisible.value = false
    alert(`تم تمديد الاشتراك بنجاح لمدة ${months} شهر!`)
    await fetchTenants()
  } catch (error: any) {
    console.error('Extension error:', error)
    alert(error.message || 'حدث خطأ أثناء تمديد الاشتراك')
  } finally {
    isLoading.value = false
    selectedTenant.value = null
  }
}

const activateSubscription = async (tenant: Tenant) => {
  if (!tenant) return
  if (!confirm(`هل أنت متأكد من تفعيل الاشتراك للمستأجر "${tenant.name}"؟`)) return

  isLoading.value = true
  try {
    const { error } = await supabase
      .from('tenants')
      .update({
        subscription_status: 'active',
        is_trial: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenant.id)

    if (error) throw error
    alert('تم تفعيل الاشتراك بنجاح!')
    await fetchTenants()
  } catch (error: any) {
    console.error('Activation error:', error)
    alert(error.message || 'حدث خطأ أثناء تفعيل الاشتراك')
  } finally {
    isLoading.value = false
  }
}

const toggleTrial = async (tenant: Tenant) => {
  if (!tenant) return
  const newTrialStatus = !tenant.is_trial
  const message = newTrialStatus ? 'تفعيل' : 'إيقاف'

  if (!confirm(`هل أنت متأكد من ${message} الفترة التجريبية للمستأجر "${tenant.name}"؟`)) return

  isLoading.value = true
  try {
    const updateData: any = {
      is_trial: newTrialStatus,
      updated_at: new Date().toISOString()
    }

    if (newTrialStatus) {
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 14)
      updateData.trial_ends_at = trialEndsAt.toISOString()
      updateData.subscription_status = 'trial'
    } else {
      updateData.trial_ends_at = null
      updateData.subscription_status = 'expired'
    }

    const { error } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', tenant.id)

    if (error) throw error
    alert(`تم ${message} الفترة التجريبية بنجاح!`)
    await fetchTenants()
  } catch (error: any) {
    console.error('Trial toggle error:', error)
    alert(error.message || 'حدث خطأ أثناء تغيير حالة الفترة التجريبية')
  } finally {
    isLoading.value = false
  }
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
  document.addEventListener('click', handleGlobalClick)
})
</script>

<style scoped>
thead tr th {
  position: sticky;
  top: 0;
  z-index: 10;
  text-align: center !important;
}
th {
  text-align: center !important;
  vertical-align: middle !important;
}
td {
  text-align: center !important;
  vertical-align: middle !important;
}
.fixed.z-[9999] {
  animation: fadeIn 0.15s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>