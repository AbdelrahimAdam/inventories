<template>
  <div class="profile-page" :dir="languageStore.isRTL ? 'rtl' : 'ltr'">
    <!-- Header -->
    <div class="profile-header">
      <div>
        <h1 class="profile-title">👤 الملف الشخصي</h1>
        <p class="profile-subtitle">إدارة معلومات حسابك وإعدادات الأمان</p>
      </div>
    </div>

    <!-- Profile Content -->
    <div class="profile-grid">
      <!-- Left Column - Profile Info -->
      <div class="profile-card profile-card--info">
        <!-- Profile Avatar -->
        <div class="profile-avatar-section">
          <div class="profile-avatar">
            <img v-if="profilePhoto" :src="profilePhoto" alt="صورة الملف الشخصي" class="profile-avatar-img" />
            <div v-else class="profile-avatar-placeholder">
              <span class="profile-avatar-text">{{ userInitials }}</span>
            </div>
            <div class="profile-avatar-status" :class="user?.isActive ? 'profile-avatar-status--online' : 'profile-avatar-status--offline'">
              <span class="profile-avatar-status-dot"></span>
            </div>
          </div>
          <div class="profile-avatar-actions">
            <button @click="triggerPhotoUpload" class="btn btn--outline btn--sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              تغيير الصورة
            </button>
            <input ref="photoInput" type="file" accept="image/*" class="hidden" @change="handlePhotoUpload" />
          </div>
        </div>

        <!-- User Info -->
        <div class="profile-user-info">
          <h2 class="profile-user-name">{{ user?.name }}</h2>
          <p class="profile-user-email">{{ user?.email }}</p>
          <div class="profile-user-meta">
            <span class="profile-user-role">
              <span class="profile-user-role-label">الدور:</span>
              <span class="profile-user-role-value">{{ formatRole(user?.role) }}</span>
            </span>
            <span class="profile-user-status" :class="user?.isActive ? 'profile-user-status--active' : 'profile-user-status--inactive'">
              {{ user?.isActive ? 'نشط' : 'غير نشط' }}
            </span>
          </div>
          <div class="profile-user-details">
            <div class="profile-user-detail">
              <span class="profile-user-detail-label">آخر تسجيل دخول</span>
              <span class="profile-user-detail-value">{{ lastLogin || '—' }}</span>
            </div>
            <div class="profile-user-detail">
              <span class="profile-user-detail-label">عضو منذ</span>
              <span class="profile-user-detail-value">{{ memberSince || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Settings -->
      <div class="profile-settings">
        <!-- Update Profile -->
        <div class="settings-card">
          <div class="settings-card-header">
            <div class="settings-card-icon">✏️</div>
            <div>
              <h3 class="settings-card-title">تحديث الملف الشخصي</h3>
              <p class="settings-card-subtitle">تغيير اسمك وعرضه في النظام</p>
            </div>
          </div>

          <form @submit.prevent="updateProfile" class="settings-card-body">
            <div class="form-group">
              <label class="form-label">الاسم</label>
              <input
                type="text"
                v-model="form.name"
                class="form-input"
                required
                placeholder="أدخل اسمك"
              />
            </div>

            <div class="form-group">
              <label class="form-label">البريد الإلكتروني</label>
              <input
                type="email"
                v-model="form.email"
                class="form-input form-input--disabled"
                disabled
              />
              <p class="form-hint">لا يمكن تغيير البريد الإلكتروني. تواصل مع الدعم للمساعدة.</p>
            </div>

            <div class="form-actions">
              <button
                type="button"
                @click="cancelChanges"
                class="btn btn--outline btn--sm"
              >
                إلغاء
              </button>
              <button
                type="submit"
                :disabled="isLoadingProfile || !isFormDirty"
                class="btn btn--primary btn--sm"
              >
                <svg v-if="isLoadingProfile" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoadingProfile ? 'جاري الحفظ...' : 'حفظ التغييرات' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Change Password -->
        <div class="settings-card">
          <div class="settings-card-header">
            <div class="settings-card-icon">🔒</div>
            <div>
              <h3 class="settings-card-title">تغيير كلمة المرور</h3>
              <p class="settings-card-subtitle">تحديث كلمة المرور الخاصة بك</p>
            </div>
          </div>

          <form @submit.prevent="changePassword" class="settings-card-body">
            <div class="form-group">
              <label class="form-label">كلمة المرور الحالية</label>
              <input
                type="password"
                v-model="passwordForm.currentPassword"
                class="form-input"
                required
                placeholder="أدخل كلمة المرور الحالية"
              />
            </div>

            <div class="form-group">
              <label class="form-label">كلمة المرور الجديدة</label>
              <input
                type="password"
                v-model="passwordForm.newPassword"
                class="form-input"
                required
                minlength="6"
                placeholder="أدخل كلمة المرور الجديدة"
              />
              <div class="password-strength" v-if="passwordForm.newPassword">
                <div class="strength-bar" :style="{ width: passwordStrength + '%' }"></div>
                <span class="strength-label">{{ strengthLabel }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">تأكيد كلمة المرور الجديدة</label>
              <input
                type="password"
                v-model="passwordForm.confirmPassword"
                class="form-input"
                required
                placeholder="أعد كتابة كلمة المرور الجديدة"
              />
              <p v-if="passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword" class="form-error">
                كلمة المرور غير متطابقة
              </p>
            </div>

            <div class="form-actions">
              <button
                type="button"
                @click="cancelPasswordChanges"
                class="btn btn--outline btn--sm"
              >
                إلغاء
              </button>
              <button
                type="submit"
                :disabled="isLoadingPassword || !isPasswordFormDirty || passwordForm.newPassword !== passwordForm.confirmPassword"
                class="btn btn--secondary btn--sm"
              >
                <svg v-if="isLoadingPassword" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoadingPassword ? 'جاري التغيير...' : 'تغيير كلمة المرور' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Security Status -->
        <div class="settings-card">
          <div class="settings-card-header">
            <div class="settings-card-icon">🛡️</div>
            <div>
              <h3 class="settings-card-title">حالة الأمان</h3>
              <p class="settings-card-subtitle">نظرة عامة على أمان حسابك</p>
            </div>
          </div>

          <div class="settings-card-body">
            <div class="security-item">
              <div class="security-item-info">
                <span class="security-item-icon">🔑</span>
                <div>
                  <div class="security-item-title">كلمة المرور</div>
                  <div class="security-item-status security-item-status--good">قوية</div>
                </div>
              </div>
              <button @click="scrollToPassword" class="btn btn--outline btn--xs">تغيير</button>
            </div>

            <div class="security-item">
              <div class="security-item-info">
                <span class="security-item-icon">📱</span>
                <div>
                  <div class="security-item-title">المصادقة الثنائية (2FA)</div>
                  <div class="security-item-status" :class="twoFactorEnabled ? 'security-item-status--good' : 'security-item-status--warning'">
                    {{ twoFactorEnabled ? 'مفعلة' : 'غير مفعلة' }}
                  </div>
                </div>
              </div>
              <button @click="toggleTwoFactor" class="btn btn--outline btn--xs">
                {{ twoFactorEnabled ? 'تعطيل' : 'تفعيل' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toastVisible" class="toast" :class="toastType === 'success' ? 'toast--success' : 'toast--error'">
      <svg v-if="toastType === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ toastMessage }}</span>
      <button @click="toastVisible = false" class="toast-close">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
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
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
let toastTimer: ReturnType<typeof setTimeout> | null = null
const originalName = ref('')
const profilePhoto = ref('')
const lastLogin = ref('')
const memberSince = ref('')
const twoFactorEnabled = ref(false)
const photoInput = ref<HTMLInputElement | null>(null)

const user = computed(() => authStore.user)
const userInitials = computed(() => {
  if (!user.value?.name) return 'م'
  const parts = user.value.name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return user.value.name.substring(0, 2).toUpperCase()
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

const passwordStrength = computed(() => {
  const pwd = passwordForm.newPassword
  if (!pwd) return 0
  let strength = 0
  if (pwd.length >= 8) strength += 25
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25
  if (/\d/.test(pwd)) strength += 25
  if (/[^a-zA-Z0-9]/.test(pwd)) strength += 25
  return strength
})

const strengthLabel = computed(() => {
  const s = passwordStrength.value
  if (s === 0) return ''
  if (s <= 25) return 'ضعيفة'
  if (s <= 50) return 'متوسطة'
  if (s <= 75) return 'جيدة'
  return 'قوية جداً'
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

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
  toastTimer = setTimeout(() => {
    toastVisible.value = false
    toastTimer = null
  }, 4000)
}

const updateProfile = async () => {
  if (!form.name.trim()) {
    showToast('الاسم مطلوب', 'error')
    return
  }

  if (!isFormDirty.value) {
    showToast('لا توجد تغييرات لحفظها', 'error')
    return
  }

  isLoadingProfile.value = true
  
  try {
    await authStore.updateProfile({ name: form.name })
    originalName.value = form.name
    showToast('تم تحديث الملف الشخصي بنجاح!', 'success')
  } catch (err: any) {
    showToast(err.message || 'حدث خطأ أثناء تحديث الملف الشخصي', 'error')
  } finally {
    isLoadingProfile.value = false
  }
}

const cancelChanges = () => {
  if (user.value) {
    form.name = user.value.name
    originalName.value = user.value.name
  }
}

const changePassword = async () => {
  if (!passwordForm.currentPassword) {
    showToast('كلمة المرور الحالية مطلوبة', 'error')
    return
  }
  
  if (!passwordForm.newPassword) {
    showToast('كلمة المرور الجديدة مطلوبة', 'error')
    return
  }
  
  if (passwordForm.newPassword.length < 6) {
    showToast('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل', 'error')
    return
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showToast('كلمة المرور الجديدة وتأكيدها غير متطابقين', 'error')
    return
  }

  isLoadingPassword.value = true
  
  try {
    await authStore.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
    showToast('تم تغيير كلمة المرور بنجاح!', 'success')
    cancelPasswordChanges()
  } catch (err: any) {
    showToast(err.message || 'حدث خطأ أثناء تغيير كلمة المرور', 'error')
  } finally {
    isLoadingPassword.value = false
  }
}

const cancelPasswordChanges = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

const triggerPhotoUpload = () => {
  photoInput.value?.click()
}

const handlePhotoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    profilePhoto.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const toggleTwoFactor = () => {
  twoFactorEnabled.value = !twoFactorEnabled.value
  showToast(twoFactorEnabled.value ? 'تم تفعيل المصادقة الثنائية' : 'تم تعطيل المصادقة الثنائية', 'success')
}

const scrollToPassword = () => {
  const passwordCard = document.querySelector('.settings-card .settings-card-header .settings-card-icon + div')
  if (passwordCard) {
    const card = passwordCard.closest('.settings-card')
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

onMounted(() => {
  if (user.value) {
    form.name = user.value.name
    form.email = user.value.email
    originalName.value = user.value.name
    
    if (user.value.lastLogin) {
      lastLogin.value = new Date(user.value.lastLogin).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    if (user.value.createdAt) {
      memberSince.value = new Date(user.value.createdAt).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
})
</script>

<style scoped>
/* ============================================================
   PAGE LAYOUT - Fully relies on App.vue layout
   ============================================================ */
.profile-page {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
}

/* ============================================================
   HEADER
   ============================================================ */
.profile-header {
  margin-bottom: 1.25rem;
}

.profile-title {
  font-size: 1.25rem;
  font-weight: 900;
  color: #111827;
}

.dark .profile-title {
  color: white;
}

@media (min-width: 640px) {
  .profile-title {
    font-size: 1.625rem;
  }
}

.profile-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.dark .profile-subtitle {
  color: #9ca3af;
}

@media (min-width: 640px) {
  .profile-subtitle {
    font-size: 0.875rem;
  }
}

/* ============================================================
   PROFILE GRID
   ============================================================ */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .profile-grid {
    grid-template-columns: 320px 1fr;
    gap: 1.5rem;
  }
}

/* ============================================================
   PROFILE CARD
   ============================================================ */
.profile-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.dark .profile-card {
  background: #1f2937;
  border-color: #374151;
}

.profile-card--info {
  align-self: start;
}

/* ============================================================
   PROFILE AVATAR
   ============================================================ */
.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .profile-avatar-section {
  border-color: #374151;
}

.profile-avatar {
  position: relative;
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  overflow: hidden;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .profile-avatar {
    width: 6rem;
    height: 6rem;
  }
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #d4a574, #b8915a);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

@media (min-width: 640px) {
  .profile-avatar-text {
    font-size: 2rem;
  }
}

.profile-avatar-status {
  position: absolute;
  bottom: 0.25rem;
  right: 0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .profile-avatar-status {
  background: #1f2937;
}

.profile-avatar-status-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
}

.profile-avatar-status--online .profile-avatar-status-dot {
  background: #10b981;
}

.profile-avatar-status--offline .profile-avatar-status-dot {
  background: #6b7280;
}

.profile-avatar-actions {
  margin-top: 0.75rem;
}

/* ============================================================
   PROFILE USER INFO
   ============================================================ */
.profile-user-info {
  padding: 1.25rem;
  text-align: center;
}

.profile-user-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
}

.dark .profile-user-name {
  color: white;
}

.profile-user-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .profile-user-email {
  color: #9ca3af;
}

.profile-user-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.profile-user-role {
  font-size: 0.75rem;
  color: #6b7280;
}

.dark .profile-user-role {
  color: #9ca3af;
}

.profile-user-role-value {
  font-weight: 600;
  color: #1f2937;
}

.dark .profile-user-role-value {
  color: white;
}

.profile-user-status {
  font-size: 0.65rem;
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
  font-weight: 600;
}

.profile-user-status--active {
  background: #d1fae5;
  color: #065f46;
}

.dark .profile-user-status--active {
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
}

.profile-user-status--inactive {
  background: #fecaca;
  color: #991b1b;
}

.dark .profile-user-status--inactive {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.profile-user-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.dark .profile-user-details {
  border-color: #374151;
}

.profile-user-detail {
  text-align: center;
}

.profile-user-detail-label {
  display: block;
  font-size: 0.6rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark .profile-user-detail-label {
  color: #9ca3af;
}

.profile-user-detail-value {
  font-size: 0.75rem;
  font-weight: 500;
  color: #1f2937;
}

.dark .profile-user-detail-value {
  color: white;
}

/* ============================================================
   SETTINGS CARDS
   ============================================================ */
.profile-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settings-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.dark .settings-card {
  background: #1f2937;
  border-color: #374151;
}

.settings-card-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  border-bottom: 1px solid #e5e7eb;
  background: #fef3c7;
}

.dark .settings-card-header {
  border-color: #374151;
  background: #374151;
}

@media (min-width: 640px) {
  .settings-card-header {
    padding: 0.75rem 1.25rem;
    gap: 0.75rem;
  }
}

.settings-card-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.settings-card-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1f2937;
}

.dark .settings-card-title {
  color: white;
}

@media (min-width: 640px) {
  .settings-card-title {
    font-size: 1rem;
  }
}

.settings-card-subtitle {
  font-size: 0.65rem;
  color: #6b7280;
}

.dark .settings-card-subtitle {
  color: #9ca3af;
}

@media (min-width: 640px) {
  .settings-card-subtitle {
    font-size: 0.75rem;
  }
}

.settings-card-body {
  padding: 0.875rem;
}

@media (min-width: 640px) {
  .settings-card-body {
    padding: 1.25rem;
  }
}

/* ============================================================
   FORM ELEMENTS
   ============================================================ */
.form-group {
  margin-bottom: 0.75rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.125rem;
}

.dark .form-label {
  color: #e5e7eb;
}

@media (min-width: 640px) {
  .form-label {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }
}

.form-input {
  width: 100%;
  padding: 0.375rem 0.625rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  color: #1f2937;
  font-size: 0.8125rem;
  transition: all 0.15s;
  min-height: 36px;
}

.dark .form-input {
  background: #374151;
  border-color: #4b5563;
  color: white;
}

@media (min-width: 640px) {
  .form-input {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    min-height: 40px;
  }
}

.form-input:focus {
  outline: none;
  border-color: #d4a574;
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.15);
}

.form-input--disabled {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.dark .form-input--disabled {
  background: #4b5563;
  color: #9ca3af;
}

.form-hint {
  font-size: 0.65rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.dark .form-hint {
  color: #9ca3af;
}

@media (min-width: 640px) {
  .form-hint {
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
}

.form-error {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.dark .form-actions {
  border-color: #374151;
}

@media (min-width: 640px) {
  .form-actions {
    gap: 0.75rem;
    margin-top: 1rem;
    padding-top: 1rem;
  }
}

/* ============================================================
   BUTTONS
   ============================================================ */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-height: 36px;
  white-space: nowrap;
}

@media (min-width: 640px) {
  .btn {
    padding: 0.5rem 1.25rem;
    font-size: 0.875rem;
    min-height: 40px;
  }
}

.btn--xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.65rem;
  min-height: 28px;
}

.btn--sm {
  padding: 0.25rem 0.625rem;
  font-size: 0.65rem;
  min-height: 32px;
}

@media (min-width: 640px) {
  .btn--sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    min-height: 36px;
  }
}

.btn--primary {
  background: linear-gradient(135deg, #d4a574, #b8915a);
  color: white;
  box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
}

.btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #c9a06a, #a8834a);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.4);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--secondary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn--secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn--secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--outline {
  background: transparent;
  color: #1f2937;
  border: 2px solid #e5e7eb;
}

.dark .btn--outline {
  color: white;
  border-color: #4b5563;
}

.btn--outline:hover:not(:disabled) {
  background: #f9fafb;
}

.dark .btn--outline:hover:not(:disabled) {
  background: #374151;
}

/* ============================================================
   PASSWORD STRENGTH
   ============================================================ */
.password-strength {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.strength-bar {
  height: 0.25rem;
  background: linear-gradient(to right, #ef4444, #f59e0b, #10b981);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.strength-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
}

.dark .strength-label {
  color: #9ca3af;
}

/* ============================================================
   SECURITY ITEMS
   ============================================================ */
.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.dark .security-item {
  border-color: #374151;
}

.security-item:last-child {
  border-bottom: none;
}

.security-item-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.security-item-icon {
  font-size: 1rem;
}

.security-item-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: #1f2937;
}

.dark .security-item-title {
  color: white;
}

.security-item-status {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
}

.security-item-status--good {
  background: #d1fae5;
  color: #065f46;
}

.dark .security-item-status--good {
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
}

.security-item-status--warning {
  background: #fef3c7;
  color: #92400e;
}

.dark .security-item-status--warning {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

/* ============================================================
   TOAST
   ============================================================ */
.toast {
  position: fixed;
  bottom: calc(5rem + env(safe-area-inset-bottom, 0px));
  right: 0.75rem;
  left: 0.75rem;
  z-index: 10001;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.625rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  max-width: 28rem;
  animation: slideUp 0.3s ease-out;
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .toast {
    bottom: 1.5rem;
    right: 1.5rem;
    left: auto;
    padding: 0.75rem 1rem;
  }
}

.toast--success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.dark .toast--success {
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
  border-color: rgba(16, 185, 129, 0.3);
}

.toast--error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.dark .toast--error {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}

.toast svg {
  flex-shrink: 0;
}

.toast-close {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.25rem;
  min-height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  transition: background 0.2s;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.05);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================================
   UTILITIES
   ============================================================ */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.hidden {
  display: none;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 640px) {
  .profile-card-body {
    padding: 0.75rem;
  }
  
  .profile-user-details {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .btn {
    width: 100%;
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .security-item .btn {
    width: 100%;
  }
  
  .settings-card-header {
    padding: 0.5rem 0.75rem;
  }
  
  .settings-card-body {
    padding: 0.75rem;
  }
}

/* Touch improvements */
@media (max-width: 768px) {
  input, select, textarea, button {
    font-size: 16px !important;
  }
}
</style>