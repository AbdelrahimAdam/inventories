<template>
  <div class="language-switcher relative">
    <button 
      @click="toggleDropdown" 
      class="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      :class="{ 'space-x-reverse': languageStore.isRTL }"
    >
      <span class="text-sm font-medium">{{ currentLanguageLabel }}</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <div 
      v-if="showDropdown" 
      class="absolute mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 min-w-[120px]"
      :class="{ 'right-0': !languageStore.isRTL, 'left-0': languageStore.isRTL }"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="switchLanguage(lang.code)"
        class="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        :class="{ 'text-primary': languageStore.current === lang.code }"
      >
        <div class="flex items-center space-x-2" :class="{ 'space-x-reverse': languageStore.isRTL }">
          <span>{{ lang.flag }}</span>
          <span>{{ lang.name }}</span>
          <span v-if="languageStore.current === lang.code" class="ml-auto">
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const showDropdown = ref(false)

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
]

const currentLanguageLabel = computed(() => {
  const lang = languages.find(l => l.code === languageStore.current)
  return lang ? `${lang.flag} ${lang.name}` : '🌐'
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const switchLanguage = (code: 'en' | 'ar') => {
  languageStore.switchLanguage(code)
  showDropdown.value = false
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!(e.target as Element).closest('.language-switcher')) {
    showDropdown.value = false
  }
})
</script>