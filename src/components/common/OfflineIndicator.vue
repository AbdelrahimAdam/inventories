<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 -translate-y-full"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-400 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-full"
  >
    <div
      v-if="!isOnline && !isDismissed"
      class="offline-banner"
      role="alert"
      aria-live="polite"
    >
      <div class="offline-banner-content">
        <!-- Perfume Icon -->
        <div class="offline-banner-icon-wrapper">
          <svg class="offline-banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <!-- Perfume bottle outline -->
            <rect x="8" y="4" width="8" height="16" rx="2" stroke="currentColor" />
            <rect x="10" y="2" width="4" height="4" rx="1" stroke="currentColor" />
            <circle cx="12" cy="16" r="2" stroke="currentColor" />
            <!-- Scent lines -->
            <path d="M6 20C6 20 6 18 8 18" stroke="currentColor" stroke-linecap="round" />
            <path d="M18 20C18 20 18 18 16 18" stroke="currentColor" stroke-linecap="round" />
            <path d="M4 22C4 22 4 19 7 19" stroke="currentColor" stroke-linecap="round" stroke-width="1" />
            <path d="M20 22C20 22 20 19 17 19" stroke="currentColor" stroke-linecap="round" stroke-width="1" />
          </svg>
        </div>

        <!-- Message -->
        <div class="offline-banner-message-wrapper">
          <span class="offline-banner-title">
            {{ isRTL ? 'انقطاع الاتصال بالإنترنت' : 'Connection Lost' }}
          </span>
          <span class="offline-banner-message">
            {{ isRTL 
              ? 'عطرك المفضل ينتظرك، لكن الاتصال بالإنترنت مفقود. يرجى التحقق من اتصالك بالشبكة.' 
              : 'Your favorite fragrance awaits, but the connection is missing. Please check your network connection.' 
            }}
          </span>
        </div>

        <!-- Retry Button -->
        <button
          v-if="!isReconnecting"
          @click="retryConnection"
          class="offline-banner-retry-btn"
          aria-label="إعادة المحاولة"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ isRTL ? 'إعادة المحاولة' : 'Retry' }}</span>
        </button>

        <!-- Reconnecting Spinner -->
        <div v-else class="offline-banner-spinner" aria-label="جاري إعادة الاتصال">
          <div class="spinner"></div>
          <span class="offline-banner-spinner-text">{{ isRTL ? 'جاري إعادة الاتصال...' : 'Reconnecting...' }}</span>
        </div>

        <!-- Close Button -->
        <button
          @click="dismissBanner"
          class="offline-banner-close-btn"
          aria-label="إغلاق"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const isRTL = computed(() => languageStore.direction === 'rtl')

const isOnline = ref(navigator.onLine)
const isReconnecting = ref(false)
const isDismissed = ref(false)

const updateOnlineStatus = () => {
  const wasOffline = !isOnline.value
  isOnline.value = navigator.onLine
  
  if (wasOffline && isOnline.value) {
    isDismissed.value = false
    isReconnecting.value = false
  }
}

const retryConnection = () => {
  isReconnecting.value = true
  
  setTimeout(() => {
    if (!navigator.onLine) {
      isReconnecting.value = false
    } else {
      isReconnecting.value = false
      isDismissed.value = false
    }
  }, 2000)
}

const dismissBanner = () => {
  if (!isOnline.value) {
    isDismissed.value = true
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null

const startPolling = () => {
  intervalId = setInterval(() => {
    const wasOffline = !isOnline.value
    const currentStatus = navigator.onLine
    
    if (wasOffline && currentStatus) {
      isDismissed.value = false
    }
    
    isOnline.value = currentStatus
  }, 30000)
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  startPolling()
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
})
</script>

<style scoped>
/* ===== BANNER ===== */
.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-bottom: 2px solid rgba(212, 165, 116, 0.3);
  padding: 0.75rem 1rem;
  backdrop-filter: blur(10px);
}

@media (min-width: 640px) {
  .offline-banner {
    padding: 0.875rem 1.5rem;
  }
}

/* Dark Mode - Already dark, but keep consistent */
.dark .offline-banner {
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  border-bottom-color: rgba(212, 165, 116, 0.2);
}

