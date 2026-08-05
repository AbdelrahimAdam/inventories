<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-full"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-full"
  >
    <div
      v-if="!isOnline"
      class="offline-banner"
      role="alert"
      aria-live="polite"
    >
      <div class="offline-banner-content">
        <!-- Icon -->
        <div class="offline-banner-icon-wrapper">
          <svg class="offline-banner-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636L5.636 18.364m0-12.728l12.728 12.728" />
          </svg>
        </div>

        <!-- Message -->
        <span class="offline-banner-message">
          {{ isRTL ? '⚠️ أنت غير متصل بالإنترنت. بعض الميزات قد لا تكون متاحة.' : '⚠️ You are offline. Some features may be unavailable.' }}
        </span>

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
  
  // If we just came back online, reset dismissed state
  if (wasOffline && isOnline.value) {
    isDismissed.value = false
    isReconnecting.value = false
  }
}

const retryConnection = () => {
  isReconnecting.value = true
  
  // Attempt to reload the page after a short delay
  setTimeout(() => {
    if (!navigator.onLine) {
      isReconnecting.value = false
      // Could also try to ping a known endpoint here
    } else {
      isReconnecting.value = false
      isDismissed.value = false
    }
  }, 2000)
}

const dismissBanner = () => {
  isDismissed.value = false
  // Only dismiss if we're still offline
  if (!isOnline.value) {
    isDismissed.value = true
  }
}

// Check online status periodically (every 30 seconds)
let intervalId: ReturnType<typeof setInterval> | null = null

const startPolling = () => {
  intervalId = setInterval(() => {
    // Just trigger a status update without reloading
    const wasOffline = !isOnline.value
    const currentStatus = navigator.onLine
    
    if (wasOffline && currentStatus) {
      // Came back online
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
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding: 0.625rem 1rem;
}

@media (min-width: 640px) {
  .offline-banner {
    padding: 0.75rem 1.5rem;
  }
}

/* Dark Mode */
.dark .offline-banner {
  background: linear-gradient(135deg, #b45309, #92400e);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
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
    gap: 1rem;
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
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  padding: 0.375rem;
  width: 2rem;
  height: 2rem;
}

@media (min-width: 640px) {
  .offline-banner-icon-wrapper {
    width: 2.25rem;
    height: 2.25rem;
    padding: 0.5rem;
  }
}

.offline-banner-icon {
  width: 1rem;
  height: 1rem;
  color: white;
}

@media (min-width: 640px) {
  .offline-banner-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}

/* ===== MESSAGE ===== */
.offline-banner-message {
  flex: 1;
  color: white;
  font-size: 0.8125rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.5;
  min-width: 120px;
}

@media (min-width: 640px) {
  .offline-banner-message {
    font-size: 0.875rem;
    text-align: left;
  }
}

[dir="rtl"] .offline-banner-message {
  text-align: center;
}

@media (min-width: 640px) {
  [dir="rtl"] .offline-banner-message {
    text-align: right;
  }
}

/* ===== RETRY BUTTON ===== */
.offline-banner-retry-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 32px;
  min-width: 44px;
  touch-action: manipulation;
  white-space: nowrap;
}

@media (min-width: 640px) {
  .offline-banner-retry-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    min-height: 36px;
  }
}

.offline-banner-retry-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.02);
}

.offline-banner-retry-btn:active {
  transform: scale(0.97);
}

.offline-banner-retry-btn svg {
  flex-shrink: 0;
}

/* ===== SPINNER ===== */
.offline-banner-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  min-width: 44px;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
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
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 32px;
  min-width: 32px;
  touch-action: manipulation;
}

.offline-banner-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.offline-banner-close-btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .offline-banner {
    padding: 0.5rem 0.75rem;
  }
  
  .offline-banner-message {
    font-size: 0.75rem;
  }
  
  .offline-banner-retry-btn {
    padding: 0.25rem 0.625rem;
    font-size: 0.6875rem;
    min-height: 28px;
  }
  
  .offline-banner-icon-wrapper {
    width: 1.5rem;
    height: 1.5rem;
    padding: 0.25rem;
  }
  
  .offline-banner-icon {
    width: 0.875rem;
    height: 0.875rem;
  }
  
  .offline-banner-close-btn {
    min-height: 28px;
    min-width: 28px;
  }
}

/* ===== SAFE AREA ===== */
@supports (padding-top: env(safe-area-inset-top)) {
  .offline-banner {
    padding-top: calc(0.625rem + env(safe-area-inset-top));
  }
  
  @media (min-width: 640px) {
    .offline-banner {
      padding-top: calc(0.75rem + env(safe-area-inset-top));
    }
  }
}
</style>