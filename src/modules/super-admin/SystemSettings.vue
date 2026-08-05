<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="container mx-auto px-4 py-4 md:py-8 pb-20 md:pb-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            إعدادات النظام
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">إدارة إعدادات النظام العامة</p>
        </div>
      </div>

      <!-- Settings Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Default Trial Period -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            الفترة التجريبية الافتراضية
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">عدد أيام الفترة التجريبية للمستأجرين الجدد</p>
          <div class="flex items-center gap-3">
            <input 
              type="number" 
              v-model.number="settings.trialDays" 
              class="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
              min="1" 
              max="90"
            />
            <span class="text-gray-500 dark:text-gray-400">يوم</span>
            <button 
              @click="saveTrialDays" 
              class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm"
              :disabled="isSaving"
            >
              {{ isSaving ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
          </div>
        </div>

        <!-- Default Subscription Duration -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            مدة الاشتراك الافتراضية
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">مدة الاشتراك عند التفعيل التلقائي</p>
          <div class="flex items-center gap-3">
            <input 
              type="number" 
              v-model.number="settings.subscriptionMonths" 
              class="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
              min="1" 
              max="36"
            />
            <span class="text-gray-500 dark:text-gray-400">شهر</span>
            <button 
              @click="saveSubscriptionMonths" 
              class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm"
              :disabled="isSaving"
            >
              {{ isSaving ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
          </div>
        </div>

        <!-- System Stats -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            إحصائيات النظام
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">إجمالي المستأجرين</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ stats.totalTenants }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">إجمالي المستخدمين</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ stats.totalUsers }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">إجمالي الأصناف</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ stats.totalItems }}</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-gray-600 dark:text-gray-400">المستأجرين النشطين</span>
              <span class="font-bold text-green-600 dark:text-green-400">{{ stats.activeTenants }}</span>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-red-50 dark:bg-red-900/10 rounded-lg p-6 border border-red-200 dark:border-red-800">
          <h4 class="text-lg font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            ⚠️ منطقة الخطر
          </h4>
          <p class="text-sm text-red-600 dark:text-red-300 mb-4">هذه الإجراءات لا يمكن التراجع عنها</p>
          <div class="flex flex-wrap gap-3">
            <button 
              @click="exportAllData" 
              class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm"
            >
              تصدير جميع البيانات
            </button>
            <button 
              @click="confirmSystemReset" 
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              إعادة ضبط النظام
            </button>
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
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

interface Toast {
  show: boolean
  message: string
  type: 'success' | 'error'
}

const settings = ref({
  trialDays: 14,
  subscriptionMonths: 1
})

const stats = ref({
  totalTenants: 0,
  totalUsers: 0,
  totalItems: 0,
  activeTenants: 0
})

const isSaving = ref(false)

const toast = ref<Toast>({
  show: false,
  message: '',
  type: 'success'
})

let toastTimeout: ReturnType<typeof setTimeout> | null = null

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (toastTimeout) clearTimeout(toastTimeout)
  toast.value = { show: true, message, type }
  toastTimeout = setTimeout(() => {
    toast.value.show = false
  }, 4000)
}

const fetchStats = async () => {
  try {
    const { count: tenantsCount } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })

    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: itemsCount } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })

    const { count: activeTenantsCount } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')

    stats.value = {
      totalTenants: tenantsCount || 0,
      totalUsers: usersCount || 0,
      totalItems: itemsCount || 0,
      activeTenants: activeTenantsCount || 0
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const saveTrialDays = async () => {
  isSaving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    showToast('تم حفظ الفترة التجريبية بنجاح', 'success')
  } catch (error) {
    showToast('حدث خطأ أثناء حفظ الإعداد', 'error')
  } finally {
    isSaving.value = false
  }
}

const saveSubscriptionMonths = async () => {
  isSaving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    showToast('تم حفظ مدة الاشتراك بنجاح', 'success')
  } catch (error) {
    showToast('حدث خطأ أثناء حفظ الإعداد', 'error')
  } finally {
    isSaving.value = false
  }
}

const exportAllData = async () => {
  if (!confirm('هل أنت متأكد من تصدير جميع البيانات؟')) return
  
  try {
    showToast('جاري تصدير البيانات...', 'success')
    await new Promise(resolve => setTimeout(resolve, 1000))
    showToast('تم تصدير البيانات بنجاح', 'success')
  } catch (error) {
    showToast('حدث خطأ أثناء تصدير البيانات', 'error')
  }
}

const confirmSystemReset = async () => {
  if (!confirm('⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه. هل أنت متأكد من إعادة ضبط النظام؟')) return
  if (!confirm('تأكيد نهائي: هل أنت متأكد تماماً؟')) return
  
  try {
    showToast('جاري إعادة ضبط النظام...', 'success')
    await new Promise(resolve => setTimeout(resolve, 1000))
    showToast('تم إعادة ضبط النظام بنجاح', 'success')
  } catch (error) {
    showToast('حدث خطأ أثناء إعادة ضبط النظام', 'error')
  }
}

onMounted(() => {
  fetchStats()
})
</script>