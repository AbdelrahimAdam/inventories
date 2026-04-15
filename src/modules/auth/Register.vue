<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-200 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="bg-white border border-amber-100 rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
      <!-- Logo & Header -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <div class="logo-wrapper">
            <img 
              src="/icon-source.png" 
              alt="P.commerce Logo" 
              class="logo-image"
              @error="handleImageError"
            />
          </div>
        </div>
        <h1 class="text-3xl font-extrabold tracking-wide bg-gradient-to-r from-amber-600 to-green-600 bg-clip-text text-transparent">
          P.commerce
        </h1>
        <p class="text-gray-500 mt-2">
          ابدأ تجربتك المجانية لمدة 14 يوماً
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <!-- Company Basic Information Section -->
        <div class="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h2 class="text-lg font-bold text-gray-800">معلومات الشركة الأساسية</h2>
          </div>
          
          <!-- Company Name -->
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-semibold mb-2">اسم الشركة <span class="text-red-500">*</span></label>
            <input
              v-model="form.companyName"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              placeholder="مثال: شركة عطور الأصيل للتجارة"
              :class="{ 'border-red-500': errors.companyName }"
            />
            <p v-if="errors.companyName" class="text-red-500 text-xs mt-1">{{ errors.companyName }}</p>
          </div>
        </div>

        <!-- Company Invoice Information Section (Optional) -->
        <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 class="text-lg font-bold text-gray-800">معلومات الفواتير (اختيارية)</h2>
          </div>
          
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div class="flex items-start gap-2">
              <svg class="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-yellow-800">
                <strong>📝 ملاحظة مهمة:</strong> هذه المعلومات ستظهر تلقائياً على جميع فواتيرك المستقبلية. 
                ننصحك بتعبئتها الآن لتجنب تعديلها لاحقاً في إعدادات الشركة.
              </p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Tax Number -->
            <div>
              <label class="block text-gray-700 text-sm font-semibold mb-2">الرقم الضريبي</label>
              <input
                v-model="form.taxNumber"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="مثال: 123-456-789"
              />
              <p class="text-xs text-gray-500 mt-1">رقم السجل الضريبي للشركة</p>
            </div>

            <!-- Company Phone -->
            <div>
              <label class="block text-gray-700 text-sm font-semibold mb-2">هاتف الشركة</label>
              <input
                v-model="form.companyPhone"
                type="tel"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="مثال: 01234567890"
              />
              <p class="text-xs text-gray-500 mt-1">رقم هاتف الشركة الرئيسي</p>
            </div>

            <!-- Company Email -->
            <div>
              <label class="block text-gray-700 text-sm font-semibold mb-2">البريد الإلكتروني للشركة</label>
              <input
                v-model="form.companyEmail"
                type="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="مثال: info@company.com"
              />
              <p class="text-xs text-gray-500 mt-1">البريد الإلكتروني الرسمي للشركة</p>
            </div>

            <!-- Company Address -->
            <div class="md:col-span-2">
              <label class="block text-gray-700 text-sm font-semibold mb-2">عنوان الشركة</label>
              <input
                v-model="form.companyAddress"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="مثال: مصر - القاهرة - مدينة نصر - شارع التسعين"
              />
              <p class="text-xs text-gray-500 mt-1">العنوان الكامل للشركة ليظهر على الفواتير</p>
            </div>
          </div>
        </div>

        <!-- Account Information Section -->
        <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h2 class="text-lg font-bold text-gray-800">معلومات الحساب</h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Full Name -->
            <div>
              <label class="block text-gray-700 text-sm font-semibold mb-2">الاسم الكامل <span class="text-red-500">*</span></label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="أدخل اسمك الكامل"
                :class="{ 'border-red-500': errors.name }"
              />
              <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-gray-700 text-sm font-semibold mb-2">رقم الهاتف <span class="text-red-500">*</span></label>
              <input
                v-model="form.phone"
                type="tel"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="05XXXXXXXX"
                :class="{ 'border-red-500': errors.phone }"
              />
              <p v-if="errors.phone" class="text-red-500 text-xs mt-1">{{ errors.phone }}</p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-gray-700 text-sm font-semibold mb-2">البريد الإلكتروني <span class="text-red-500">*</span></label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="example@company.com"
                :class="{ 'border-red-500': errors.email }"
              />
              <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-gray-700 text-sm font-semibold mb-2">كلمة المرور <span class="text-red-500">*</span></label>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="••••••••"
                :class="{ 'border-red-500': errors.password }"
              />
              <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
              <p class="text-xs text-gray-500 mt-1">يجب أن تكون كلمة المرور 6 أحرف على الأقل</p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-gray-700 text-sm font-semibold mb-2">تأكيد كلمة المرور <span class="text-red-500">*</span></label>
              <input
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="••••••••"
                :class="{ 'border-red-500': errors.confirmPassword }"
              />
              <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">{{ errors.confirmPassword }}</p>
            </div>
          </div>

          <!-- Show Password Toggle -->
          <div class="flex gap-4 mt-4">
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" v-model="showPassword" class="ml-2" />
              <span class="text-sm text-gray-600">إظهار كلمة المرور</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" v-model="showConfirmPassword" class="ml-2" />
              <span class="text-sm text-gray-600">إظهار تأكيد كلمة المرور</span>
            </label>
          </div>
        </div>

        <!-- Terms & Conditions -->
        <div class="flex items-center">
          <input type="checkbox" v-model="agreeTerms" class="ml-2 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
          <span class="text-sm text-gray-600">
            أوافق على 
            <a href="#" class="text-amber-600 hover:underline">الشروط والأحكام</a> 
            و 
            <a href="#" class="text-amber-600 hover:underline">سياسة الخصوصية</a>
          </span>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="mr-3">
              <p class="text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="mr-3">
              <p class="text-sm text-green-700">{{ successMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading || !agreeTerms"
          class="w-full bg-gradient-to-r from-amber-600 to-green-600 text-white py-2.5 rounded-xl font-semibold hover:from-amber-700 hover:to-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'جاري إنشاء الحساب...' : 'ابدأ التجربة المجانية' }}
        </button>

        <!-- Login Link -->
        <div class="text-center">
          <p class="text-sm text-gray-500">
            لديك حساب بالفعل؟
            <router-link to="/login" class="text-amber-600 hover:text-amber-700 font-medium">
              تسجيل الدخول
            </router-link>
          </p>
        </div>

        <!-- Trial Info -->
        <div class="text-center text-xs text-gray-400 mt-4">
          <p>✨ نسخة تجريبية مجانية لمدة 14 يوماً - صلاحيات مدير كاملة</p>
          <p class="mt-1">💳无需 بطاقة ائتمان - قم بإلغاء الاشتراك في أي وقت</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeTerms = ref(false)

const form = reactive({
  companyName: '',
  taxNumber: '',
  companyPhone: '',
  companyEmail: '',
  companyAddress: '',
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
    errors.companyName = 'اسم الشركة مطلوب'
    isValid = false
  } else {
    errors.companyName = ''
  }
  
  if (!form.name.trim()) {
    errors.name = 'الاسم مطلوب'
    isValid = false
  } else if (form.name.length < 2) {
    errors.name = 'الاسم يجب أن يكون حرفين على الأقل'
    isValid = false
  } else {
    errors.name = ''
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email) {
    errors.email = 'البريد الإلكتروني مطلوب'
    isValid = false
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'يرجى إدخال بريد إلكتروني صحيح'
    isValid = false
  } else {
    errors.email = ''
  }
  
  if (!form.phone) {
    errors.phone = 'رقم الهاتف مطلوب'
    isValid = false
  } else {
    errors.phone = ''
  }
  
  if (!form.password) {
    errors.password = 'كلمة المرور مطلوبة'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    isValid = false
  } else {
    errors.password = ''
  }
  
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'كلمة المرور وتأكيدها غير متطابقين'
    isValid = false
  } else {
    errors.confirmPassword = ''
  }
  
  return isValid
}

// Generate a unique slug (using tenantId to ensure uniqueness)
const generateUniqueSlug = (): string => {
  const randomPart = Math.random().toString(36).substring(2, 10)
  const timePart = Date.now().toString(36)
  return `${randomPart}-${timePart}`
}

async function handleSubmit() {
  if (!validateForm()) return
  if (!agreeTerms.value) {
    errorMessage.value = 'يرجى الموافقة على الشروط والأحكام'
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
    
    // Prepare settings object with invoice information
    const settings = {
      tax_number: form.taxNumber || null,
      company_phone: form.companyPhone || null,
      company_email: form.companyEmail || null,
      company_address: form.companyAddress || null,
      // Keep old field names for compatibility
      phone: form.companyPhone || null,
      email: form.companyEmail || null,
      address: form.companyAddress || null,
      taxNumber: form.taxNumber || null
    }
    
    // FIRST: Create the auth user
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
    
    // SECOND: Create the tenant with settings
    const { error: tenantError } = await supabase
      .from('tenants')
      .insert({
        id: tenantId,
        name: form.companyName,
        slug: slug,
        settings: settings, // Store invoice information in settings
        is_trial: true,
        trial_ends_at: trialEndsAt.toISOString(),
        is_trial_expired: false,
        created_at: new Date().toISOString(),
      })
    
    if (tenantError) {
      console.error('Tenant creation error:', tenantError)
      await supabase.auth.signOut()
      throw new Error(tenantError.message)
    }
    
    // THIRD: Create the user profile
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
    
    successMessage.value = '🎉 تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول والبدء في استخدام النظام لمدة 14 يوماً مجاناً.'
    
    await supabase.auth.signOut()
    
    setTimeout(() => {
      router.push('/login')
    }, 3000)
    
  } catch (err: any) {
    console.error('Registration error:', err)
    
    if (err.message.includes('already registered')) {
      errorMessage.value = 'هذا البريد الإلكتروني مسجل بالفعل'
    } else if (err.message.includes('password')) {
      errorMessage.value = 'كلمة المرور ضعيفة جداً'
    } else {
      errorMessage.value = err.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى'
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
  text-align: right;
  padding-right: 1rem;
  padding-left: 1rem;
}

@media (max-width: 640px) {
  .logo-image {
    width: 60px;
    height: 60px;
  }
  
  .bg-white {
    padding: 1.5rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
}
</style>