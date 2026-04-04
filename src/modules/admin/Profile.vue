<template>
  <div class="max-w-4xl mx-auto" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <h1 class="text-2xl font-bold mb-6">{{ $t('nav.profile') }}</h1>
    
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center space-x-4 mb-6" :class="{ 'space-x-reverse': $i18n.locale === 'ar' }">
        <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {{ userInitials }}
        </div>
        <div>
          <h2 class="text-xl font-semibold">{{ user?.name }}</h2>
          <p class="text-gray-600">{{ user?.email }}</p>
          <p class="text-sm text-gray-500">{{ $t('common.role') }}: {{ user?.role }}</p>
        </div>
      </div>
      
      <form @submit.prevent="updateProfile" class="space-y-4">
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2">{{ $t('common.name') }}</label>
          <input
            type="text"
            v-model="form.name"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2">{{ $t('auth.email') }}</label>
          <input
            type="email"
            v-model="form.email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            disabled
          />
        </div>
        
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="isLoading"
            class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            {{ isLoading ? $t('common.loading') : $t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/services/supabase'

const authStore = useAuthStore()
const isLoading = ref(false)

const user = computed(() => authStore.user)
const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const form = reactive({
  name: '',
  email: '',
})

const updateProfile = async () => {
  isLoading.value = true
  
  try {
    const { error } = await supabase
      .from('users')
      .update({ name: form.name })
      .eq('id', user.value?.id)
    
    if (error) throw error
    
    // Update local store
    if (authStore.user) {
      authStore.user.name = form.name
    }
    
    alert('Profile updated successfully!')
  } catch (err: any) {
    alert('Error: ' + err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (user.value) {
    form.name = user.value.name
    form.email = user.value.email
  }
})
</script>