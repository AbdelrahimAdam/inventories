<template>
  <div 
    class="toast-container"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="[
        'toast-message',
        `toast-${toast.type}`,
        { 'toast-rtl': isRTL }
      ]"
    >
      <!-- Icon -->
      <div class="toast-icon-wrapper">
        <svg v-if="toast.type === 'success'" class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else-if="toast.type === 'error'" class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <svg v-else-if="toast.type === 'warning'" class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <svg v-else class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <!-- Message -->
      <span class="toast-message-text">{{ toast.message }}</span>

      <!-- Close Button -->
      <button 
        @click="removeToast(toast.id)" 
        class="toast-close-btn"
        aria-label="إغلاق الإشعار"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

const languageStore = useLanguageStore()
const isRTL = computed(() => languageStore.direction === 'rtl')

const toasts = ref<Toast[]>([])
let nextId = 0
let toastTimeouts: Map<number, ReturnType<typeof setTimeout>> = new Map()

const addToast = (
  message: string, 
  type: Toast['type'] = 'info', 
  duration: number = 4000
) => {
  const id = nextId++
  toasts.value.push({ id, message, type })
  
  // Auto-dismiss after duration
  const timeout = setTimeout(() => {
    removeToast(id)
  }, duration)
  
  toastTimeouts.set(id, timeout)
}

const removeToast = (id: number) => {
  // Clear timeout if exists
  if (toastTimeouts.has(id)) {
    clearTimeout(toastTimeouts.get(id))
    toastTimeouts.delete(id)
  }
  
  toasts.value = toasts.value.filter(t => t.id !== id)
}

// Clear all toasts
const clearAllToasts = () => {
  toastTimeouts.forEach((timeout) => clearTimeout(timeout))
  toastTimeouts.clear()
  toasts.value = []
}

// Expose methods globally
onMounted(() => {
  ;(window as any).toast = { 
    addToast, 
    removeToast, 
    clearAllToasts 
  }
})

onUnmounted(() => {
  clearAllToasts()
  delete (window as any).toast
})

// Also expose via provide/inject if needed
defineExpose({
  addToast,
  removeToast,
  clearAllToasts
})
</script>

<style scoped>
/* ===== CONTAINER ===== */
.toast-container {
  position: fixed;
  bottom: 5.5rem;
  right: 1rem;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 28rem;
  width: 100%;
  pointer-events: none;
}

@media (min-width: 640px) {
  .toast-container {
    bottom: 1.5rem;
    right: 1.5rem;
    max-width: 380px;
  }
}

@media (min-width: 1024px) {
  .toast-container {
    bottom: 2rem;
    right: 2rem;
    max-width: 420px;
  }
}

/* RTL Support */
.toast-container.toast-rtl {
  right: auto;
  left: 1rem;
}

@media (min-width: 640px) {
  .toast-container.toast-rtl {
    left: 1.5rem;
    right: auto;
  }
}

@media (min-width: 1024px) {
  .toast-container.toast-rtl {
    left: 2rem;
    right: auto;
  }
}

/* ===== TOAST MESSAGE ===== */
.toast-message {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.06);
  animation: slideInRight 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  min-height: 52px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

@media (min-width: 640px) {
  .toast-message {
    padding: 0.875rem 1.25rem;
    min-height: 56px;
  }
}

/* RTL Animation */
.toast-message.toast-rtl {
  animation: slideInLeft 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

/* ===== TOAST TYPES ===== */
.toast-success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.toast-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.toast-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.toast-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

/* Dark Mode */
.dark .toast-success {
  background: linear-gradient(135deg, #22c55e, #15803d);
}

.dark .toast-error {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
}

.dark .toast-warning {
  background: linear-gradient(135deg, #f59e0b, #b45309);
}

.dark .toast-info {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

/* ===== ICON ===== */
.toast-icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: currentColor;
}

@media (min-width: 640px) {
  .toast-icon {
    width: 1.5rem;
    height: 1.5rem;
  }
}

/* ===== MESSAGE ===== */
.toast-message-text {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  min-width: 0;
  word-break: break-word;
}

@media (min-width: 640px) {
  .toast-message-text {
    font-size: 0.9375rem;
  }
}

/* ===== CLOSE BUTTON ===== */
.toast-close-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  min-height: 32px;
  min-width: 32px;
  touch-action: manipulation;
}

.toast-close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.toast-close-btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

/* ===== ANIMATIONS ===== */
@keyframes slideInRight {
  from {
    transform: translateX(120%) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-120%) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateX(120%) scale(0.95);
    opacity: 0;
  }
}

@keyframes slideOutLeft {
  from {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateX(-120%) scale(0.95);
    opacity: 0;
  }
}

/* Exit animations (triggered by remove) */
.toast-message.removing-right {
  animation: slideOutRight 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.toast-message.removing-left {
  animation: slideOutLeft 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

/* ===== REDUCED MOTION ===== */
@media (prefers-reduced-motion: reduce) {
  .toast-message {
    animation: none !important;
    opacity: 1;
  }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .toast-message {
    padding: 0.625rem 0.875rem;
    border-radius: 0.625rem;
    min-height: 44px;
  }
  
  .toast-message-text {
    font-size: 0.8125rem;
  }
  
  .toast-icon {
    width: 1rem;
    height: 1rem;
  }
  
  .toast-close-btn {
    min-height: 28px;
    min-width: 28px;
  }
}

/* ===== SAFE AREA ===== */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .toast-container {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
}
</style>