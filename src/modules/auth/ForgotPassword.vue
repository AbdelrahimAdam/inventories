<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-primary">{{ $t('app.name') }}</h1>
        <p class="text-gray-600 mt-2">{{ $t('auth.resetInstructions') }}</p>
      </div>

      <form @submit.prevent="handleSubmit" v-if="!submitted">
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">{{ $t('auth.email') }}</label>
          <input
            type="email"
            v-model="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            :class="{ 'border-red-500': error }"
            required
          />
          <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {{ isLoading ? $t('common.loading') : $t('auth.resetButton') }}
        </button>
      </form>

      <div v-else class="text-center">
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{{ successMessage }}</p>
        </div>
        <router-link to="/login" class="text-primary hover:underline">
          {{ $t('auth.loginHere') }}
        </router-link>
      </div>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-sm text-primary hover:underline">
          ← {{ $t('common.back') }} to {{ $t('auth.login') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

const email = ref('')
const isLoading = ref(false)
const error = ref('')
const submitted = ref(false)
const successMessage = ref('')

async function handleSubmit() {
  if (!email.value) {
    error.value = 'Email is required'
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    error.value = 'Please enter a valid email address'
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    
    if (resetError) throw resetError
    
    submitted.value = true
    successMessage.value = `Password reset link sent to ${email.value}. Please check your email.`
    
  } catch (err: any) {
    error.value = err.message || 'Failed to send reset email. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>