/* ===== CONTENT ===== */
.offline-banner-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  max-width: 80rem;
  margin: 0 auto;
  flex-wrap: wrap;
}

@media (min-width: 640px) {
  .offline-banner-content {
    gap: 1.25rem;
    flex-wrap: nowrap;
  }
}

[dir="rtl"] .offline-banner-content {
  flex-direction: row-reverse;
}

/* ===== ICON ===== */
.offline-banner-icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.15), rgba(212, 165, 116, 0.05));
  border: 1px solid rgba(212, 165, 116, 0.2);
  border-radius: 50%;
  padding: 0.5rem;
  width: 2.75rem;
  height: 2.75rem;
  box-shadow: 0 0 30px rgba(212, 165, 116, 0.05);
}

@media (min-width: 640px) {
  .offline-banner-icon-wrapper {
    width: 3rem;
    height: 3rem;
    padding: 0.625rem;
  }
}

.offline-banner-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #d4a574;
}

@media (min-width: 640px) {
  .offline-banner-icon {
    width: 1.5rem;
    height: 1.5rem;
  }
}

/* ===== MESSAGE ===== */
.offline-banner-message-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 100px;
}

.offline-banner-title {
  color: #d4a574;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

@media (min-width: 640px) {
  .offline-banner-title {
    font-size: 0.875rem;
  }
}

.offline-banner-message {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.4;
}

@media (min-width: 640px) {
  .offline-banner-message {
    font-size: 0.8125rem;
  }
}

/* ===== RETRY BUTTON ===== */
.offline-banner-retry-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #d4a574, #b8915a);
  color: #1a1a2e;
  border: none;
  border-radius: 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 36px;
  min-width: 44px;
  touch-action: manipulation;
  white-space: nowrap;
  box-shadow: 0 2px 12px rgba(212, 165, 116, 0.25);
}

@media (min-width: 640px) {
  .offline-banner-retry-btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.8125rem;
    min-height: 40px;
  }
}

.offline-banner-retry-btn:hover {
  background: linear-gradient(135deg, #e0b88a, #c9a06a);
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 20px rgba(212, 165, 116, 0.4);
}

.offline-banner-retry-btn:active {
  transform: scale(0.97);
}

.offline-banner-retry-btn svg {
  flex-shrink: 0;
  color: #1a1a2e;
}

/* ===== SPINNER ===== */
.offline-banner-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  min-width: 44px;
}

.offline-banner-spinner-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  font-weight: 500;
}

@media (min-width: 640px) {
  .offline-banner-spinner-text {
    font-size: 0.8125rem;
  }
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(212, 165, 116, 0.2);
  border-top-color: #d4a574;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .spinner {
    width: 1.5rem;
    height: 1.5rem;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== CLOSE BUTTON ===== */
.offline-banner-close-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 32px;
  min-width: 32px;
  touch-action: manipulation;
}

.offline-banner-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border-color: rgba(255, 255, 255, 0.1);
}

.offline-banner-close-btn:focus-visible {
  outline: 2px solid rgba(212, 165, 116, 0.5);
  outline-offset: 2px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .offline-banner {
    padding: 0.5rem 0.75rem;
  }
  
  .offline-banner-title {
    font-size: 0.7rem;
  }
  
  .offline-banner-message {
    font-size: 0.6875rem;
  }
  
  .offline-banner-retry-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.6875rem;
    min-height: 32px;
    min-width: 40px;
  }
  
  .offline-banner-icon-wrapper {
    width: 2.25rem;
    height: 2.25rem;
    padding: 0.375rem;
  }
  
  .offline-banner-icon {
    width: 1rem;
    height: 1rem;
  }
  
  .offline-banner-close-btn {
    min-height: 28px;
    min-width: 28px;
    padding: 0.25rem;
  }
  
  .offline-banner-spinner-text {
    font-size: 0.6875rem;
  }
}

/* ===== SAFE AREA ===== */
@supports (padding-top: env(safe-area-inset-top)) {
  .offline-banner {
    padding-top: calc(0.75rem + env(safe-area-inset-top));
  }
  
  @media (min-width: 640px) {
    .offline-banner {
      padding-top: calc(0.875rem + env(safe-area-inset-top));
    }
  }
}
</style>