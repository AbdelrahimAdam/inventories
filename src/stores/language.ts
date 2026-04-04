import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Language } from '@/types/language'

export const useLanguageStore = defineStore('language', () => {
  const current = ref<Language>('en')
  const direction = computed(() => current.value === 'ar' ? 'rtl' : 'ltr')
  
  // Load saved language from localStorage
  const loadSavedLanguage = (): void => {
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'en' || saved === 'ar')) {
      current.value = saved
      applyLanguage(saved)
    }
  }
  
  // Apply language to DOM
  const applyLanguage = (lang: Language): void => {
    // Set HTML dir attribute for RTL/LTR
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
    
    // Set body class for RTL specific styles
    if (lang === 'ar') {
      document.body.classList.add('rtl')
      document.body.classList.remove('ltr')
    } else {
      document.body.classList.add('ltr')
      document.body.classList.remove('rtl')
    }
    
    // Save to localStorage
    localStorage.setItem('language', lang)
  }
  
  // Switch language
  const switchLanguage = (lang: Language): void => {
    if (current.value === lang) return
    current.value = lang
    applyLanguage(lang)
    
    // Reload page to refresh all translations (optional)
    // window.location.reload()
  }
  
  // Initialize
  loadSavedLanguage()
  
  // Watch for changes
  watch(current, (newLang) => {
    applyLanguage(newLang)
  })
  
  return {
    current,
    direction,
    switchLanguage,
    isRTL: computed(() => current.value === 'ar'),
  }
})