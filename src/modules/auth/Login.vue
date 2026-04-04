<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Luxury Perfume SaaS</h1>
        <p class="text-gray-600 mt-2">Welcome back! Please login to your account</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
          <input
            type="email"
            v-model="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="admin@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            v-model="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <div class="flex items-center justify-between mb-6">
          <label class="flex items-center">
            <input type="checkbox" v-model="rememberMe" class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500">
            <span class="text-sm text-gray-600">Remember me</span>
          </label>
          <router-link to="/forgot-password" class="text-sm text-green-600 hover:underline">
            Forgot password?
          </router-link>
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ authStore.isLoading ? 'Logging in...' : 'Login' }}
        </button>

        <p v-if="authStore.error" class="mt-4 text-red-600 text-sm text-center">
          {{ authStore.error }}
        </p>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <router-link to="/register" class="text-green-600 hover:underline">Register here</router-link>
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

async function handleLogin() {
  const success = await authStore.login({
    email: email.value,
    password: password.value,
    remember: rememberMe.value,
  })
  
  if (success && authStore.isAuthenticated) {
    if (authStore.isSuperAdmin) {
      router.push('/super-admin/dashboard')
    } else {
      router.push('/admin/dashboard')
    }
  }
}

onMounted(async () => {
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