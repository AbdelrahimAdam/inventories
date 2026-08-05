<template>
  <div 
    ref="containerRef"
    class="language-switcher relative"
    :dir="languageStore.direction"
  >
    <button
      ref="triggerRef"
      @click="toggleDropdown"
      @keydown.enter="toggleDropdown"
      @keydown.space.prevent="toggleDropdown"
      class="language-switcher-trigger"
      :aria-expanded="showDropdown"
      aria-haspopup="true"
      :aria-label="isRTL ? 'تغيير اللغة' : 'Change language'"
      type="button"
    >
      <span class="language-switcher-flag">{{ currentFlag }}</span>
      <span class="language-switcher-label">{{ currentLabel }}</span>
      <svg 
        class="language-switcher-arrow"
        :class="{ 'rotate-180': showDropdown }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown -->
    <div
      v-if="showDropdown"
      ref="dropdownRef"
      class="language-switcher-dropdown"
      :class="[
        isRTL ? 'language-switcher-dropdown-left' : 'language-switcher-dropdown-right'
      ]"
      role="menu"
      aria-orientation="vertical"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="switchLanguage(lang.code as 'en' | 'ar')"
        @keydown.enter="switchLanguage(lang.code as 'en' | 'ar')"
        class="language-switcher-item"
        :class="{
          'language-switcher-item-active': languageStore.current === lang.code
        }"
        role="menuitem"
        :aria-current="languageStore.current === lang.code ? 'true' : undefined"
      >
        <span class="language-switcher-item-flag">{{ lang.flag }}</span>
        <span class="language-switcher-item-name">{{ lang.name }}</span>
        <span v-if="languageStore.current === lang.code" class="language-switcher-item-check">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

const containerRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const showDropdown = ref(false)

const isRTL = computed(() => languageStore.direction === 'rtl')

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
]

const currentLabel = computed(() => {
  const lang = languages.find(l => l.code === languageStore.current)
  return lang ? lang.name : 'English'
})

const currentFlag = computed(() => {
  const lang = languages.find(l => l.code === languageStore.current)
  return lang ? lang.flag : '🌐'
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    // Focus the dropdown when opened
    setTimeout(() => {
      const firstItem = dropdownRef.value?.querySelector('button')
      if (firstItem) firstItem.focus()
    }, 50)
  }
}

const switchLanguage = (lang: 'en' | 'ar') => {
  languageStore.switchLanguage(lang)
  showDropdown.value = false
  // Return focus to trigger
  triggerRef.value?.focus()
}

// Close on Escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showDropdown.value) {
    showDropdown.value = false
    triggerRef.value?.focus()
  }
}

// Close on click outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (containerRef.value && !containerRef.value.contains(target)) {
    showDropdown.value = false
  }
}

// Close on scroll
const handleScroll = () => {
  if (showDropdown.value) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('scroll', handleScroll, true)
})
</script>

<style scoped>
/* ===== TRIGGER BUTTON ===== */
.language-switcher-trigger {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
  min-height: 40px;
  min-width: 44px;
  touch-action: manipulation;
}

.language-switcher-trigger:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.language-switcher-trigger:focus-visible {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}

:global(.dark) .language-switcher-trigger {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.05);
}

:global(.dark) .language-switcher-trigger:hover {
  background: rgba(255, 255, 255, 0.1);
}

.language-switcher-flag {
  font-size: 1rem;
  line-height: 1;
}

.language-switcher-label {
  display: none;
}

@media (min-width: 640px) {
  .language-switcher-label {
    display: inline;
  }
}

.language-switcher-arrow {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s ease;
  color: rgba(255, 255, 255, 0.6);
}

.language-switcher-arrow.rotate-180 {
  transform: rotate(180deg);
}

/* ===== DROPDOWN ===== */
.language-switcher-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  min-width: 160px;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0.375rem 0;
  z-index: 50;
  overflow: hidden;
  animation: dropdownSlideDown 0.2s ease-out;
}

:global(.dark) .language-switcher-dropdown {
  background: #1f2937;
  border-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.language-switcher-dropdown-right {
  right: 0;
}

.language-switcher-dropdown-left {
  left: 0;
}

/* ===== DROPDOWN ITEMS ===== */
.language-switcher-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  min-height: 40px;
  touch-action: manipulation;
}

:global(.dark) .language-switcher-item {
  color: #e5e7eb;
}

.language-switcher-item:hover {
  background: #f3f4f6;
}

:global(.dark) .language-switcher-item:hover {
  background: #374151;
}

.language-switcher-item:focus-visible {
  outline: 2px solid #f59e0b;
  outline-offset: -2px;
}

.language-switcher-item-active {
  background: #fef3c7;
  color: #b45309;
}

:global(.dark) .language-switcher-item-active {
  background: #78350f;
  color: #fbbf24;
}

.language-switcher-item-flag {
  font-size: 1.125rem;
  line-height: 1;
}

.language-switcher-item-name {
  flex: 1;
  font-weight: 500;
}

.language-switcher-item-check {
  color: #f59e0b;
  margin-left: auto;
  flex-shrink: 0;
}

:global(.dark) .language-switcher-item-check {
  color: #fbbf24;
}

/* ===== RTL SUPPORT ===== */
:global([dir="rtl"]) .language-switcher-item {
  text-align: right;
}

:global([dir="rtl"]) .language-switcher-item-check {
  margin-left: 0;
  margin-right: auto;
}

:global([dir="rtl"]) .language-switcher-dropdown-left {
  right: 0;
  left: auto;
}

:global([dir="rtl"]) .language-switcher-dropdown-right {
  left: 0;
  right: auto;
}

/* ===== ANIMATIONS ===== */
@keyframes dropdownSlideDown {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ===== REDUCED MOTION ===== */
@media (prefers-reduced-motion: reduce) {
  .language-switcher-dropdown {
    animation: none;
  }
  
  .language-switcher-arrow {
    transition: none;
  }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .language-switcher-trigger {
    padding: 0.25rem 0.5rem;
    min-height: 36px;
    font-size: 0.75rem;
  }
  
  .language-switcher-flag {
    font-size: 0.875rem;
  }
  
  .language-switcher-dropdown {
    min-width: 140px;
  }
  
  .language-switcher-item {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
    min-height: 36px;
  }
}

/* ===== SAFE AREA ===== */
@supports (padding: env(safe-area-inset-top)) {
  .language-switcher-dropdown {
    padding-top: env(safe-area-inset-top, 0.375rem);
    padding-bottom: env(safe-area-inset-bottom, 0.375rem);
  }
}
</style>