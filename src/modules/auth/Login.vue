<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 to-emerald-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="bg-white border border-green-100 rounded-2xl shadow-2xl p-8 w-full max-w-md">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-extrabold text-green-800 tracking-wide">
          Inventories
        </h1>
        <p class="text-gray-500 mt-2">
          Welcome back! Please login to your account
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin">
        
        <!-- Email -->
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-semibold mb-2">
            Email Address
          </label>
          <input
            type="email"
            v-model="email"
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            placeholder="admin@example.com"
            required
            autocomplete="email"
          />
        </div>

        <!-- Password -->
        <div class="mb-4 relative">
          <label class="block text-gray-700 text-sm font-semibold mb-2">
            Password
          </label>

          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition pr-12"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />

          <!-- Toggle -->
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-9 text-gray-500 hover:text-green-700 text-sm"
          >
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>

        <!-- Options -->
        <div class="flex items-center justify-between mb-6">
          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="rememberMe"
              class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span class="text-sm text-gray-600">Remember me</span>
          </label>

          <router-link
            to="/forgot-password"
            class="text-sm text-green-700 hover:underline font-medium"
          >
            Forgot password?
          </router-link>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full bg-green-700 text-white py-2.5 rounded-xl font-semibold hover:bg-green-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ authStore.isLoading ? 'Logging in...' : 'Login' }}
        </button>

        <!-- Error -->
        <p v-if="authStore.error" class="mt-4 text-red-600 text-sm text-center">
          {{ authStore.error }}
        </p>
      </form>

      <!-- Footer -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <router-link
            to="/register"
            class="text-green-700 hover:underline font-medium"
          >
            Register here
          </router-link>
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
    if (authStore.isSuperAdmin) {
      router.push('/super-admin/dashboard')
    } else {
      router.push('/admin/dashboard')
    }
  }
}

onMounted(async () => {
  const savedEmail = localStorage.getItem('remember_email')
  if (savedEmail) email.value = savedEmail

  await authStore.checkAuth()

  if (authStore.isAuthenticated) {
    if (authStore.isSuperAdmin) {
      router.push('/super-admin/dashboard')
    } else {
      router.push('/admin/dashboard')
    }
  }
})
</script>