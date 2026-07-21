<template>
  <div :dir="languageStore.isRTL ? 'rtl' : 'ltr'" class="pb-32 sm:pb-20">
    <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4">الملف الشخصي</h1>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <!-- Profile Header -->
      <div class="p-3 sm:p-4 lg:p-5 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3" :class="languageStore.isRTL ? 'flex-row-reverse' : ''">
          <div class="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-full flex items-center justify-center text-white text-lg sm:text-xl lg:text-2xl font-bold shadow-lg flex-shrink-0">
            {{ userInitials }}
          </div>
          <div>
            <h2 class="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">{{ user?.name }}</h2>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{{ user?.email }}</p>
            <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              <span class="font-medium">الدور:</span> 
              {{ formatRole(user?.role) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Update Profile Form -->
      <div class="p-3 sm:p-4 lg:p-5 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3">تحديث الملف الشخصي</h3>
        <form @submit.prevent="updateProfile" class="space-y-3">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-1">الاسم</label>
            <input
              type="text"
              v-model="form.name"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              v-model="form.email"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              disabled
            />
            <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">لا يمكن تغيير البريد الإلكتروني</p>
          </div>

          <div class="flex justify-end gap-2 pt-1">
            <button
              type="button"
              @click="cancelChanges"
              class="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-xs sm:text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              :disabled="isLoadingProfile || !isFormDirty"
              class="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              <span v-if="isLoadingProfile" class="flex items-center gap-1.5">
                <svg class="animate-spin h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div class="p-3 sm:p-4 lg:p-5">
        <h3 class="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3">تغيير كلمة المرور</h3>
        <form @submit.prevent="changePassword" class="space-y-3">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-1">كلمة المرور الحالية</label>
            <input
              type="password"
              v-model="passwordForm.currentPassword"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-1">كلمة المرور الجديدة</label>
            <input
              type="password"
              v-model="passwordForm.newPassword"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              minlength="6"
            />
            <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">يجب أن تكون 6 أحرف على الأقل</p>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-1">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              v-model="passwordForm.confirmPassword"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div class="flex justify-end gap-2 pt-1">
            <button
              type="button"
              @click="cancelPasswordChanges"
              class="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-xs sm:text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              :disabled="isLoadingPassword || !isPasswordFormDirty"
              class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              <span v-if="isLoadingPassword" class="flex items-center gap-1.5">
                <svg class="animate-spin h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div v-if="successMessage" class="fixed bottom-20 sm:bottom-6 right-3 left-3 sm:left-auto sm:right-4 z-[10001] animate-slide-up max-w-md sm:max-w-sm w-full sm:w-auto">
      <div class="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-2.5 rounded-lg shadow-lg">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm">{{ successMessage }}</span>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="fixed bottom-20 sm:bottom-6 right-3 left-3 sm:left-auto sm:right-4 z-[10001] animate-slide-up max-w-md sm:max-w-sm w-full sm:w-auto">
      <div class="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-2.5 rounded-lg shadow-lg">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm">{{ errorMessage }}</span>
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

const isFormDirty = computed(() => {
  return form.name !== originalName.value
})

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

@media (max-width: 640px) {
  input, select, textarea, button {
    font-size: 16px !important;
  }
}
</style>