<template>
  <header class="bg-white shadow-sm" :dir="languageStore.direction">
    <div class="px-6 py-4 flex justify-between items-center">
      <div class="flex items-center" :class="{ 'space-x-reverse': languageStore.isRTL, 'space-x-4': !languageStore.isRTL }">
        <button @click="toggleSidebar" class="lg:hidden">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-xl font-bold text-primary">{{ $t('app.name') }}</h1>
      </div>
      
      <div class="flex items-center" :class="{ 'space-x-reverse': languageStore.isRTL, 'space-x-4': !languageStore.isRTL }">
        <LanguageSwitcher />
        
        <div class="relative">
          <button @click="toggleDropdown" class="flex items-center" :class="{ 'space-x-reverse': languageStore.isRTL, 'space-x-2': !languageStore.isRTL }">
            <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              {{ userInitials }}
            </div>
            <span class="hidden md:inline">{{ user?.name }}</span>
          </button>
          
          <div 
            v-if="showDropdown" 
            class="absolute mt-2 bg-white rounded-md shadow-lg py-1 z-10 min-w-[160px]"
            :class="{ 'right-0': !languageStore.isRTL, 'left-0': languageStore.isRTL }"
          >
            <router-link to="/profile" class="block px-4 py-2 text-sm hover:bg-gray-100">
              {{ $t('nav.profile') }}
            </router-link>
            <router-link to="/settings" class="block px-4 py-2 text-sm hover:bg-gray-100">
              {{ $t('nav.settings') }}
            </router-link>
            <hr class="my-1">
            <button @click="$emit('logout')" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
              {{ $t('nav.logout') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import LanguageSwitcher from './LanguageSwitcher.vue'

defineEmits<{
  (e: 'logout'): void
  (e: 'toggle-sidebar'): void
}>()

const authStore = useAuthStore()
const languageStore = useLanguageStore()
const showDropdown = ref(false)

const user = computed(() => authStore.user)
const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!(e.target as Element).closest('.relative')) {
    showDropdown.value = false
  }
})
</script>