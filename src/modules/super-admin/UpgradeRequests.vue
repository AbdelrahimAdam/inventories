<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="container mx-auto px-4 py-4 md:py-8 pb-20 md:pb-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            طلبات الترقية
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">إدارة طلبات ترقية حسابات المستخدمين</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-semibold">
            {{ pendingRequests.length }} طلب معلق
          </span>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">في انتظار الموافقة</p>
          <p class="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">{{ pendingRequests.length }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">تمت الموافقة</p>
          <p class="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{{ approvedCount }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">مرفوضة</p>
          <p class="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">{{ rejectedCount }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <p class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">إجمالي الطلبات</p>
          <p class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{{ totalRequests }}</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button 
          @click="filterStatus = 'all'"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="filterStatus === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'"
        >
          الكل
        </button>
        <button 
          @click="filterStatus = 'pending'"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'"
        >
          معلق
        </button>
        <button 
          @click="filterStatus = 'approved'"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="filterStatus === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'"
        >
          تمت الموافقة
        </button>
        <button 
          @click="filterStatus = 'rejected'"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="filterStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'"
        >
          مرفوض
        </button>
      </div>

      <!-- Requests List -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-purple-700 to-purple-800 sticky top-0 z-10">
              <tr>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">المستخدم</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">المستأجر</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">تاريخ الطلب</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">الأيام المتبقية</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">الحالة</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="request in filteredRequests" :key="request.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div class="text-right">
                      <p class="font-medium text-gray-900 dark:text-white text-sm">{{ request.user_name }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ request.user_email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-center text-gray-600 dark:text-gray-400 text-sm">{{ request.tenant_name }}</td>
                <td class="px-4 py-3 text-center text-gray-600 dark:text-gray-400 text-sm">{{ formatDate(request.requested_at) }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="text-amber-600 dark:text-amber-400 font-semibold">{{ request.days_left_in_trial }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span :class="getStatusBadge(request.status)" class="px-2 py-1 text-xs rounded-full">
                    {{ formatStatus(request.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <div v-if="request.status === 'pending'" class="flex gap-2 justify-center">
                    <button @click="approveRequest(request)" class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs transition-colors flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      قبول
                    </button>
                    <button @click="rejectRequest(request)" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs transition-colors flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      رفض
                    </button>
                  </div>
                  <span v-else class="text-xs text-gray-500 dark:text-gray-400">—</span>
                </td>
              </tr>
              <tr v-if="filteredRequests.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-lg font-medium">لا توجد طلبات</p>
                  <p class="text-sm">جميع الطلبات تم معالجتها</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          <div v-for="request in filteredRequests" :key="request.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">{{ request.user_name }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ request.user_email }}</p>
                </div>
              </div>
              <span :class="getStatusBadge(request.status)" class="px-2 py-1 text-xs rounded-full">
                {{ formatStatus(request.status) }}
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span class="text-gray-500 dark:text-gray-400 text-xs">المستأجر</span>
                <p class="font-medium text-gray-900 dark:text-white">{{ request.tenant_name }}</p>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400 text-xs">تاريخ الطلب</span>
                <p class="font-medium text-gray-900 dark:text-white">{{ formatDate(request.requested_at) }}</p>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400 text-xs">الأيام المتبقية</span>
                <p class="font-medium text-amber-600 dark:text-amber-400">{{ request.days_left_in_trial }}</p>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400 text-xs">عدد الأصناف</span>
                <p class="font-medium text-gray-900 dark:text-white">{{ request.item_count || 0 }}</p>
              </div>
            </div>

            <div v-if="request.user_message" class="mt-2 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-sm">
              <span class="font-medium">ملاحظات:</span> {{ request.user_message }}
            </div>

            <div v-if="request.status === 'pending'" class="flex gap-2 mt-3">
              <button @click="approveRequest(request)" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                قبول وترقية
              </button>
              <button @click="rejectRequest(request)" class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                رفض
              </button>
            </div>
          </div>
          <div v-if="filteredRequests.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
            لا توجد طلبات مطابقة
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toast.show" class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[10000] px-6 py-3 rounded-lg shadow-lg transition-all duration-300" :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
      <div class="flex items-center gap-3">
        <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

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

interface Toast {
  show: boolean
  message: string
  type: 'success' | 'error'
}

const requests = ref<UpgradeRequest[]>([])
const isLoading = ref(false)
const filterStatus = ref('all')

const toast = ref<Toast>({
  show: false,
  message: '',
  type: 'success'
})

let toastTimeout: ReturnType<typeof setTimeout> | null = null

const pendingRequests = computed(() => requests.value.filter(r => r.status === 'pending'))
const approvedCount = computed(() => requests.value.filter(r => r.status === 'approved').length)
const rejectedCount = computed(() => requests.value.filter(r => r.status === 'rejected').length)
const totalRequests = computed(() => requests.value.length)

const filteredRequests = computed(() => {
  if (filterStatus.value === 'all') return requests.value
  return requests.value.filter(r => r.status === filterStatus.value)
})

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (toastTimeout) clearTimeout(toastTimeout)
  toast.value = { show: true, message, type }
  toastTimeout = setTimeout(() => {
    toast.value.show = false
  }, 4000)
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusBadge = (status: string): string => {
  if (status === 'pending') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
  if (status === 'approved') return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
  if (status === 'rejected') return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
}

const formatStatus = (status: string): string => {
  if (status === 'pending') return 'معلق'
  if (status === 'approved') return 'مقبول'
  if (status === 'rejected') return 'مرفوض'
  return status
}

const fetchRequests = async () => {
  isLoading.value = true
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
      .order('requested_at', { ascending: false })
    
    if (error) throw error
    
    requests.value = (data || []).map((item: any) => {
      let daysLeft = 0
      if (item.users?.trial_ends_at) {
        const endDate = new Date(item.users.trial_ends_at)
        daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      }
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
        item_count: 0,
        days_left_in_trial: daysLeft,
      }
    })
  } catch (error) {
    console.error('Error fetching requests:', error)
    showToast('حدث خطأ أثناء جلب الطلبات', 'error')
  } finally {
    isLoading.value = false
  }
}

const approveRequest = async (request: UpgradeRequest) => {
  if (!confirm(`هل أنت متأكد من قبول طلب ترقية المستخدم "${request.user_name}"؟\n⚠️ تأكد من استلام الدفع أولاً.`)) return
  
  const adminNotes = prompt('أضف ملاحظات (اختياري):')
  if (adminNotes === null) return
  
  try {
    const { data, error } = await supabase.rpc('approve_upgrade_request', {
      data: {
        request_id: request.id,
        admin_notes: adminNotes || null
      }
    })
    
    if (error) {
      console.error('RPC Error:', error)
      showToast(`خطأ في قاعدة البيانات: ${error.message}`, 'error')
      return
    }
    
    if (data?.success) {
      showToast(data.message, 'success')
      await fetchRequests()
    } else {
      showToast(data?.message || 'حدث خطأ أثناء قبول الطلب', 'error')
    }
  } catch (error: any) {
    console.error('Approval error:', error)
    showToast(`خطأ غير متوقع: ${error.message}`, 'error')
  }
}

const rejectRequest = async (request: UpgradeRequest) => {
  if (!confirm(`هل أنت متأكد من رفض طلب ترقية المستخدم "${request.user_name}"؟`)) return
  
  const adminNotes = prompt('سبب الرفض (اختياري):')
  if (adminNotes === null) return
  
  try {
    const { data, error } = await supabase.rpc('reject_upgrade_request', {
      data: {
        request_id: request.id,
        admin_notes: adminNotes || null
      }
    })
    
    if (error) {
      console.error('RPC Error:', error)
      showToast(`خطأ في قاعدة البيانات: ${error.message}`, 'error')
      return
    }
    
    if (data?.success) {
      showToast(data.message, 'success')
      await fetchRequests()
    } else {
      showToast(data?.message || 'حدث خطأ أثناء رفض الطلب', 'error')
    }
  } catch (error: any) {
    console.error('Rejection error:', error)
    showToast(`خطأ غير متوقع: ${error.message}`, 'error')
  }
}

onMounted(() => {
  fetchRequests()
})
</script>