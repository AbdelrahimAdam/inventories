<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-200 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="bg-white border border-amber-100 rounded-2xl shadow-2xl p-8 w-full max-w-md hover:shadow-3xl transition-shadow duration-300">
      
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
          مرحباً بعودتك! يرجى تسجيل الدخول إلى حسابك
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin">
        
        <!-- Email -->
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-semibold mb-2">
            البريد الإلكتروني
          </label>
          <div class="relative">
            <input
              type="email"
              v-model="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition pl-10"
              placeholder="admin@example.com"
              required
              autocomplete="email"
            />
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
        </div>

        <!-- Password -->
        <div class="mb-4 relative">
          <label class="block text-gray-700 text-sm font-semibold mb-2">
            كلمة المرور
          </label>

          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition pl-10"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <!-- Toggle Button -->
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute left-3 bottom-2.5 text-gray-500 hover:text-amber-700 text-sm"
          >
            {{ showPassword ? 'إخفاء' : 'إظهار' }}
          </button>
        </div>

        <!-- Options -->
        <div class="flex items-center justify-between mb-6">
          <label class="flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="rememberMe"
              class="mr-2 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <span class="text-sm text-gray-600">تذكرني</span>
          </label>

          <router-link
            to="/forgot-password"
            class="text-sm text-amber-700 hover:underline font-medium"
          >
            نسيت كلمة المرور؟
          </router-link>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full bg-gradient-to-r from-amber-600 to-green-600 text-white py-2.5 rounded-xl font-semibold hover:from-amber-700 hover:to-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ authStore.isLoading ? 'جاري الدخول...' : 'تسجيل الدخول' }}
        </button>

        <!-- Error -->
        <p v-if="authStore.error" class="mt-4 text-red-600 text-sm text-center">
          {{ authStore.error }}
        </p>
      </form>

      <!-- Footer - No Register Link -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500">
          تم إنشاء حسابك بواسطة مدير النظام
        </p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

async function handleLogin() {
  const success = await authStore.login({
    email: email.value,
    password: password.value,
  })

  if (rememberMe.value) {
    localStorage.setItem('remember_email', email.value)
  } else {
    localStorage.removeItem('remember_email')
  }

  if (success && authStore.isAuthenticated) {
    // Role-based redirect to dedicated dashboards
    if (authStore.isSuperAdmin) {
      router.push('/super-admin/dashboard')
    } else if (authStore.isCompanyManager) {
      router.push('/admin/dashboard')
    } else if (authStore.isWarehouseManager) {
      router.push('/warehouse-manager/dashboard')
    } else if (authStore.isViewer) {
      router.push('/viewer/dashboard')
    } else {
      // Fallback for any other role
      router.push('/inventory/items')
    }
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%23d4a574" stroke-width="2"%3E%3Cpath d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"%3E%3C/path%3E%3C/svg%3E'
}

onMounted(async () => {
  const savedEmail = localStorage.getItem('remember_email')
  if (savedEmail) email.value = savedEmail

  await authStore.checkAuth()

  if (authStore.isAuthenticated) {
    // Role-based redirect to dedicated dashboards
    if (authStore.isSuperAdmin) {
      router.push('/super-admin/dashboard')
    } else if (authStore.isCompanyManager) {
      router.push('/admin/dashboard')
    } else if (authStore.isWarehouseManager) {
      router.push('/warehouse-manager/dashboard')
    } else if (authStore.isViewer) {
      router.push('/viewer/dashboard')
    } else {
      // Fallback for any other role
      router.push('/inventory/items')
    }
  }
})
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

/* Shadow effect on hover */
.bg-white {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 40px -12px rgba(0, 0, 0, 0.25);
}

/* RTL support for input icons */
input.pl-10 {
  padding-left: 2.5rem;
}

[dir="rtl"] input.pl-10 {
  padding-left: 1rem;
  padding-right: 2.5rem;
}

[dir="rtl"] .absolute.left-3 {
  left: auto;
  right: 0.75rem;
}

/* Responsive adjustments */
@media (max-width: 480px) {
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