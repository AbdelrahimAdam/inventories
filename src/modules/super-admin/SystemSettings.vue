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
          <p v-if="lastUpdateTime" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            آخر تحديث: {{ lastUpdateTime }}
          </p>
        </div>
        <button 
          @click="refreshData" 
          :disabled="isRefreshing" 
          class="px-4 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          <svg v-if="isRefreshing" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span class="hidden xs:inline">{{ isRefreshing ? 'جاري التحديث...' : 'تحديث' }}</span>
          <span class="xs:hidden">{{ isRefreshing ? '...' : '🔄' }}</span>
        </button>
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
    <div v-if="toast.show" class="fixed bottom-20 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-[10000] px-6 py-3 rounded-lg shadow-lg transition-all duration-300" :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
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
import { ref, onMounted, onActivated, onBeforeUnmount } from 'vue'
import { supabase } from '@/services/supabase'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

interface Toast {
  show: boolean
  message: string
  type: 'success' | 'error'
}

// Cache management
let dataLoaded = false
let lastLoadTime = 0
const CACHE_DURATION = 60000
let refreshTimer: ReturnType<typeof setInterval> | null = null
const lastUpdateTime = ref('')
const isRefreshing = ref(false)

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

const fetchSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['trial_days', 'subscription_months'])
    
    if (error) throw error
    
    if (data) {
      data.forEach((item: any) => {
        if (item.key === 'trial_days') {
          settings.value.trialDays = parseInt(item.value) || 14
        } else if (item.key === 'subscription_months') {
          settings.value.subscriptionMonths = parseInt(item.value) || 1
        }
      })
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
  }
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

const ensureDataLoaded = async (force = false) => {
  const now = Date.now()
  const shouldLoad = force || !dataLoaded || (now - lastLoadTime > CACHE_DURATION)
  
  if (!shouldLoad) return
  
  await Promise.all([
    fetchSettings(),
    fetchStats()
  ])
  
  dataLoaded = true
  lastLoadTime = now
  lastUpdateTime.value = new Date().toLocaleString('ar-EG')
}

const refreshData = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await ensureDataLoaded(true)
    showToast('تم تحديث البيانات بنجاح', 'success')
  } catch (error) {
    console.error('Refresh failed:', error)
    showToast('حدث خطأ أثناء التحديث', 'error')
  } finally {
    isRefreshing.value = false
  }
}

const startBackgroundRefresh = () => {
  if (refreshTimer) return
  refreshTimer = setInterval(async () => {
    if (!document.hidden && dataLoaded) {
      try {
        await ensureDataLoaded(false)
      } catch (e) {
        console.warn('Background refresh failed:', e)
      }
    }
  }, 60000)
}

const stopBackgroundRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

const saveTrialDays = async () => {
  isSaving.value = true
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'trial_days',
        value: String(settings.value.trialDays),
        updated_at: new Date().toISOString()
      })
    
    if (error) throw error
    showToast('تم حفظ الفترة التجريبية بنجاح', 'success')
    await ensureDataLoaded(true)
  } catch (error) {
    showToast('حدث خطأ أثناء حفظ الإعداد', 'error')
  } finally {
    isSaving.value = false
  }
}

const saveSubscriptionMonths = async () => {
  isSaving.value = true
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'subscription_months',
        value: String(settings.value.subscriptionMonths),
        updated_at: new Date().toISOString()
      })
    
    if (error) throw error
    showToast('تم حفظ مدة الاشتراك بنجاح', 'success')
    await ensureDataLoaded(true)
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
    
    const tables = ['tenants', 'users', 'items', 'warehouses', 'transactions', 'invoices']
    const exportData: any = {}
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
      
      if (error) throw error
      exportData[table] = data || []
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `system_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    showToast('تم تصدير البيانات بنجاح', 'success')
  } catch (error) {
    console.error('Export error:', error)
    showToast('حدث خطأ أثناء تصدير البيانات', 'error')
  }
}

const confirmSystemReset = async () => {
  if (!confirm('⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه. هل أنت متأكد من إعادة ضبط النظام؟')) return
  if (!confirm('تأكيد نهائي: هل أنت متأكد تماماً؟')) return
  
  try {
    showToast('جاري إعادة ضبط النظام...', 'success')
    
    const { error } = await supabase.rpc('reset_system')
    
    if (error) throw error
    
    showToast('تم إعادة ضبط النظام بنجاح', 'success')
    await ensureDataLoaded(true)
  } catch (error) {
    console.error('Reset error:', error)
    showToast('حدث خطأ أثناء إعادة ضبط النظام', 'error')
  }
}

onMounted(async () => {
  await ensureDataLoaded(false)
  startBackgroundRefresh()
})

onActivated(async () => {
  const now = Date.now()
  if (!dataLoaded || (now - lastLoadTime > CACHE_DURATION)) {
    await ensureDataLoaded(false)
  }
})

onBeforeUnmount(() => {
  stopBackgroundRefresh()
  if (toastTimeout) clearTimeout(toastTimeout)
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (min-width: 480px) {
  .xs\:inline { display: inline; }
  .xs\:hidden { display: none; }
}

@media (max-width: 640px) {
  button, 
  [role="button"] {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  
  input, select {
    font-size: 16px !important;
  }
}
</style>