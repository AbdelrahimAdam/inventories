<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-6" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">الملف الشخصي</h1>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <!-- Profile Header -->
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-4" :class="languageStore.isRTL ? 'flex-row-reverse' : ''">
          <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
            {{ userInitials }}
          </div>
          <div>
            <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{{ user?.name }}</h2>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">{{ user?.email }}</p>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1">
              <span class="font-medium">الدور:</span> 
              {{ formatRole(user?.role) }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Update Profile Form -->
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">تحديث الملف الشخصي</h3>
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">الاسم</label>
            <input
              type="text"
              v-model="form.name"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              v-model="form.email"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              disabled
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
          </div>
          
          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="cancelChanges"
              class="px-4 py-2 sm:px-6 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm sm:text-base"
            >
              إلغاء
            </button>
            <button
              type="submit"
              :disabled="isLoadingProfile || !isFormDirty"
              class="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <span v-if="isLoadingProfile" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الحفظ...
              </span>
              <span v-else>حفظ التغييرات</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Change Password Section -->
      <div class="p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">تغيير كلمة المرور</h3>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">كلمة المرور الحالية</label>
            <input
              type="password"
              v-model="passwordForm.currentPassword"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">كلمة المرور الجديدة</label>
            <input
              type="password"
              v-model="passwordForm.newPassword"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              minlength="6"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">يجب أن تكون كلمة المرور 6 أحرف على الأقل</p>
          </div>
          
          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              v-model="passwordForm.confirmPassword"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="cancelPasswordChanges"
              class="px-4 py-2 sm:px-6 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm sm:text-base"
            >
              إلغاء
            </button>
            <button
              type="submit"
              :disabled="isLoadingPassword || !isPasswordFormDirty"
              class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <span v-if="isLoadingPassword" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري التغيير...
              </span>
              <span v-else>تغيير كلمة المرور</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success/Error Toast Messages -->
    <div v-if="successMessage" class="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-4 z-50 animate-slide-up">
      <div class="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg shadow-lg">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ successMessage }}</span>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-4 z-50 animate-slide-up">
      <div class="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-lg">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const authStore = useAuthStore()
const languageStore = useLanguageStore()

const isLoadingProfile = ref(false)
const isLoadingPassword = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const originalName = ref('')

const user = computed(() => authStore.user)
const userInitials = computed(() => {
  if (!user.value?.name) return 'م'
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const form = reactive({
  name: '',
  email: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Check if form has unsaved changes
const isFormDirty = computed(() => {
  return form.name !== originalName.value
})

// Check if password form has any input
const isPasswordFormDirty = computed(() => {
  return passwordForm.currentPassword !== '' || 
         passwordForm.newPassword !== '' || 
         passwordForm.confirmPassword !== ''
})

const formatRole = (role: string | undefined) => {
  const roles: Record<string, string> = {
    superadmin: 'مشرف عام',
    company_manager: 'مدير شركة',
    warehouse_manager: 'مدير مستودع',
    viewer: 'عرض فقط',
  }
  return roles[role || ''] || role || 'غير محدد'
}

const showSuccess = (message: string) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const showError = (message: string) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 3000)
}

const updateProfile = async () => {
  if (!form.name.trim()) {
    showError('الاسم مطلوب')
    return
  }

  if (!isFormDirty.value) {
    showError('لا توجد تغييرات لحفظها')
    return
  }

  isLoadingProfile.value = true
  
  try {
    await authStore.updateProfile({ name: form.name })
    originalName.value = form.name
    showSuccess('تم تحديث الملف الشخصي بنجاح!')
  } catch (err: any) {
    showError('خطأ: ' + (err.message || 'حدث خطأ أثناء تحديث الملف الشخصي'))
  } finally {
    isLoadingProfile.value = false
  }
}

const cancelChanges = () => {
  if (user.value) {
    form.name = user.value.name
    originalName.value = user.value.name
    showSuccess('تم إلغاء التغييرات')
  }
}

const changePassword = async () => {
  if (!passwordForm.currentPassword) {
    showError('كلمة المرور الحالية مطلوبة')
    return
  }
  
  if (!passwordForm.newPassword) {
    showError('كلمة المرور الجديدة مطلوبة')
    return
  }
  
  if (passwordForm.newPassword.length < 6) {
    showError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
    return
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showError('كلمة المرور الجديدة وتأكيدها غير متطابقين')
    return
  }

  isLoadingPassword.value = true
  
  try {
    await authStore.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
    showSuccess('تم تغيير كلمة المرور بنجاح!')
    cancelPasswordChanges()
  } catch (err: any) {
    showError('خطأ: ' + (err.message || 'حدث خطأ أثناء تغيير كلمة المرور'))
  } finally {
    isLoadingPassword.value = false
  }
}

const cancelPasswordChanges = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

onMounted(() => {
  if (user.value) {
    form.name = user.value.name
    form.email = user.value.email
    originalName.value = user.value.name
  }
})
</script>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .fixed {
    left: 1rem;
    right: 1rem;
  }
}
</style>