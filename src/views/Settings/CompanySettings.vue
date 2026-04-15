<!-- src/views/Settings/CompanySettings.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">إعدادات الشركة</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">إدارة معلومات شركتك التي ستظهر على الفواتير والتقارير</p>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mb-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-green-800 dark:text-green-300">{{ successMessage }}</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-800 dark:text-red-300">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Main Form -->
      <form @submit.prevent="saveSettings" class="space-y-6">
        <!-- Company Basic Information -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-amber-600 to-green-600 px-4 sm:px-6 py-3 sm:py-4">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h2 class="text-lg sm:text-xl font-bold text-white">معلومات الشركة الأساسية</h2>
            </div>
          </div>
          
          <div class="p-4 sm:p-6 space-y-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                اسم الشركة <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.companyName"
                type="text"
                required
                class="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="مثال: شركة عطور الأصيل للتجارة"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">الاسم الرسمي للشركة كما سيظهر على الفواتير</p>
            </div>
          </div>
        </div>

        <!-- Invoice Information -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 class="text-lg sm:text-xl font-bold text-white">معلومات الفواتير</h2>
            </div>
            <p class="text-blue-100 text-xs sm:text-sm mt-1">هذه المعلومات ستظهر تلقائياً على جميع فواتيرك</p>
          </div>
          
          <div class="p-4 sm:p-6 space-y-4">
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4 mb-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-sm text-yellow-800 dark:text-yellow-300">
                  <p class="font-semibold mb-1">📝 ملاحظة مهمة:</p>
                  <p>هذه البيانات ستظهر في أعلى وأسفل كل فاتورة. تأكد من دقتها لتجنب مشاكل قانونية أو محاسبية.</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                  الرقم الضريبي
                </label>
                <input
                  v-model="form.taxNumber"
                  type="text"
                  class="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="مثال: 123-456-789"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">رقم التسجيل الضريبي للشركة</p>
              </div>

              <div>
                <label class="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                  هاتف الشركة
                </label>
                <input
                  v-model="form.companyPhone"
                  type="tel"
                  class="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="مثال: 01234567890"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">رقم الهاتف الرئيسي للشركة</p>
              </div>

              <div>
                <label class="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                  البريد الإلكتروني للشركة
                </label>
                <input
                  v-model="form.companyEmail"
                  type="email"
                  class="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="مثال: info@company.com"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">البريد الإلكتروني الرسمي للشركة</p>
              </div>

              <div class="md:col-span-2">
                <label class="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                  عنوان الشركة
                </label>
                <textarea
                  v-model="form.companyAddress"
                  rows="3"
                  class="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="مثال: مصر - القاهرة - مدينة نصر - شارع التسعين - مبنى 15"
                ></textarea>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">العنوان الكامل للشركة (سطر واحد أو عدة أسطر)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-3 sm:py-4">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <h2 class="text-lg sm:text-xl font-bold text-white">معاينة الفاتورة</h2>
            </div>
            <p class="text-purple-100 text-xs sm:text-sm mt-1">كيف ستبدو معلومات شركتك على الفواتير</p>
          </div>
          
          <div class="p-4 sm:p-6">
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50">
              <div class="text-center mb-4">
                <div class="inline-block p-2 sm:p-3 rounded-full bg-gradient-to-r from-amber-600 to-green-600 mb-2 sm:mb-3">
                  <svg class="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">{{ form.companyName || 'اسم الشركة' }}</h3>
                <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">فاتورة ضريبية</p>
              </div>

              <div class="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4 mt-3 sm:mt-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div class="text-right">
                    <p class="font-semibold text-gray-700 dark:text-gray-300">السجل الضريبي:</p>
                    <p class="text-gray-600 dark:text-gray-400">{{ form.taxNumber || '—' }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-gray-700 dark:text-gray-300">هاتف:</p>
                    <p class="text-gray-600 dark:text-gray-400">{{ form.companyPhone || '—' }}</p>
                  </div>
                  <div class="sm:col-span-2 text-right">
                    <p class="font-semibold text-gray-700 dark:text-gray-300">العنوان:</p>
                    <p class="text-gray-600 dark:text-gray-400">{{ form.companyAddress || '—' }}</p>
                  </div>
                  <div class="sm:col-span-2 text-right">
                    <p class="font-semibold text-gray-700 dark:text-gray-300">البريد الإلكتروني:</p>
                    <p class="text-gray-600 dark:text-gray-400">{{ form.companyEmail || '—' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            @click="resetForm"
            class="px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            إلغاء التغييرات
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-amber-600 to-green-600 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري الحفظ...
            </span>
            <span v-else>حفظ الإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const router = useRouter()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = reactive({
  companyName: '',
  taxNumber: '',
  companyPhone: '',
  companyEmail: '',
  companyAddress: ''
})

const originalForm = reactive({ ...form })

// Load current company settings
const loadCompanySettings = async () => {
  try {
    const tenantId = authStore.currentTenantId
    
    if (!tenantId) {
      throw new Error('لم يتم العثور على معرف الشركة')
    }
    
    const { data, error } = await supabase
      .from('tenants')
      .select('name, settings')
      .eq('id', tenantId)
      .single()
    
    if (error) throw error
    
    const settings = data?.settings || {}
    
    form.companyName = data?.name || ''
    form.taxNumber = settings?.tax_number || settings?.taxNumber || ''
    form.companyPhone = settings?.phone || settings?.company_phone || ''
    form.companyEmail = settings?.email || settings?.company_email || ''
    form.companyAddress = settings?.address || settings?.company_address || ''
    
    // Store original values for reset
    Object.assign(originalForm, form)
    
  } catch (error: any) {
    console.error('Error loading company settings:', error)
    errorMessage.value = 'فشل تحميل إعدادات الشركة. يرجى المحاولة مرة أخرى.'
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
  }
}

// Save company settings
const saveSettings = async () => {
  if (!form.companyName.trim()) {
    errorMessage.value = 'اسم الشركة مطلوب'
    setTimeout(() => { errorMessage.value = '' }, 3000)
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const tenantId = authStore.currentTenantId
    
    if (!tenantId) {
      throw new Error('لم يتم العثور على معرف الشركة')
    }
    
    // Prepare settings object
    const settings = {
      tax_number: form.taxNumber || null,
      company_phone: form.companyPhone || null,
      company_email: form.companyEmail || null,
      company_address: form.companyAddress || null,
      // Keep old field names for backward compatibility
      taxNumber: form.taxNumber || null,
      phone: form.companyPhone || null,
      email: form.companyEmail || null,
      address: form.companyAddress || null
    }
    
    // Update tenant name and settings
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        name: form.companyName,
        settings: settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenantId)
    
    if (updateError) throw updateError
    
    // Update the auth store with new company name
    if (authStore.user) {
      await supabase.auth.updateUser({
        data: {
          company_name: form.companyName
        }
      })
    }
    
    successMessage.value = 'تم حفظ إعدادات الشركة بنجاح!'
    Object.assign(originalForm, form)
    
    // Refresh tenant data in auth store by re-fetching user session
    await authStore.checkAuth()
    
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
  } catch (error: any) {
    console.error('Error saving company settings:', error)
    errorMessage.value = error.message || 'فشل حفظ الإعدادات. يرجى المحاولة مرة أخرى.'
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
  } finally {
    isLoading.value = false
  }
}

// Reset form to original values
const resetForm = () => {
  Object.assign(form, originalForm)
  successMessage.value = ''
  errorMessage.value = ''
}

// Check if user has permission to edit settings
const checkPermission = () => {
  if (!authStore.canEdit) {
    errorMessage.value = 'ليس لديك صلاحية لتعديل إعدادات الشركة'
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }
}

onMounted(() => {
  checkPermission()
  loadCompanySettings()
})
</script>

<style scoped>
/* RTL Support */
[dir="rtl"] .text-left {
  text-align: right;
}

[dir="rtl"] .text-right {
  text-align: left;
}

/* Animation for success/error messages */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-green-50, .bg-red-50 {
  animation: slideIn 0.3s ease-out;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .bg-white, .dark\:bg-gray-800 {
    border-radius: 0.75rem;
  }
  
  .px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .p-6 {
    padding: 1rem;
  }
}

/* Dark mode transitions */
* {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
</style>