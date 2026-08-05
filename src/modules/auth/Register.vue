<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-200 to-green-100 py-12 px-4 sm:px-6 lg:px-8 relative" :dir="languageStore.direction">
    <!-- Back Arrow -->
    <router-link 
      to="/landing" 
      class="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-600 hover:text-amber-600 transition-colors duration-200 p-2 rounded-full hover:bg-white/50"
      :aria-label="isRTL ? 'العودة إلى الصفحة الرئيسية' : 'Back to homepage'"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12H3M3 12L10 5M3 12L10 19" />
      </svg>
    </router-link>

    <div class="bg-white border border-amber-100 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl relative">
      <!-- Logo & Header -->
      <div class="text-center mb-6 sm:mb-8">
        <div class="flex justify-center mb-4">
          <router-link to="/landing" class="logo-wrapper hover:scale-105 transition-transform duration-300">
            <img 
              src="/icon-source.png" 
              alt="P.commerce Logo" 
              class="logo-image"
              @error="handleImageError"
            />
          </router-link>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-amber-600 to-green-600 bg-clip-text text-transparent">
          P.commerce
        </h1>
        <p class="text-gray-500 mt-2 text-sm sm:text-base">
          {{ isRTL ? 'ابدأ تجربتك المجانية – 14 يوماً بصلاحيات كاملة' : 'Start your free trial – 14 days with full permissions' }}
        </p>
      </div>

      <form class="mt-6 sm:mt-8 space-y-4 sm:space-y-6" @submit.prevent="handleSubmit">
        <!-- Company Basic Information -->
        <div class="bg-amber-50 rounded-xl p-3 sm:p-4 border border-amber-200">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h2 class="text-base sm:text-lg font-bold text-gray-800">
              {{ isRTL ? 'البيانات الأساسية للشركة' : 'Company Basic Information' }}
            </h2>
          </div>

          <div class="mb-3 sm:mb-4">
            <label class="block text-gray-700 text-sm font-semibold mb-2">
              {{ isRTL ? 'اسم الشركة' : 'Company Name' }} <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.companyName"
              type="text"
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              :class="[isRTL ? 'text-right' : 'text-left', { 'border-red-500': errors.companyName }]"
              :placeholder="isRTL ? 'أدخل اسم الشركة' : 'Enter company name'"
            />
            <p v-if="errors.companyName" class="text-red-500 text-xs mt-1">{{ errors.companyName }}</p>
          </div>
        </div>

        <!-- Account Information -->
        <div class="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h2 class="text-base sm:text-lg font-bold text-gray-800">
              {{ isRTL ? 'بيانات الحساب' : 'Account Information' }}
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label class="block text-gray-700 text-sm font-semibold mb-2">
                {{ isRTL ? 'الاسم الكامل' : 'Full Name' }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                :class="[isRTL ? 'text-right' : 'text-left', { 'border-red-500': errors.name }]"
                :placeholder="isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'"
              />
              <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
            </div>
            <div>
              <label class="block text-gray-700 text-sm font-semibold mb-2">
                {{ isRTL ? 'رقم الهاتف' : 'Phone Number' }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.phone"
                type="tel"
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                :class="[isRTL ? 'text-right' : 'text-left', { 'border-red-500': errors.phone }]"
                :placeholder="isRTL ? '05XXXXXXXX' : '05XXXXXXXX'"
              />
              <p v-if="errors.phone" class="text-red-500 text-xs mt-1">{{ errors.phone }}</p>
            </div>
            <div>
              <label class="block text-gray-700 text-sm font-semibold mb-2">
                {{ isRTL ? 'البريد الإلكتروني' : 'Email Address' }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                :class="[isRTL ? 'text-right' : 'text-left', { 'border-red-500': errors.email }]"
                :placeholder="isRTL ? 'example@company.com' : 'example@company.com'"
                dir="ltr"
              />
              <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
            </div>
            <div>
              <label class="block text-gray-700 text-sm font-semibold mb-2">
                {{ isRTL ? 'كلمة المرور' : 'Password' }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  :class="[isRTL ? 'text-right' : 'text-left', { 'border-red-500': errors.password }]"
                  :placeholder="isRTL ? '••••••••' : '••••••••'"
                  dir="ltr"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute top-2.5 text-gray-500 hover:text-amber-700 text-sm font-medium"
                  :class="isRTL ? 'left-3' : 'right-3'"
                >
                  {{ showPassword ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'إظهار' : 'Show') }}
                </button>
              </div>
              <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
              <p class="text-xs text-gray-500 mt-1">
                {{ isRTL ? '6 أحرف على الأقل' : 'At least 6 characters' }}
              </p>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-gray-700 text-sm font-semibold mb-2">
                {{ isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password' }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                :class="[isRTL ? 'text-right' : 'text-left', { 'border-red-500': errors.confirmPassword }]"
                :placeholder="isRTL ? '••••••••' : '••••••••'"
                dir="ltr"
              />
              <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">{{ errors.confirmPassword }}</p>
            </div>
          </div>
        </div>

        <!-- Terms & Conditions -->
        <div class="flex items-start gap-2">
          <input 
            type="checkbox" 
            v-model="agreeTerms" 
            class="mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500 w-4 h-4 flex-shrink-0"
          />
          <span class="text-sm text-gray-600">
            {{ isRTL ? 'أوافق على' : 'I agree to the' }} 
            <a href="#" class="text-amber-600 hover:underline">{{ isRTL ? 'الشروط والأحكام' : 'Terms & Conditions' }}</a> 
            {{ isRTL ? 'و' : 'and' }}
            <a href="#" class="text-amber-600 hover:underline">{{ isRTL ? 'سياسة الخصوصية' : 'Privacy Policy' }}</a>
          </span>
        </div>

        <!-- Error / Success Messages -->
        <div v-if="errorMessage" class="rounded-lg bg-red-50 p-3 sm:p-4 border border-red-200">
          <div class="flex items-start gap-2">
            <svg class="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-red-700">{{ errorMessage }}</p>
          </div>
        </div>

        <div v-if="successMessage" class="rounded-lg bg-green-50 p-3 sm:p-4 border border-green-200">
          <div class="flex items-start gap-2">
            <svg class="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-green-700">{{ successMessage }}</p>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading || !agreeTerms"
          class="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-amber-600 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-amber-700 hover:to-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-base"
        >
          <svg v-if="isLoading" class="animate-spin h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span>{{ isLoading ? (isRTL ? 'جاري إنشاء الحساب...' : 'Creating account...') : (isRTL ? 'ابدأ التجربة المجانية' : 'Start Free Trial') }}</span>
        </button>

        <!-- Navigation Links -->
        <div class="text-center space-y-2">
          <p class="text-sm text-gray-500">
            {{ isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?' }}
            <router-link to="/login" class="text-amber-600 hover:text-amber-700 font-medium">
              {{ isRTL ? 'تسجيل الدخول' : 'Login' }}
            </router-link>
          </p>
          <p class="text-sm text-gray-500">
            <router-link to="/landing" class="text-green-600 hover:text-green-700 font-medium">
              {{ isRTL ? '← تعرف على نظام P.commerce' : '← Learn about P.commerce' }}
            </router-link>
          </p>
        </div>

        <div class="text-center text-xs text-gray-400">
          {{ isRTL ? 'نسخة تجريبية مجانية – 14 يوماً، صلاحيات مدير كاملة' : 'Free trial – 14 days, full manager permissions' }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import { useLanguageStore } from '@/stores/language'

const router = useRouter()
const languageStore = useLanguageStore()

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showPassword = ref(false)
const agreeTerms = ref(false)

const isRTL = computed(() => languageStore.direction === 'rtl')

const form = reactive({
  companyName: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  companyName: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const validateForm = (): boolean => {
  let isValid = true
  
  if (!form.companyName.trim()) {
    errors.companyName = isRTL.value ? 'اسم الشركة مطلوب' : 'Company name is required'
    isValid = false
  } else {
    errors.companyName = ''
  }
  
  if (!form.name.trim()) {
    errors.name = isRTL.value ? 'الاسم مطلوب' : 'Name is required'
    isValid = false
  } else if (form.name.length < 2) {
    errors.name = isRTL.value ? 'الاسم يجب أن يكون حرفين على الأقل' : 'Name must be at least 2 characters'
    isValid = false
  } else {
    errors.name = ''
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email) {
    errors.email = isRTL.value ? 'البريد الإلكتروني مطلوب' : 'Email is required'
    isValid = false
  } else if (!emailRegex.test(form.email)) {
    errors.email = isRTL.value ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email'
    isValid = false
  } else {
    errors.email = ''
  }
  
  if (!form.phone) {
    errors.phone = isRTL.value ? 'رقم الهاتف مطلوب' : 'Phone number is required'
    isValid = false
  } else {
    errors.phone = ''
  }
  
  if (!form.password) {
    errors.password = isRTL.value ? 'كلمة المرور مطلوبة' : 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = isRTL.value ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'
    isValid = false
  } else {
    errors.password = ''
  }
  
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = isRTL.value ? 'كلمة المرور وتأكيدها غير متطابقين' : 'Passwords do not match'
    isValid = false
  } else {
    errors.confirmPassword = ''
  }
  
  return isValid
}

const generateUniqueSlug = (): string => {
  const randomPart = Math.random().toString(36).substring(2, 10)
  const timePart = Date.now().toString(36)
  return `${randomPart}-${timePart}`
}

async function handleSubmit() {
  if (!validateForm()) return
  if (!agreeTerms.value) {
    errorMessage.value = isRTL.value ? 'يرجى الموافقة على الشروط والأحكام' : 'Please agree to the terms and conditions'
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const tenantId = crypto.randomUUID()
    const slug = generateUniqueSlug()
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)
    
    const settings = {}
    
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          phone: form.phone,
          company_name: form.companyName,
        }
      }
    })
    
    if (signUpError) throw signUpError
    if (!authData.user) throw new Error('Failed to create user account')
    
    const { error: tenantError } = await supabase
      .from('tenants')
      .insert({
        id: tenantId,
        name: form.companyName,
        slug: slug,
        settings: settings,
        is_trial: true,
        trial_ends_at: trialEndsAt.toISOString(),
        is_trial_expired: false,
        created_at: new Date().toISOString(),
        subscription_status: 'trial',
      })
    
    if (tenantError) {
      console.error('Tenant creation error:', tenantError)
      await supabase.auth.signOut()
      throw new Error(tenantError.message)
    }
    
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: 'company_manager',
        tenant_id: tenantId,
        allowed_warehouses: [],
        allowed_dispatch_warehouses: [],
        is_active: true,
        is_trial: true,
        trial_ends_at: trialEndsAt.toISOString(),
        created_at: new Date().toISOString(),
      })
    
    if (profileError) {
      console.error('Profile creation error:', profileError)
      await supabase.from('tenants').delete().eq('id', tenantId)
      await supabase.auth.signOut()
      throw new Error(profileError.message)
    }
    
    successMessage.value = isRTL.value 
      ? '🎉 تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول والبدء في استخدام النظام لمدة 14 يوماً مجاناً.'
      : '🎉 Your account has been created! You can now login and start using the system for 14 days free.'
    await supabase.auth.signOut()
    
    setTimeout(() => {
      router.push('/login')
    }, 3000)
    
  } catch (err: any) {
    console.error('Registration error:', err)
    
    if (err.message.includes('already registered')) {
      errorMessage.value = isRTL.value ? 'هذا البريد الإلكتروني مسجل بالفعل' : 'This email is already registered'
    } else if (err.message.includes('password')) {
      errorMessage.value = isRTL.value ? 'كلمة المرور ضعيفة جداً' : 'Password is too weak'
    } else {
      errorMessage.value = err.message || (isRTL.value ? 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى' : 'Failed to create account. Please try again.')
    }
  } finally {
    isLoading.value = false
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%23d4a574" stroke-width="2"%3E%3Cpath d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"%3E%3C/path%3E%3C/svg%3E'
}
</script>

<style scoped>
.logo-wrapper {
  display: inline-block;
  border-radius: 100%;
  background: linear-gradient(135deg, #d4a574 0%, #86b386 100%);
  padding: 4px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.logo-wrapper:hover {
  transform: scale(1.05);
}

.logo-image {
  width: 80px;
  height: 80px;
  border-radius: 100%;
  object-fit: cover;
  display: block;
  background: white;
}

.bg-white {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 40px -12px rgba(0, 0, 0, 0.25);
}

input {
  padding-right: 1rem;
  padding-left: 1rem;
}

input[dir="ltr"] {
  text-align: left;
}

input[dir="rtl"] {
  text-align: right;
}

.absolute.left-3 {
  left: 0.75rem;
  right: auto;
}

.absolute.right-3 {
  right: 0.75rem;
  left: auto;
}

input[type="checkbox"] {
  margin-right: 0;
}

[dir="rtl"] input[type="checkbox"] {
  margin-left: 0.5rem;
  margin-right: 0;
}

[dir="ltr"] input[type="checkbox"] {
  margin-right: 0.5rem;
  margin-left: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@media (max-width: 640px) {
  .logo-image {
    width: 60px;
    height: 60px;
  }
  
  .bg-white {
    padding: 1.25rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }

  .absolute.top-4.right-4 {
    top: 0.5rem;
    right: 0.5rem;
  }

  .absolute.top-4.right-4 svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  input {
    font-size: 16px !important;
    padding-top: 0.625rem;
    padding-bottom: 0.625rem;
  }

  .absolute.left-3 {
    top: 0.625rem;
  }
  
  .absolute.right-3 {
    top: 0.625rem;
  }
}

@media (max-width: 768px) {
  button, 
  [role="button"],
  input[type="checkbox"],
  .cursor-pointer {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
}
</style>